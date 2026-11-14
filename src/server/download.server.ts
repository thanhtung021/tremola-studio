/**
 * Time-limited signed download links for the free pack.
 * Token = base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload, DOWNLOAD_SIGNING_SECRET)).
 */
import { env, requireEnv } from "./env.server";

export type DownloadClaims = { sid: string; key: string; exp: number };

const enc = new TextEncoder();

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromB64url = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signDownload(signupId: string, now = Date.now()): Promise<string> {
  const ttl = Number(env("DOWNLOAD_TTL_SECONDS") ?? 86400);
  const claims: DownloadClaims = {
    sid: signupId,
    key: env("FREE_PACK_OBJECT_KEY") ?? "free-pack/tremola-free-pack-v1.zip",
    exp: Math.floor(now / 1000) + ttl,
  };
  const payload = b64url(enc.encode(JSON.stringify(claims)));
  const key = await hmacKey(requireEnv("DOWNLOAD_SIGNING_SECRET"));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  return `${payload}.${b64url(sig)}`;
}

export async function verifyDownload(
  token: string,
  now = Date.now(),
): Promise<DownloadClaims | null> {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const key = await hmacKey(requireEnv("DOWNLOAD_SIGNING_SECRET"));
    const ok = await crypto.subtle.verify("HMAC", key, fromB64url(sig), enc.encode(payload));
    if (!ok) return null;
    const claims = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as DownloadClaims;
    if (typeof claims.exp !== "number" || claims.exp * 1000 < now) return null;
    return claims;
  } catch {
    return null;
  }
}

export function downloadPath(token: string) {
  return `/api/pack/download?t=${encodeURIComponent(token)}`;
}
