import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** { ok, db } — db is true when the founding counter can be read with the service role. */
export async function healthCheck(): Promise<{ ok: boolean; db: boolean; time: string }> {
  let db = false;
  try {
    const { error } = await supabaseAdmin.from("founding_slots").select("total").limit(1);
    db = !error;
  } catch {
    db = false;
  }
  return { ok: db, db, time: new Date().toISOString() };
}
