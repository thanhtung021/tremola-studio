import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

const CANONICAL_ORIGIN = "https://tremolastudio.com";
const REDIRECT_HOSTS = new Set([
  "www.tremolastudio.com",
  "tremola.studio",
  "www.tremola.studio",
  "tremola.vn",
  "www.tremola.vn",
]);

/**
 * Edge HTML cache (Cloudflare Cache API). Public pages render the same HTML for every visitor
 * (consent, audio and admin state live in the browser), so a rendered page is reused for
 * EDGE_TTL_SECONDS per data centre. This removes the SSR + database round trip from most requests.
 * The founding counter therefore updates within about a minute after an admin edit.
 */
const EDGE_TTL_SECONDS = 60;
const NO_CACHE_PREFIXES = ["/admin", "/api/", "/media/", "/_serverFn", "/styleguide"];

function edgeCache(): Cache | null {
  const c = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  return c ?? null;
}

function isCacheablePage(request: Request, url: URL) {
  if (request.method !== "GET") return false;
  if (NO_CACHE_PREFIXES.some((p) => url.pathname.startsWith(p))) return false;
  if (request.headers.has("authorization")) return false;
  // Only HTML navigations (server-function RPC and asset requests are excluded).
  return (request.headers.get("accept") ?? "").includes("text/html");
}

/** Cache key ignores marketing parameters so UTM links share the cached page. */
function cacheKey(url: URL) {
  const key = new URL(url.toString());
  for (const p of [...key.searchParams.keys()])
    if (/^(utm_|fbclid|gclid|ref$)/.test(p)) key.searchParams.delete(p);
  key.hash = "";
  return new Request(key.toString(), { method: "GET" });
}

/**
 * Inlines the app stylesheet into the HTML (<link rel=stylesheet> → <style>). The CSS was the only
 * render-blocking request; inlining saves a round trip on first paint. The file is read once per
 * isolate from the static assets binding. Falls back to the original <link> on any error.
 */
const cssCache = new Map<string, string>();
/** INLINE_CSS=false (Worker var) turns inlining off without a rebuild. */
const inlineCssEnabled = () =>
  (globalThis as { __env__?: { INLINE_CSS?: string } }).__env__?.INLINE_CSS !== "false";
type AssetsBinding = { fetch: (req: Request) => Promise<Response> };
type RewriterElement = {
  getAttribute: (name: string) => string | null;
  replace: (content: string, opts: { html: boolean }) => void;
  remove: () => void;
};
type Rewriter = {
  on: (selector: string, handler: { element: (el: RewriterElement) => void }) => Rewriter;
  transform: (r: Response) => Response;
};
type RewriterCtor = new () => Rewriter;
/** PRELOAD_FONTS=false (Worker var) drops the hero font preloads (A/B measurement switch). */
const preloadFontsEnabled = () =>
  (globalThis as { __env__?: { PRELOAD_FONTS?: string } }).__env__?.PRELOAD_FONTS !== "false";

async function inlineStylesheets(response: Response, url: URL): Promise<Response> {
  const Rewriter = (globalThis as { HTMLRewriter?: RewriterCtor }).HTMLRewriter;
  const assets = (globalThis as { __env__?: { ASSETS?: AssetsBinding } }).__env__?.ASSETS;
  if (!Rewriter || !assets) return response;
  const hrefs: string[] = [];
  const html = await response.clone().text();
  for (const m of html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="(\/assets\/[^"]+\.css)"/g))
    if (m[1]) hrefs.push(m[1]);
  for (const href of hrefs) {
    if (cssCache.has(href)) continue;
    try {
      const r = await assets.fetch(new Request(new URL(href, url.origin)));
      if (r.ok) cssCache.set(href, await r.text());
    } catch {
      /* keep the <link> */
    }
  }
  return new Rewriter()
    .on('link[rel="stylesheet"]', {
      element(el) {
        const css = cssCache.get(el.getAttribute("href") ?? "");
        if (css)
          el.replace(`<style>${css.replace(/<\/style/gi, "<\\/style")}</style>`, { html: true });
      },
    })
    .on('link[rel="preload"][as="font"]', {
      element(el) {
        if (!preloadFontsEnabled()) el.remove();
      },
    })
    .transform(response);
}

const isHtml = (r: Response) => (r.headers.get("content-type") ?? "").includes("text/html");

function withHeader(r: Response, name: string, value: string) {
  const out = new Response(r.body, r);
  out.headers.set(name, value);
  out.headers.set("cache-control", "public, max-age=0, must-revalidate");
  return out;
}

// Hosting compresses every response at the edge. Never compress a body (gzip, brotli,
// CompressionStream) or set content-encoding here or in a server route: the body gets encoded
// twice and renders garbled.
export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    // Secondary domains (www, tremola.studio, tremola.vn) → 301 to the canonical origin, HTTPS.
    if (REDIRECT_HOSTS.has(url.hostname)) {
      return Response.redirect(`${CANONICAL_ORIGIN}${url.pathname}${url.search}`, 301);
    }
    if (
      url.pathname.startsWith("/media/") &&
      (request.method === "GET" || request.method === "HEAD")
    ) {
      try {
        const { handleMedia } = await import("./server/media.server");
        return await handleMedia(request);
      } catch (error) {
        console.error(error);
        return new Response("Media error", { status: 500 });
      }
    }
    if (url.pathname === "/api/health") {
      // Uptime monitor target: checks the Worker and a cheap database read. Also keeps the
      // Supabase Free project from pausing for inactivity.
      try {
        const { healthCheck } = await import("./server/health.server");
        const h = await healthCheck();
        return Response.json(h, {
          status: h.ok ? 200 : 503,
          headers: { "cache-control": "no-store" },
        });
      } catch (error) {
        console.error(error);
        return Response.json({ ok: false }, { status: 503 });
      }
    }
    if (url.pathname === "/api/client-error" && request.method === "POST") {
      // Browser error beacon → Worker Logs (Cloudflare Observability). Size-capped, never echoed.
      try {
        const origin = request.headers.get("origin");
        if (origin && new URL(origin).host !== url.host) return new Response(null, { status: 204 });
        const text = (await request.text()).slice(0, 5000);
        console.error(`[client-error] ${text}`);
      } catch {
        /* ignore */
      }
      return new Response(null, { status: 204 });
    }
    if (url.pathname === "/api/pack/download" && request.method === "GET") {
      try {
        const { handlePackDownload } = await import("./server/pack-download.server");
        return await handlePackDownload(request);
      } catch (error) {
        console.error(error);
        return new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
    }
    try {
      const cacheable = isCacheablePage(request, url);
      const edge = cacheable ? edgeCache() : null;
      if (edge) {
        const hit = await edge.match(cacheKey(url));
        if (hit) return withHeader(hit, "x-edge-cache", "HIT");
      }
      const handler = await getServerEntry();
      let response = await normalizeCatastrophicSsrResponse(await handler.fetch(request, env, ctx));
      if (response.status === 200 && isHtml(response) && inlineCssEnabled())
        response = await inlineStylesheets(response, url);
      if (
        edge &&
        response.status === 200 &&
        isHtml(response) &&
        !response.headers.has("set-cookie")
      ) {
        // Store a copy at the edge; the browser always revalidates (max-age=0).
        const stored = new Response(response.clone().body, response);
        stored.headers.set("cache-control", `public, max-age=${EDGE_TTL_SECONDS}`);
        await edge.put(cacheKey(url), stored);
        return withHeader(response, "x-edge-cache", "MISS");
      }
      return response;
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
