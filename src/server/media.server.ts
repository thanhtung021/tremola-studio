/**
 * GET/HEAD /media/<key> → object from the R2 bucket bound as MEDIA, with HTTP Range support
 * (required for audio/video seeking, especially on Safari). Used when no separate CDN domain
 * (VITE_MEDIA_BASE_URL) is configured. Keys are content-hashed, so responses are immutable.
 */
import { binding } from "./env.server";

type R2Range = { offset: number; length: number } | { suffix: number };
type R2Obj = {
  body?: ReadableStream;
  size: number;
  httpEtag: string;
  httpMetadata?: { contentType?: string };
  range?: { offset?: number; length?: number };
};
type MediaBucket = {
  get: (key: string, opts?: { range?: R2Range }) => Promise<R2Obj | null>;
  head: (key: string) => Promise<R2Obj | null>;
};

const TYPES: Record<string, string> = {
  mp3: "audio/mpeg",
  webm: "audio/webm",
  json: "application/json",
  mp4: "video/mp4",
  jpg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  png: "image/png",
};

function parseRange(header: string | null, size: number): R2Range | null {
  const m = header ? /^bytes=(\d*)-(\d*)$/.exec(header.trim()) : null;
  if (!m) return null;
  const [, a, b] = m;
  if (a === "" && b) return { suffix: Math.min(Number(b), size) };
  const start = Number(a);
  const end = b ? Math.min(Number(b), size - 1) : size - 1;
  if (Number.isNaN(start) || start >= size || end < start) return null;
  return { offset: start, length: end - start + 1 };
}

export async function handleMedia(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const key = decodeURIComponent(url.pathname.replace(/^\/media\//, ""));
  if (!key || key.includes("..")) return new Response("Not found", { status: 404 });
  const bucket = binding<MediaBucket>("MEDIA");
  if (!bucket) return new Response("Media storage not configured", { status: 503 });

  const head = await bucket.head(key);
  if (!head) return new Response("Not found", { status: 404 });
  const size = head.size;
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  const headers = new Headers({
    "content-type": head.httpMetadata?.contentType ?? TYPES[ext] ?? "application/octet-stream",
    "accept-ranges": "bytes",
    "cache-control": "public, max-age=31536000, immutable",
    etag: head.httpEtag,
    "access-control-allow-origin": "*",
  });
  if (request.headers.get("if-none-match") === head.httpEtag)
    return new Response(null, { status: 304, headers });
  if (request.method === "HEAD") {
    headers.set("content-length", String(size));
    return new Response(null, { status: 200, headers });
  }

  const rangeHeader = request.headers.get("range");
  const range = parseRange(rangeHeader, size);
  if (rangeHeader && !range) {
    headers.set("content-range", `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  const obj = await bucket.get(key, range ? { range } : undefined);
  if (!obj?.body) return new Response("Not found", { status: 404 });
  if (range) {
    const start = "suffix" in range ? size - range.suffix : range.offset;
    const length = "suffix" in range ? range.suffix : range.length;
    headers.set("content-range", `bytes ${start}-${start + length - 1}/${size}`);
    headers.set("content-length", String(length));
    return new Response(obj.body, { status: 206, headers });
  }
  headers.set("content-length", String(size));
  return new Response(obj.body, { status: 200, headers });
}
