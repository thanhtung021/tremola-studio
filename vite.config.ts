// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

/**
 * Cloudflare Worker settings (see docs/DEPLOY.md).
 * TREMOLA_WORKER_NAME: "tremola" (production, default) or "tremola-preview" (branch previews).
 * Bindings: MEDIA = public media bucket (audio/video/images), PACKS = private free-pack bucket.
 * A fixed compatibility date avoids "future date" errors when building in the Vietnam time zone.
 */
const workerName = process.env["TREMOLA_WORKER_NAME"] ?? "tremola";
const nitro = {
  compatibilityDate: "2026-11-01",
  cloudflare: {
    wrangler: {
      name: workerName,
      observability: { enabled: true, head_sampling_rate: 1 },
      r2_buckets: [
        { binding: "MEDIA", bucket_name: process.env["MEDIA_BUCKET"] ?? "tremola-media" },
        { binding: "PACKS", bucket_name: process.env["PACKS_BUCKET"] ?? "tremola-packs" },
      ],
    },
  },
} as unknown as { preset?: string };

const MIME: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".webm": "audio/webm",
  ".json": "application/json",
  ".mp4": "video/mp4",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};

/** Dev only: serve /media/* from media-build/ (output of scripts/process-audio.mjs) with Range. */
function devMedia(): Plugin {
  return {
    name: "tremola:dev-media",
    apply: "serve",
    configureServer(server) {
      const root = path.resolve("media-build");
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/media/")) return next();
        const rel = decodeURIComponent(req.url.slice(7).split("?")[0] ?? "");
        const file = path.join(root, rel);
        if (!file.startsWith(root) || !existsSync(file)) {
          res.statusCode = 404;
          return res.end("Not found");
        }
        const size = statSync(file).size;
        res.setHeader("Content-Type", MIME[path.extname(file)] ?? "application/octet-stream");
        res.setHeader("Accept-Ranges", "bytes");
        const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
        if (m) {
          const start = m[1] ? Number(m[1]) : size - Number(m[2]);
          const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
          res.statusCode = 206;
          res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
          res.setHeader("Content-Length", String(end - start + 1));
          return createReadStream(file, { start, end }).pipe(res);
        }
        res.setHeader("Content-Length", String(size));
        createReadStream(file).pipe(res);
      });
    },
  };
}

export default defineConfig({
  nitro,
  vite: { plugins: [devMedia()] },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
