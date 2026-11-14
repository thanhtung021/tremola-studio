import { Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n";
import { fmtTime, useAudio } from "./AudioProvider";

type Props = {
  video: string;
  poster?: string;
  before: string;
  after: string;
  placeholder?: boolean;
  className?: string;
};

const FADE_MS = 300;

/** One video timeline, two audio tracks, crossfaded without restarting the video. */
export function BeforeAfterPlayer({ video, poster, before, after, placeholder, className }: Props) {
  const vi = useLocale().locale === "vi";
  const id = useId();
  const { claim } = useAudio();
  const vRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLAudioElement>(null);
  const aRef = useRef<HTMLAudioElement>(null);
  const [mode, setMode] = useState<"before" | "after">("after");
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const fadeRaf = useRef(0);

  const tracks = () => [bRef.current!, aRef.current!] as const;

  function pauseAll() {
    vRef.current?.pause();
    tracks().forEach((t) => t?.pause());
    setPlaying(false);
  }

  function fadeTo(next: "before" | "after") {
    const [b, a] = tracks();
    cancelAnimationFrame(fadeRaf.current);
    const from = { b: b.volume, a: a.volume };
    const to = next === "before" ? { b: 1, a: 0 } : { b: 0, a: 1 };
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / FADE_MS);
      b.volume = from.b + (to.b - from.b) * p;
      a.volume = from.a + (to.a - from.a) * p;
      if (p < 1) fadeRaf.current = requestAnimationFrame(step);
    };
    fadeRaf.current = requestAnimationFrame(step);
  }

  function toggleMode() {
    const next = mode === "before" ? "after" : "before";
    setMode(next);
    fadeTo(next);
    track("before_after_toggle", { to: next, page: window.location.pathname });
  }

  async function togglePlay() {
    const v = vRef.current!;
    const [b, a] = tracks();
    if (playing) return pauseAll();
    claim(id, pauseAll);
    b.volume = mode === "before" ? 1 : 0;
    a.volume = mode === "after" ? 1 : 0;
    b.currentTime = a.currentTime = v.currentTime;
    await Promise.allSettled([v.play(), b.play(), a.play()]);
    track("audio_play", { track: "Before / After", page: window.location.pathname });
    setPlaying(true);
  }

  // Keep the audio tracks locked to the video timeline.
  useEffect(() => {
    const v = vRef.current!;
    const onTime = () => {
      setTime(v.currentTime);
      for (const t of tracks())
        if (t && Math.abs(t.currentTime - v.currentTime) > 0.15) t.currentTime = v.currentTime;
    };
    const onMeta = () => setDuration(v.duration);
    const onEnd = () => pauseAll();
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("ended", onEnd);
      cancelAnimationFrame(fadeRaf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function seekTo(s: number) {
    const v = vRef.current!;
    v.currentTime = Math.max(0, Math.min(s, v.duration || s));
    tracks().forEach((t) => (t.currentTime = v.currentTime));
  }

  return (
    <div
      data-audio-playing={playing}
      tabIndex={0}
      aria-label={
        vi
          ? "So sánh âm thanh trước và sau. Nhấn B để chuyển."
          : "Before and after sound comparison. Press B to switch."
      }
      className={cn(
        "card-tremola overflow-hidden outline-none focus-visible:border-gold",
        className,
      )}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget && (e.key === " " || e.key === "Enter")) return;
        if (e.key.toLowerCase() === "b") {
          e.preventDefault();
          toggleMode();
        } else if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          void togglePlay();
        } else if (e.key === "ArrowRight") seekTo(time + 5);
        else if (e.key === "ArrowLeft") seekTo(time - 5);
      }}
    >
      <div className="relative aspect-video bg-raised">
        <video
          ref={vRef}
          src={video}
          poster={poster}
          muted
          playsInline
          preload="none"
          className="size-full object-cover"
        />
        <audio ref={bRef} src={before} preload="none" />
        <audio ref={aRef} src={after} preload="none" />
        {placeholder && (
          <span className="label-mono absolute left-4 top-4 rounded-full border border-hairline bg-background/70 px-3 py-1 text-muted-foreground">
            Placeholder
          </span>
        )}
        {!playing && (
          <button
            type="button"
            onClick={() => void togglePlay()}
            aria-label="Play"
            className="group absolute inset-0 grid cursor-pointer place-items-center"
          >
            <span className="hover-tremolo grid size-20 place-items-center rounded-full border border-muted-foreground bg-background/60 text-muted-foreground backdrop-blur-sm">
              <Play className="size-6 translate-x-0.5" fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4 border-t border-hairline px-4 py-3">
        <button
          type="button"
          onClick={() => void togglePlay()}
          aria-label={playing ? "Pause" : "Play"}
          className={cn(
            "grid size-9 cursor-pointer place-items-center rounded-full border",
            playing
              ? "border-gold bg-gold text-primary-foreground"
              : "border-muted-foreground text-muted-foreground",
          )}
        >
          {playing ? (
            <Pause className="size-3.5" fill="currentColor" />
          ) : (
            <Play className="size-3.5 translate-x-px" fill="currentColor" />
          )}
        </button>
        <span className="label-mono text-muted-foreground">
          {fmtTime(time)} / {fmtTime(duration)}
        </span>
        <div
          role="radiogroup"
          aria-label={vi ? "Phiên bản âm thanh" : "Sound version"}
          className="ml-auto flex rounded-full border border-hairline p-1"
        >
          {(["before", "after"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => mode !== m && toggleMode()}
              className={cn(
                "label-mono cursor-pointer rounded-full px-4 py-1.5 transition-colors duration-250",
                mode === m ? "bg-raised text-body" : "text-muted-foreground hover:text-ivory",
              )}
            >
              {m === "before"
                ? vi
                  ? "Trước"
                  : "Before"
                : vi
                  ? "Sau · Tremola Studio"
                  : "After · Tremola Studio"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
