/**
 * Build step: writes public/sitemap.xml and public/robots.txt from the route list and work.ts.
 *   bun scripts/generate-seo.ts        (runs automatically before `bun run build`)
 * Env: SITE_URL (canonical origin), VITE_APP_ENV ("production" → indexable; anything else → Disallow all).
 */
import { writeFileSync } from "node:fs";
import { workSlugs } from "../src/data/work";

const site = (
  process.env["SITE_URL"] ??
  process.env["VITE_SITE_URL"] ??
  "https://tremolastudio.com"
).replace(/\/+$/, "");
const production = (process.env["VITE_APP_ENV"] ?? "development") === "production";

/** Locale-neutral paths of every indexable page; /vi mirrors each one. */
const staticPaths = ["/", "/work", "/services", "/sound-audit", "/free-pack", "/about"];
const paths = [...staticPaths, ...workSlugs.map((slug) => `/work/${slug}`)];

const vi = (p: string) => (p === "/" ? "/vi" : `/vi${p}`);
const today = new Date().toISOString().slice(0, 10);
const esc = (s: string) => s.replace(/&/g, "&amp;");

const entry = (loc: string, p: string) => `  <url>
    <loc>${esc(site + loc)}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${esc(site + p)}"/>
    <xhtml:link rel="alternate" hreflang="vi" href="${esc(site + vi(p))}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(site + p)}"/>
  </url>`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${paths.flatMap((p) => [entry(p, p), entry(vi(p), p)]).join("\n")}
</urlset>
`;

const robots = production
  ? `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /styleguide

Sitemap: ${site}/sitemap.xml
`
  : `# Non-production build (${process.env["VITE_APP_ENV"] ?? "development"}): keep out of search engines.
User-agent: *
Disallow: /
`;

writeFileSync("public/sitemap.xml", sitemap);
writeFileSync("public/robots.txt", robots);
console.log(`seo: ${paths.length * 2} URLs for ${site} (${production ? "production" : "noindex"})`);
