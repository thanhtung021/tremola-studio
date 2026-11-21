import { useRef } from "react";
import { useAudio } from "@/components/audio/AudioProvider";

/**
 * A video with its own soundtrack: never autoplays, loads only on play, and takes the single
 * site-wide audio slot (starting it stops the mini player; starting other audio pauses it).
 */
export function SoundVideo({
  id,
  src,
  poster,
  label,
  onPlay,
}: {
  id: string;
  src: string;
  poster: string;
  label: string;
  onPlay?: () => void;
}) {
  const { claim } = useAudio();
  const video = useRef<HTMLVideoElement>(null);
  return (
    <video
      ref={video}
      key={src}
      src={src}
      poster={poster}
      controls
      playsInline
      preload="none"
      aria-label={label}
      width={1920}
      height={1080}
      className="aspect-video w-full bg-background"
      onPlay={() => {
        claim(id, () => video.current?.pause());
        onPlay?.();
      }}
    />
  );
}
