/**
 * Site-wide settings the team can change. Values come from environment variables when set.
 * Leave tracking IDs empty to turn tracking off.
 */
const env = import.meta.env as Record<string, string | undefined>;

export const siteConfig = {
  ga4Id: env["VITE_GA4_ID"] ?? "",
  metaPixelId: env["VITE_META_PIXEL_ID"] ?? "",
  /** Download link for the free pack. Placeholder until the real file is hosted. */
  freePackUrl: env["VITE_FREE_PACK_URL"] ?? "#placeholder-free-pack-download",
  freePackIsPlaceholder: !env["VITE_FREE_PACK_URL"],
};
