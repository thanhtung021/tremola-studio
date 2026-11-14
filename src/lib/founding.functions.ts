import { createServerFn } from "@tanstack/react-start";
import { founding as fallback } from "@/config/founding";

export type Founding = { total: number; remaining: number };

let cache: { at: number; value: Founding } | null = null;
const TTL_MS = 60_000;

/**
 * Founding clients counter. Lives in the `founding_slots` table so the Marketing Leader can edit
 * it in /admin without a deploy. Falls back to src/config/founding.ts if the database is unreachable.
 */
export const getFounding = createServerFn({ method: "GET" }).handler(
  async (): Promise<Founding> => {
    if (cache && Date.now() - cache.at < TTL_MS) return cache.value;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin
        .from("founding_slots")
        .select("total, remaining")
        .eq("id", true)
        .single();
      if (error || !data) throw new Error(error?.message ?? "no founding row");
      cache = { at: Date.now(), value: { total: data.total, remaining: data.remaining } };
      return cache.value;
    } catch (e) {
      console.error("founding slots fallback:", e instanceof Error ? e.message : e);
      return { ...fallback };
    }
  },
);

/** Clears the in-memory cache after an admin edit on this isolate. */
export function invalidateFoundingCache() {
  cache = null;
}
