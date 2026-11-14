import { useRef } from "react";
import { cn } from "@/lib/utils";

const FLAT = Array.from({ length: 64 }, (_, i) => 0.25 + 0.15 * Math.abs(Math.sin(i * 0.7)));

/** Thin vertical bars; click or drag to seek. Keyboard handled by the parent. */
export function Waveform({
  peaks,
  progress,
  playing = false,
  onSeek,
  className,
  bars = 64,
}: {
  peaks?: number[] | undefined;
  progress: number;
  playing?: boolean;
  onSeek?: ((ratio: number) => void) | undefined;
  className?: string | undefined;
  bars?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const data = (peaks?.length ? peaks : FLAT).slice(0, bars);
  const toRatio = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || !r.width) return 0;
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  };
  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "flex h-10 w-full min-w-0 cursor-pointer touch-none items-center justify-between gap-px overflow-hidden",
        className,
      )}
      onPointerDown={(e) => {
        if (!onSeek) return;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        onSeek(toRatio(e.clientX));
      }}
      onPointerMove={(e) => {
        if (onSeek && e.buttons === 1) onSeek(toRatio(e.clientX));
      }}
    >
      {data.map((p, i) => (
        <span
          key={i}
          className={cn(
            "w-[2px] min-w-px shrink rounded-full transition-colors duration-250",
            playing && i / data.length < progress
              ? "waveform-played bg-gold"
              : "bg-muted-foreground",
          )}
          style={{ height: `${Math.max(8, p * 100)}%` }}
        />
      ))}
    </div>
  );
}
