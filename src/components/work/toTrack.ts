import type { Track } from "@/components/audio/types";
import type { WorkTrack } from "@/data/work";

export const toTrack = (slug: string, t: WorkTrack, i = 0): Track => ({
  id: `${slug}::${i}::${t.title}`,
  title: t.title,
  src: t.src,
  durationLabel: t.duration,
  ...(t.peaks ? { peaks: t.peaks } : {}),
});
