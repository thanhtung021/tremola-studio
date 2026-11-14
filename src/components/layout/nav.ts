import type { Locale } from "@/i18n";

/** Literal route paths per locale so links stay type-checked. */
export const routes = {
  en: { home: "/", work: "/work", services: "/services", audit: "/sound-audit", freePack: "/free-pack", about: "/about" },
  vi: { home: "/vi", work: "/vi/work", services: "/vi/services", audit: "/vi/sound-audit", freePack: "/vi/free-pack", about: "/vi/about" },
} as const satisfies Record<Locale, Record<string, string>>;
