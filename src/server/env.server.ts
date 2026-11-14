/**
 * Server-only environment access.
 *
 * On Cloudflare Workers, vars/secrets are exposed on `process.env` (nodejs_compat) and bindings
 * (R2 buckets) live on the Worker `env` object, which nitro stores on `globalThis.__env__`.
 * In local `vite dev`, `.env.local` values are on `process.env` and bindings are absent.
 */
export function env(name: string): string | undefined {
  const fromProcess = typeof process !== "undefined" ? process.env[name] : undefined;
  if (fromProcess !== undefined && fromProcess !== "") return fromProcess;
  const workerEnv = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const v = workerEnv?.[name];
  return typeof v === "string" && v !== "" ? v : undefined;
}

export function requireEnv(name: string): string {
  const v = env(name);
  if (!v) throw new Error(`Missing server environment variable ${name}`);
  return v;
}

/** Minimal R2 surface used by this app (avoids a dependency on @cloudflare/workers-types). */
export type R2ObjectBodyLike = {
  body: ReadableStream;
  size: number;
  httpEtag: string;
  httpMetadata?: { contentType?: string };
};
export type R2BucketLike = {
  get: (key: string) => Promise<R2ObjectBodyLike | null>;
  head: (key: string) => Promise<{ size: number } | null>;
};

export function binding<T>(name: string): T | null {
  const workerEnv = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  return (workerEnv?.[name] as T | undefined) ?? null;
}

/** SHA-256 hex of a value, salted with the signing secret so hashes are not reversible lookups. */
export async function hashKey(value: string): Promise<string> {
  const salt = env("DOWNLOAD_SIGNING_SECRET") ?? "tremola";
  const data = new TextEncoder().encode(`${salt}:${value.trim().toLowerCase()}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
