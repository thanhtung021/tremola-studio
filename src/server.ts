import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { permanentRedirect } from "./server/redirects";

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
/** Security headers on every response (HTTPS only for a year, no MIME sniffing). */
function withSecurityHeaders(response: Response): Response {
  const out = new Response(response.body, response);
  out.headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  out.headers.set("x-content-type-options", "nosniff");
  return out;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    return withSecurityHeaders(await handle(request, env, ctx));
  },
};

async function handle(request: Request, env: unknown, ctx: unknown): Promise<Response> {
  const url = new URL(request.url);
  // Secondary domains (www, tremola.studio, tremola.vn) → 301 to the canonical origin, HTTPS.
  if (REDIRECT_HOSTS.has(url.hostname)) {
    return Response.redirect(`${CANONICAL_ORIGIN}${url.pathname}${url.search}`, 301);
  }
  const redirect = permanentRedirect(request, url);
  if (redirect) return redirect;
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
    const response = await normalizeCatastrophicSsrResponse(await handler.fetch(request, env, ctx));
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
}
