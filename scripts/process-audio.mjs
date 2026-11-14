#!/usr/bin/env node
/**
 * Tremola Studio media pipeline.
 *
 *   node scripts/process-audio.mjs [--src media-source] [--out media-build] [--upload] [--only <id>]
 *
 * Audio  (media-source/audio/<id>.{wav,aif,aiff,flac,mp3,m4a}):
 *   1. two-pass EBU R128 loudness normalisation to -16 LUFS integrated, true peak ≤ -1.5 dBTP
 *      (0.5 dB headroom under the -1 dBTP target for lossy-encoder overshoot),
 *   2. web MP3 (192 kbps CBR, 44.1 kHz) + Opus in WebM (96 kbps) for browsers that support it,
 *   3. 64 waveform peaks (0–1) as JSON for the player,
 *   4. measures the encoded MP3 again and fails if it misses the targets.
 * Video  (media-source/video/<id>.{mov,mp4,mkv,webm}):
 *   H.264 MP4 (faststart, no audio track: players are muted and audio comes separately)
 *   + a poster JPEG and WebP taken at 1 s.
 *
 * Output file names carry a content hash so they can be cached forever (immutable).
 * The manifest src/content/media-manifest.json is rewritten with paths, durations and peaks.
 * --upload puts every output file in the R2 bucket MEDIA_BUCKET (default "tremola-media") with wrangler.
 *
 * ffmpeg: set FFMPEG=<path> or have ffmpeg on PATH. On the studio PC the bundled
 * imageio-ffmpeg binary works (see CLAUDE.md).
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const SRC = opt("src", "media-source");
const OUT = opt("out", "media-build");
const ONLY = opt("only", null);
const UPLOAD = args.includes("--upload");
const BUCKET = process.env.MEDIA_BUCKET ?? "tremola-media";
const FFMPEG = process.env.FFMPEG ?? "ffmpeg";
const MANIFEST = "src/content/media-manifest.json";

const TARGET_I = -16;
const TARGET_TP = -1.5;
const LIMIT_TP = -1.0;
const TARGET_LRA = 11;
const PEAK_BARS = 64;

const AUDIO_EXT = new Set([".wav", ".aif", ".aiff", ".flac", ".mp3", ".m4a"]);
const VIDEO_EXT = new Set([".mov", ".mp4", ".mkv", ".webm"]);

function ff(argv, { binary = false } = {}) {
  const r = spawnSync(FFMPEG, ["-hide_banner", "-nostdin", ...argv], {
    encoding: binary ? "buffer" : "utf8",
    maxBuffer: 1 << 30,
  });
  if (r.error) throw new Error(`ffmpeg not runnable (${FFMPEG}): ${r.error.message}`);
  if (r.status !== 0) {
    const err = binary ? r.stderr.toString() : r.stderr;
    throw new Error(`ffmpeg failed: ${err.split("\n").slice(-6).join("\n")}`);
  }
  return r;
}

const hashOf = (file) => createHash("sha1").update(readFileSync(file)).digest("hex").slice(0, 10);
const label = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

function listInputs(dir, exts) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => exts.has(path.extname(f).toLowerCase()))
    .map((f) => ({ id: path.basename(f, path.extname(f)), file: path.join(dir, f) }))
    .filter((x) => !ONLY || x.id === ONLY)
    .sort((a, b) => a.id.localeCompare(b.id));
}

function measureLoudness(file) {
  const r = ff([
    "-i",
    file,
    "-af",
    `loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=${TARGET_LRA}:print_format=json`,
    "-f",
    "null",
    "-",
  ]);
  const json = r.stderr.slice(r.stderr.lastIndexOf("{"), r.stderr.lastIndexOf("}") + 1);
  return JSON.parse(json);
}

function verify(file) {
  // ebur128 with true-peak metering; parse the summary block.
  const r = ff(["-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"]);
  const summary = r.stderr.slice(r.stderr.lastIndexOf("Summary:"));
  const I = Number(/I:\s+(-?[\d.]+) LUFS/.exec(summary)?.[1]);
  const TP = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(summary)?.[1]);
  return { I, TP };
}

function peaks(file) {
  const { stdout } = ff(["-i", file, "-ac", "1", "-ar", "8000", "-f", "s16le", "-"], {
    binary: true,
  });
  const samples = new Int16Array(stdout.buffer, stdout.byteOffset, Math.floor(stdout.length / 2));
  const size = Math.max(1, Math.floor(samples.length / PEAK_BARS));
  const bars = [];
  for (let i = 0; i < PEAK_BARS; i++) {
    let max = 0;
    for (let j = i * size; j < Math.min(samples.length, (i + 1) * size); j++) {
      const v = Math.abs(samples[j]);
      if (v > max) max = v;
    }
    bars.push(max / 32768);
  }
  const top = Math.max(...bars, 1e-4);
  return {
    bars: bars.map((v) => Math.round((v / top) * 100) / 100),
    duration: samples.length / 8000,
  };
}

function processAudio({ id, file }) {
  const h = hashOf(file);
  const base = `audio/${id}.${h}`;
  mkdirSync(path.join(OUT, "audio"), { recursive: true });
  const m = measureLoudness(file);
  const filter =
    `loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=${TARGET_LRA}` +
    `:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}` +
    `:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=summary`;
  const mp3 = path.join(OUT, `${base}.mp3`);
  const opus = path.join(OUT, `${base}.webm`);
  ff([
    "-y",
    "-i",
    file,
    "-af",
    filter,
    "-ar",
    "44100",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "192k",
    "-map_metadata",
    "-1",
    mp3,
  ]);
  ff([
    "-y",
    "-i",
    file,
    "-af",
    filter,
    "-ar",
    "48000",
    "-c:a",
    "libopus",
    "-b:a",
    "96k",
    "-vn",
    "-map_metadata",
    "-1",
    opus,
  ]);
  const check = verify(mp3);
  if (!(Math.abs(check.I - TARGET_I) <= 1 && check.TP <= LIMIT_TP)) {
    throw new Error(`${id}: encoded MP3 misses targets (I=${check.I} LUFS, TP=${check.TP} dBTP)`);
  }
  const p = peaks(mp3);
  const peaksPath = `${base}.peaks.json`;
  writeFileSync(path.join(OUT, peaksPath), JSON.stringify(p.bars));
  console.log(`  audio ${id}: I=${check.I} LUFS, TP=${check.TP} dBTP, ${p.duration.toFixed(2)} s`);
  return {
    mp3: `${base}.mp3`,
    opus: `${base}.webm`,
    peaksPath,
    peaks: p.bars,
    duration: Math.round(p.duration * 100) / 100,
    durationLabel: label(p.duration),
    lufs: check.I,
    truePeak: check.TP,
    source: path.basename(file),
  };
}

function processVideo({ id, file }) {
  const h = hashOf(file);
  const base = `video/${id}.${h}`;
  mkdirSync(path.join(OUT, "video"), { recursive: true });
  const mp4 = path.join(OUT, `${base}.mp4`);
  ff([
    "-y",
    "-i",
    file,
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "23",
    "-pix_fmt",
    "yuv420p",
    "-vf",
    "scale='min(1920,iw)':-2",
    "-movflags",
    "+faststart",
    "-map_metadata",
    "-1",
    mp4,
  ]);
  const poster = path.join(OUT, `${base}.poster.jpg`);
  const posterWebp = path.join(OUT, `${base}.poster.webp`);
  ff(["-y", "-ss", "1", "-i", mp4, "-frames:v", "1", "-q:v", "3", poster]);
  ff([
    "-y",
    "-ss",
    "1",
    "-i",
    mp4,
    "-frames:v",
    "1",
    "-c:v",
    "libwebp",
    "-quality",
    "80",
    posterWebp,
  ]);
  const info = ff(["-i", mp4, "-f", "null", "-"]).stderr;
  const [, w, hgt] = /, (\d{2,5})x(\d{2,5})/.exec(info) ?? [];
  const dur = /Duration: (\d+):(\d+):([\d.]+)/.exec(info);
  const duration = dur ? Number(dur[1]) * 3600 + Number(dur[2]) * 60 + Number(dur[3]) : 0;
  console.log(`  video ${id}: ${w}x${hgt}, ${duration.toFixed(2)} s`);
  return {
    mp4: `${base}.mp4`,
    poster: `${base}.poster.jpg`,
    posterWebp: `${base}.poster.webp`,
    width: Number(w),
    height: Number(hgt),
    duration,
    source: path.basename(file),
  };
}

function upload(files) {
  const types = {
    ".mp3": "audio/mpeg",
    ".webm": "audio/webm",
    ".json": "application/json",
    ".mp4": "video/mp4",
    ".jpg": "image/jpeg",
    ".webp": "image/webp",
  };
  for (const rel of files) {
    const local = path.join(OUT, rel);
    const ct = types[path.extname(rel)] ?? "application/octet-stream";
    const r = spawnSync(
      "npx",
      [
        "-y",
        "wrangler@4",
        "r2",
        "object",
        "put",
        `${BUCKET}/${rel}`,
        "--file",
        local,
        "--remote",
        "--content-type",
        ct,
        "--cache-control",
        process.platform === "win32"
          ? '"public, max-age=31536000, immutable"'
          : "public, max-age=31536000, immutable",
      ],
      { stdio: "inherit", shell: process.platform === "win32" },
    );
    if (r.status !== 0) throw new Error(`upload failed: ${rel}`);
  }
}

const manifest = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : { audio: {}, video: {} };
const produced = [];
console.log(`ffmpeg: ${FFMPEG}`);
for (const input of listInputs(path.join(SRC, "audio"), AUDIO_EXT)) {
  const entry = processAudio(input);
  manifest.audio[input.id] = entry;
  produced.push(entry.mp3, entry.opus, entry.peaksPath);
}
for (const input of listInputs(path.join(SRC, "video"), VIDEO_EXT)) {
  const entry = processVideo(input);
  manifest.video[input.id] = entry;
  produced.push(entry.mp4, entry.poster, entry.posterWebp);
}
manifest.generatedAt = new Date().toISOString();
// Keep each peaks array on one line so manifest diffs stay readable.
const json = JSON.stringify(manifest, null, 2).replace(/"peaks": \[[^\]]*\]/g, (m) =>
  m.replace(/\s+/g, " ").replace("[ ", "[").replace(" ]", "]"),
);
writeFileSync(MANIFEST, json + "\n");
console.log(`manifest: ${MANIFEST} (${produced.length} files in ${OUT}/)`);
if (UPLOAD) upload(produced);
