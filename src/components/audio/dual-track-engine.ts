/**
 * Sample-accurate before/after playback for one video.
 *
 * Both audio tracks are decoded into AudioBuffers and started on the same AudioContext clock, so they
 * can never drift from each other. The before/after switch is a gain crossfade, which works on iOS
 * Safari (where HTMLMediaElement.volume is read-only and the old volume crossfade played both tracks
 * at full level). The muted video follows the audio clock and is nudged back when it drifts.
 *
 * Audio is fetched only on the first play (equivalent of preload="none").
 */
export type Mode = "before" | "after";

type Ctor = typeof AudioContext;
const AudioCtx = (): Ctor | undefined =>
  typeof window === "undefined"
    ? undefined
    : (window.AudioContext ??
      (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext);

export const canUseWebAudio = () => !!AudioCtx();

const FADE_S = 0.3;
const DRIFT_S = 0.12;

export class DualTrackEngine {
  private ctx: AudioContext | null = null;
  private buffers: { before: AudioBuffer; after: AudioBuffer } | null = null;
  private loading: Promise<void> | null = null;
  private gains: { before: GainNode; after: GainNode } | null = null;
  private sources: AudioBufferSourceNode[] = [];
  private startedAt = 0; // ctx time corresponding to offset 0
  private offset = 0; // seconds into the media while paused
  private timer: ReturnType<typeof setInterval> | undefined;
  private mode: Mode = "after";
  playing = false;

  constructor(
    private readonly urls: { before: string; after: string },
    private readonly video: () => HTMLVideoElement | null,
    private readonly onTick: (time: number, duration: number) => void,
    private readonly onEnded: () => void,
  ) {}

  get duration() {
    return this.buffers?.after.duration ?? this.video()?.duration ?? 0;
  }

  get currentTime() {
    return this.playing && this.ctx ? this.ctx.currentTime - this.startedAt : this.offset;
  }

  /** Must be called synchronously inside the user gesture (iOS unlocks audio only there). */
  unlock() {
    if (!this.ctx) {
      const C = AudioCtx();
      if (!C) throw new Error("Web Audio unavailable");
      this.ctx = new C();
      const g = (v: number) => {
        const n = this.ctx!.createGain();
        n.gain.value = v;
        n.connect(this.ctx!.destination);
        return n;
      };
      this.gains = {
        before: g(this.mode === "before" ? 1 : 0),
        after: g(this.mode === "after" ? 1 : 0),
      };
    }
    void this.ctx.resume();
  }

  private load() {
    if (this.buffers) return Promise.resolve();
    if (!this.loading) {
      const ctx = this.ctx!;
      const decode = async (url: string) => {
        const data = await (await fetch(url)).arrayBuffer();
        // Callback form for older Safari.
        return new Promise<AudioBuffer>((res, rej) => ctx.decodeAudioData(data, res, rej));
      };
      this.loading = Promise.all([decode(this.urls.before), decode(this.urls.after)]).then(
        ([before, after]) => {
          this.buffers = { before, after };
        },
      );
    }
    return this.loading;
  }

  async play() {
    this.unlock();
    await this.load();
    const ctx = this.ctx!;
    const { before, after } = this.buffers!;
    if (this.offset >= after.duration - 0.05) this.offset = 0;
    const at = ctx.currentTime + 0.06;
    this.sources = (["before", "after"] as const).map((k) => {
      const s = ctx.createBufferSource();
      s.buffer = k === "before" ? before : after;
      s.connect(this.gains![k]);
      s.start(at, Math.min(this.offset, s.buffer.duration));
      return s;
    });
    this.startedAt = at - this.offset;
    const v = this.video();
    if (v) {
      v.currentTime = this.offset;
      void v.play().catch(() => {});
    }
    this.playing = true;
    clearInterval(this.timer);
    // A timer (not requestAnimationFrame) keeps the video locked even when the tab is in the background.
    this.timer = setInterval(this.loop, 100);
    this.loop();
  }

  pause() {
    if (!this.playing) return;
    this.offset = this.currentTime;
    this.stopSources();
    this.video()?.pause();
    this.playing = false;
    clearInterval(this.timer);
    this.onTick(this.offset, this.duration);
  }

  async seek(seconds: number) {
    const t = Math.max(0, Math.min(seconds, this.duration || seconds));
    if (this.playing) {
      this.stopSources();
      this.playing = false;
      this.offset = t;
      await this.play();
    } else {
      this.offset = t;
      const v = this.video();
      if (v) v.currentTime = t;
      this.onTick(t, this.duration);
    }
  }

  setMode(mode: Mode) {
    this.mode = mode;
    if (!this.ctx || !this.gains) return;
    const now = this.ctx.currentTime;
    for (const k of ["before", "after"] as const) {
      const g = this.gains[k].gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(k === mode ? 1 : 0, now + FADE_S);
    }
  }

  destroy() {
    clearInterval(this.timer);
    this.stopSources();
    void this.ctx?.close();
    this.ctx = null;
  }

  private stopSources() {
    for (const s of this.sources) {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
      s.disconnect();
    }
    this.sources = [];
  }

  private loop = () => {
    if (!this.playing) return;
    const t = this.currentTime;
    const d = this.duration;
    if (d && t >= d) {
      this.pause();
      this.offset = 0;
      this.onEnded();
      return;
    }
    const v = this.video();
    if (v && !v.seeking && t >= 0 && Math.abs(v.currentTime - t) > DRIFT_S) v.currentTime = t;
    this.onTick(Math.max(0, t), d);
  };
}
