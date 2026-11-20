/**
 * Media map. Files are produced by `node scripts/process-audio.mjs` (loudness-normalised MP3 + Opus,
 * waveform peaks, video posters) and listed in media-manifest.json; they live in the Cloudflare R2
 * bucket `tremola-media`, served from VITE_MEDIA_BASE_URL (CDN domain) or `/media` on this site.
 * Replace a placeholder by dropping the master file in media-source/ with the same id and re-running
 * the script (see docs/CONTENT-GUIDE.md).
 */
import type { Track } from "@/components/audio/types";
import manifest from "./media-manifest.json";

type AudioEntry = {
  mp3: string;
  opus?: string;
  peaks?: number[];
  duration: number;
  durationLabel: string;
};
type VideoEntry = { mp4: string; poster: string; posterWebp?: string };
type DemoEntry = { mp4: string; duration: number; durationLabel: string };

const audio = manifest.audio as Record<string, AudioEntry>;
const video = manifest.video as Record<string, VideoEntry>;
const demo = ((manifest as { demo?: unknown }).demo ?? {}) as Record<string, DemoEntry>;

const base = (
  ((import.meta.env as Record<string, string | undefined>)["VITE_MEDIA_BASE_URL"] ?? "") ||
  "/media"
).replace(/\/+$/, "");

export const mediaUrl = (rel: string) => `${base}/${rel}`;

export function audioAsset(id: string) {
  const a = audio[id];
  if (!a) throw new Error(`Unknown audio id "${id}" — run scripts/process-audio.mjs`);
  return {
    src: mediaUrl(a.mp3),
    ...(a.opus ? { srcOpus: mediaUrl(a.opus) } : {}),
    ...(a.peaks ? { peaks: a.peaks } : {}),
    durationLabel: a.durationLabel,
  };
}

export function videoAsset(id: string) {
  const v = video[id];
  if (!v) throw new Error(`Unknown video id "${id}" — run scripts/process-audio.mjs`);
  return { src: mediaUrl(v.mp4), poster: mediaUrl(v.poster) };
}

/** Portfolio demo video (with soundtrack): id = "<slug>-<en|vi>". */
export function demoAsset(id: string) {
  const d = demo[id];
  if (!d) throw new Error(`Unknown demo id "${id}" — run scripts/process-audio.mjs --demos-only`);
  return { src: mediaUrl(d.mp4), duration: d.duration, durationLabel: d.durationLabel };
}

/** Placeholder media — replace with real files. */
export const placeholderMedia = {
  video: videoAsset("placeholder-video").src,
  poster: videoAsset("placeholder-video").poster,
  before: audioAsset("placeholder-before").src,
  after: audioAsset("placeholder-after").src,
};

export const placeholderTrack = (id: string, title: string): Track => {
  const a = audioAsset("placeholder-after");
  return {
    id,
    title,
    src: a.src,
    ...(a.srcOpus ? { srcOpus: a.srcOpus } : {}),
    ...(a.peaks ? { peaks: a.peaks } : {}),
    durationLabel: a.durationLabel,
    placeholder: true,
  };
};
