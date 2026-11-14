export type Track = {
  id: string;
  title: string;
  src: string;
  /** Optional Opus/WebM rendition; used only where the browser reports solid support. */
  srcOpus?: string;
  /** Duration label shown before the file loads, e.g. "0:24". */
  durationLabel?: string;
  /** Precomputed normalised peaks (0–1). Computed from the file when absent. */
  peaks?: number[];
  placeholder?: boolean;
};
