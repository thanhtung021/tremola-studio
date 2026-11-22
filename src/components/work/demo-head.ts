import { alternateLinks, type Locale } from "@/i18n";

type DemoHeadData = {
  slug: string;
  title: string;
  summary: string;
  cover: string;
  video: string;
  seconds: number;
};

/** <head> for a demo page: title, description, poster as share image, hreflang, VideoObject. */
export function demoHead(
  d: DemoHeadData | undefined,
  origin: string,
  locale: Locale,
  notFound: { title: string; description: string },
) {
  // Tab and search titles use plain punctuation: "Echoes · Asian Signature" → "Echoes: Asian Signature".
  const name = (d?.title ?? notFound.title).replace(/\s+·\s+/g, ": ");
  const title = `${name} | Tremola Studio`;
  const description = d?.summary ?? notFound.description;
  const abs = (u: string) => (/^https?:/.test(u) ? u : `${origin}${u}`);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(d && origin
        ? [
            { property: "og:image", content: abs(d.cover) },
            { name: "twitter:image", content: abs(d.cover) },
          ]
        : []),
      ...(d ? [] : [{ name: "robots", content: "noindex" }]),
    ],
    links: d ? alternateLinks(locale, `/work/${d.slug}`, origin) : [],
    scripts:
      d && origin
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "VideoObject",
                name: d.title,
                description: d.summary,
                thumbnailUrl: abs(d.cover),
                contentUrl: abs(d.video),
                uploadDate: "2026-11-20",
                duration: `PT${Math.floor(d.seconds / 60)}M${d.seconds % 60}S`,
                inLanguage: locale,
                publisher: { "@type": "Organization", name: "Tremola Studio" },
              }),
            },
          ]
        : [],
  };
}
