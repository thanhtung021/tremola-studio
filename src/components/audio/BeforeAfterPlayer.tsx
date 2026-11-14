import { Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n";
import { fmtTime, useAudio } from "./AudioProvider";
import { DualTrackEngine, type Mode } from "./dual-track-engine";

type Props = {
  video: string;
  poster?: string;
  before: string;
  after: string;
  placeholder?: boolean;
  className?: string;
};

/** One video timeline, two audio tracks, crossfaded without restarting the video. */
export function BeforeAfterPlayer({ video, poster, before, after, placeholder, className }: Props) {
  const vi = useLocale().locale === "vi";
  const id = useId();
  const { claim } = useAudio();
  const vRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<Mode>("after");
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const engine = useRef<DualTrackEngine | null>(null);

  const getEngine = () => {
    if (!engine.current)
      engine.current = new DualTrackEngine(
        { before, after },
        () => vRef.current,
        (t, d) => {
          setTime(t);
          if (d) setDuration(d);
        },
        () => setPlaying(false),
      );
    return engine.current;
  };

  useEffect(() => {
    const v = vRef.current;
    const onMeta = () => v && !duration && setDuration(v.duration);
    v?.addEventListener("loadedmetadata", onMeta);
    return () => {
      v?.removeEventListener("loadedmetadata", onMeta);
      engine.current?.destroy();
      engine.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [before, after]);

  function pauseAll() {
    engine.current?.pause();
    setPlaying(false);
  }

  function toggleMode() {
    const next = mode === "before" ? "after" : "before";
    setMode(next);
    engine.current?.setMode(next);
    track("before_after_toggle", { to: next, page: window.location.pathname });
  }

  async function togglePlay() {
    if (playing) return pauseAll();
    const e = getEngine();
    claim(id, pauseAll);
    e.setMode(mode);
    e.unlock(); // synchronous, inside the click: unlocks audio on iOS
    setLoading(true);
    try {
      await e.play();
      setPlaying(true);
      track("audio_play", { track: "Before / After", page: window.location.pathname });
    } catch (err) {
      console.error("before/after playback failed", err);
    } finally {
      setLoading(false);
    }
  }

  function seekTo(s: number) {
    void getEngine().seek(s);
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
        {placeholder && (
          <span className="label-mono absolute left-4 top-4 rounded-full border border-hairline bg-background/70 px-3 py-1 text-muted-foreground">
            Placeholder
          </span>
        )}
        {!playing && (
          <button
            type="button"
            onClick={() => void togglePlay()}
            aria-label={vi ? "Phát" : "Play"}
            aria-busy={loading || undefined}
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
          aria-label={playing ? (vi ? "Tạm dừng" : "Pause") : vi ? "Phát" : "Play"}
          aria-busy={loading || undefined}
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
