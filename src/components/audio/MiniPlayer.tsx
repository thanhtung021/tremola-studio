import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { ease } from "@/lib/motion";
import { fmtTime, useAudio } from "./AudioProvider";
import { PlayButton } from "./PlayButton";
import { Waveform } from "./Waveform";

export function MiniPlayer() {
  const { current, playing, time, duration, peaks, toggle, seek, close } = useAudio();
  const reduce = useReducedMotion();
  const show = !!current;
  return (
    <AnimatePresence>
      {show && current && (
        <m.div
          role="region"
          aria-label="Now playing"
          initial={reduce ? { opacity: 0 } : { y: "100%" }}
          animate={reduce ? { opacity: 1 } : { y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: "100%" }}
          transition={{ duration: reduce ? 0.2 : 0.3, ease }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-surface/90 backdrop-blur-md"
        >
          <div className="container-site flex items-center gap-4 py-3">
            <PlayButton
              playing={playing}
              onClick={() => toggle(current)}
              label={current.title}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-3">
                <span className="line-clamp-2 text-small text-body">{current.title}</span>
                <span className="label-mono text-muted-foreground">
                  {fmtTime(time)} / {fmtTime(duration)}
                </span>
              </div>
              <Waveform
                peaks={current.peaks ?? peaks[current.id]}
                progress={duration ? time / duration : 0}
                playing={playing}
                onSeek={(r) => {
                  if (duration) seek(r * duration);
                }}
                className="h-6"
                bars={96}
              />
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close player"
              className="grid size-9 cursor-pointer place-items-center rounded-full text-muted-foreground hover:text-ivory"
            >
              <X className="size-4" />
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
