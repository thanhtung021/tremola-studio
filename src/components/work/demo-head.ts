import { alternateLinks, localize, type Locale } from "@/i18n";

/** Date the demo reels were published, Vietnam time (ISO 8601 with offset for VideoObject). */
const UPLOAD_DATE = "2026-11-20T00:00:00+07:00";

type DemoHeadData = {
  slug: string;
  title: string;
  seoTitle: string;
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
  // Search title = the demo's keyword title (work.ts seoTitle), at most 60 characters in total.
  const title = `${d?.seoTitle ?? notFound.title} | Tremola Studio`;
  const description = d?.summary ?? notFound.description;
  const abs = (u: string) => (/^https?:/.test(u) ? u : `${origin}${u}`);
  const pageUrl = d ? `${origin}${localize(locale, `/work/${d.slug}`)}` : "";
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "video.other" },
      { property: "og:locale", content: locale === "vi" ? "vi_VN" : "en_US" },
      { property: "og:locale:alternate", content: locale === "vi" ? "en_US" : "vi_VN" },
      ...(d && origin ? [{ property: "og:url", content: pageUrl }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      ...(d && origin
        ? [
            { property: "og:image", content: abs(d.cover) },
            { property: "og:image:width", content: "1600" },
            { property: "og:image:height", content: "900" },
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
                uploadDate: UPLOAD_DATE,
                duration: `PT${Math.floor(d.seconds / 60)}M${d.seconds % 60}S`,
                inLanguage: locale,
                url: pageUrl,
                publisher: {
                  "@type": "Organization",
                  "@id": `${origin}/#organization`,
                  name: "Tremola Studio",
                  logo: { "@type": "ImageObject", url: `${origin}/apple-touch-icon.png` },
                },
              }),
            },
          ]
        : [],
  };
}
