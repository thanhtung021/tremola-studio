/**
 * Server-only helpers for lead capture: request context, rate limiting, error logging.
 * Imported only from server function handlers (dynamic import) so nothing here reaches the browser.
 */
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { hashKey } from "./env.server";

export type RequestContext = { ip: string; userAgent: string; country: string | null };

export function requestContext(): RequestContext {
  const req = getRequest();
  const h = req.headers;
  const ip =
    h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return {
    ip,
    userAgent: (h.get("user-agent") ?? "").slice(0, 300),
    country: h.get("cf-ipcountry"),
  };
}

export type Limit = { bucket: string; key: string; max: number; windowSeconds: number };

/** Each limit is checked independently; returns false when any of them is exceeded. */
export async function withinRateLimits(limits: Limit[]): Promise<boolean> {
  for (const l of limits) {
    const { data, error } = await supabaseAdmin.rpc("rate_limit_hit", {
      _bucket: l.bucket,
      _key_hash: await hashKey(l.key),
      _max: l.max,
      _window_seconds: l.windowSeconds,
    });
    // Fail open on infrastructure errors: never lose a real lead because the limiter hiccuped.
    if (error) {
      console.error("rate limit check failed", error.message);
      continue;
    }
    if (data === false) return false;
  }
  return true;
}

/** Records a submission failure without any personal data. Never throws. */
export async function logSubmissionError(
  form: "audit" | "pack" | "contact" | "download",
  stage: string,
  err: unknown,
  locale?: string,
) {
  const message = (err instanceof Error ? err.message : String(err)).slice(0, 1000);
  console.error(`[${form}] ${stage}: ${message}`);
  try {
    await supabaseAdmin
      .from("submission_errors")
      .insert({ form, stage, message, locale: locale ?? null });
  } catch (e) {
    console.error("could not record submission error", e);
  }
}
