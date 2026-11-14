import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PlayButton({
  playing,
  onClick,
  label,
  size = "md",
  className,
}: {
  playing: boolean;
  onClick: () => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={onClick}
      aria-label={`${playing ? "Pause" : "Play"} ${label}`}
      aria-pressed={playing}
      data-audio-playing={playing}
      className={cn(
        "group relative grid shrink-0 cursor-pointer place-items-center rounded-full p-0 transition-colors duration-400",
        playing
          ? "bg-gold text-primary-foreground hover:bg-gold-hover hover:text-primary-foreground"
          : "text-muted-foreground hover:bg-raised hover:text-body",
        size === "md" ? "size-12" : "size-9",
        className,
      )}
    >
      <span
        className={cn(
          "hover-tremolo absolute inset-0 rounded-full border",
          playing ? "border-gold" : "border-muted-foreground",
        )}
      />
      {playing ? (
        <Pause className={size === "md" ? "size-4" : "size-3.5"} fill="currentColor" />
      ) : (
        <Play
          className={cn(size === "md" ? "size-4" : "size-3.5", "translate-x-px")}
          fill="currentColor"
        />
      )}
    </Button>
  );
}
