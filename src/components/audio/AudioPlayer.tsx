import { cn } from "@/lib/utils";
import { fmtTime, useAudio } from "./AudioProvider";
import { PlayButton } from "./PlayButton";
import { Waveform } from "./Waveform";
import type { Track } from "./types";

export function AudioPlayer({
  track,
  compact,
  className,
}: {
  track: Track;
  compact?: boolean;
  className?: string;
}) {
  const { current, playing, time, duration, peaks, toggle, seek } = useAudio();
  const active = current?.id === track.id;
  const isPlaying = active && playing;
  const progress = active && duration ? time / duration : 0;
  const durLabel =
    active && duration ? `${fmtTime(time)} / ${fmtTime(duration)}` : (track.durationLabel ?? "");

  const onKey = (e: React.KeyboardEvent) => {
    if (!active) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      seek(time + 5);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      seek(time - 5);
    }
  };

  return (
    <div
      data-audio-playing={isPlaying}
      className={cn("flex items-center gap-4", className)}
      onKeyDown={onKey}
    >
      <PlayButton
        playing={isPlaying}
        onClick={() => toggle(track)}
        label={track.title}
        size={compact ? "sm" : "md"}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <span className="line-clamp-2 break-words text-small text-body">{track.title}</span>
            {track.placeholder && (
              <span className="label-mono mt-1 block text-muted-foreground">Placeholder</span>
            )}
          </div>
          <span className="label-mono shrink-0 text-muted-foreground">{durLabel}</span>
        </div>
        <div
          role="slider"
          tabIndex={0}
          aria-label={`Seek ${track.title}`}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration || 0)}
          aria-valuenow={Math.round(active ? time : 0)}
          aria-valuetext={fmtTime(active ? time : 0)}
          className="rounded-sm"
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              toggle(track);
            }
          }}
        >
          <Waveform
            peaks={track.peaks ?? peaks[track.id]}
            progress={progress}
            playing={isPlaying}
            className={compact ? "h-7" : "h-10"}
            onSeek={(r) => {
              if (!active) toggle(track);
              else if (duration) seek(r * duration);
            }}
          />
        </div>
      </div>
    </div>
  );
}
