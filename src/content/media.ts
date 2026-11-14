import after from "@/assets/media/placeholder-after.mp3.asset.json";
import before from "@/assets/media/placeholder-before.mp3.asset.json";
import video from "@/assets/media/placeholder-video.mp4.asset.json";
import type { Track } from "@/components/audio/types";

/** Placeholder media — replace with real files. */
export const placeholderMedia = { video: video.url, before: before.url, after: after.url };

export const placeholderTrack = (id: string, title: string): Track => ({
  id,
  title,
  src: after.url,
  durationLabel: "0:24",
  placeholder: true,
});
