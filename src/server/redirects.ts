/**
 * Retired portfolio slugs (placeholder projects replaced by the sales demos on 2026-11-21) that
 * Google had indexed → 301 to the closest demo.
 */
export const RETIRED_WORK: Record<string, string> = {
  "stick-english-learning-app": "sonic-logos",
  "lantern-valley": "echoes-of-the-nine-mountains",
  "moon-lute-duel": "echoes-asian-signature",
  "calm-ledger": "nhip-fintech-app",
};

/** Permanent redirects on the canonical host: retired demo URLs and trailing slashes. */
export function permanentRedirect(request: Request, url: URL): Response | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const m = /^(\/vi)?\/work\/([^/]+)\/?$/.exec(url.pathname);
  const target = m?.[2] ? RETIRED_WORK[m[2]] : undefined;
  if (m && target) return Response.redirect(`${url.origin}${m[1] ?? ""}/work/${target}`, 301);
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    const path = url.pathname.replace(/\/+$/, "") || "/";
    return Response.redirect(`${url.origin}${path}${url.search}`, 301);
  }
  return null;
}
