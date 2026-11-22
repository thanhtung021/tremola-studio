import { useRouterState } from "@tanstack/react-router";
import { en, type Dict } from "./en";
import { vi } from "./vi";

export type Locale = "en" | "vi";
export const dictionaries: Record<Locale, Dict> = { en, vi };

export function localeFromPath(pathname: string): Locale {
  return pathname === "/vi" || pathname.startsWith("/vi/") ? "vi" : "en";
}

/** Prefix a site path with the locale ("/work" -> "/vi/work"). */
export function localize(locale: Locale, path: string) {
  if (locale === "en") return path;
  return path === "/" ? "/vi" : `/vi${path}`;
}

/** Swap the current path to the other locale. */
export function switchLocalePath(pathname: string, to: Locale) {
  const bare = pathname.replace(/^\/vi(?=\/|$)/, "") || "/";
  return localize(to, bare);
}

export function useLocale() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const locale = localeFromPath(pathname);
  return { locale, t: dictionaries[locale], pathname };
}

const pagePaths: Record<keyof Dict["pages"], string> = {
  home: "/",
  work: "/work",
  services: "/services",
  audit: "/sound-audit",
  freePack: "/free-pack",
  about: "/about",
};

type HeadCtx = { matches?: Array<{ loaderData?: unknown }> };
/** Site origin, provided by the root route loader. */
export function originFrom(ctx?: HeadCtx) {
  const d = ctx?.matches?.[0]?.loaderData as { origin?: string } | undefined;
  return d?.origin ?? "";
}

/** Canonical + hreflang links for a locale-neutral path such as "/work". */
export function alternateLinks(locale: Locale, path: string, origin: string) {
  const href = (l: Locale) => `${origin}${localize(l, path)}`;
  return [
    { rel: "canonical", href: href(locale) },
    { rel: "alternate", hrefLang: "en", href: href("en") },
    { rel: "alternate", hrefLang: "vi", href: href("vi") },
    { rel: "alternate", hrefLang: "x-default", href: href("en") },
  ];
}

/** Builds head() meta for a page in a given locale. */
export function pageHead(locale: Locale, key: keyof Dict["pages"], ctx?: HeadCtx) {
  const d = dictionaries[locale];
  const origin = originFrom(ctx);
  // Search titles: keyword first, at most 60 characters (seo-plan KEYWORDS.md).
  const title = d.meta.titles[key];
  const path = pagePaths[key];
  const image = origin ? `${origin}/og-image.png` : null;
  return {
    meta: [
      { title },
      { name: "description", content: d.meta[key] },
      { property: "og:title", content: title },
      { property: "og:description", content: d.meta[key] },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${origin}${localize(locale, path)}` },
      { property: "og:locale", content: locale === "vi" ? "vi_VN" : "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(image
        ? [
            { property: "og:image", content: image },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            {
              property: "og:image:alt",
              content: "Tremola Studio logo with the tagline Sound with a soul of its own.",
            },
            { name: "twitter:image", content: image },
          ]
        : []),
    ],
    links: alternateLinks(locale, path, origin),
  };
}
