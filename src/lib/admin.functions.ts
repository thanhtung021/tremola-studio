/**
 * Admin server functions. Every call carries the signed-in user's bearer token (attachSupabaseAuth
 * in src/start.ts), is verified by requireSupabaseAuth, and runs with that user's RLS-scoped client:
 * the database itself only lets `admin` role holders read leads or change status/founding numbers.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "audit_sent",
  "call_booked",
  "won",
  "lost",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Ctx = { supabase: SupabaseClient<Database>; userId: string };
export type Cell = string | number | boolean | null;
export type LeadRow = Record<string, Cell>;

async function assertAdmin({ supabase, userId }: Ctx) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || data !== true) throw new Error("Forbidden: admin role required");
  return supabase;
}

export const adminWhoAmI = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    return { email: String(claims["email"] ?? ""), isAdmin: data === true };
  });

const listInput = z.object({
  kind: z.enum(["audit", "pack"]),
  from: z.string().date().nullable(),
  to: z.string().date().nullable(),
  locale: z.enum(["en", "vi"]).nullable(),
  qualified: z.boolean().nullable(),
  status: z.enum(LEAD_STATUSES).nullable(),
});
export type ListInput = z.infer<typeof listInput>;

export const adminListLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => listInput.parse(input))
  .handler(async ({ data, context }) => {
    const supabase = await assertAdmin(context);
    const table = data.kind === "audit" ? "audit_requests" : "pack_signups";
    let q = supabase.from(table).select("*").order("created_at", { ascending: false }).limit(2000);
    if (data.from) q = q.gte("created_at", `${data.from}T00:00:00Z`);
    if (data.to) q = q.lte("created_at", `${data.to}T23:59:59Z`);
    if (data.locale) q = q.eq("locale", data.locale);
    if (data.status) q = q.eq("status", data.status);
    if (data.kind === "audit" && data.qualified !== null)
      q = (q as unknown as { eq: (c: string, v: boolean) => typeof q }).eq(
        "qualified",
        data.qualified,
      );
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    let downloads: Record<string, number> = {};
    if (data.kind === "pack" && rows?.length) {
      const { data: d } = await supabase.from("pack_downloads").select("signup_id");
      downloads = (d ?? []).reduce<Record<string, number>>((acc, r) => {
        const sid = (r as { signup_id: string | null }).signup_id;
        if (sid) acc[sid] = (acc[sid] ?? 0) + 1;
        return acc;
      }, {});
    }
    return {
      rows: (rows ?? []).map((r) => {
        const row = r as unknown as LeadRow;
        return data.kind === "pack"
          ? { ...row, downloads: downloads[String(row["id"])] ?? 0 }
          : row;
      }) as LeadRow[],
    };
  });

const statusInput = z.object({
  kind: z.enum(["audit", "pack"]),
  id: z.string().uuid(),
  status: z.enum(LEAD_STATUSES),
  notes: z.string().max(4000).nullable(),
});

export const adminUpdateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => statusInput.parse(input))
  .handler(async ({ data, context }) => {
    const supabase = await assertAdmin(context);
    const table = data.kind === "audit" ? "audit_requests" : "pack_signups";
    const { error } = await supabase
      .from(table)
      .update({
        status: data.status,
        notes: data.notes,
        status_updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const foundingInput = z
  .object({ total: z.number().int().min(0).max(1000), remaining: z.number().int().min(0) })
  .refine((v) => v.remaining <= v.total, { message: "remaining must be ≤ total" });

export const adminSetFounding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => foundingInput.parse(input))
  .handler(async ({ data, context }) => {
    const supabase = await assertAdmin(context);
    const { error } = await supabase
      .from("founding_slots")
      .update({
        total: data.total,
        remaining: data.remaining,
        updated_at: new Date().toISOString(),
      })
      .eq("id", true);
    if (error) throw new Error(error.message);
    const { invalidateFoundingCache } = await import("./founding.functions");
    invalidateFoundingCache();
    return { ok: true };
  });

export const adminGetFounding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await assertAdmin(context);
    const { data, error } = await supabase
      .from("founding_slots")
      .select("total, remaining, updated_at")
      .eq("id", true)
      .single();
    if (error) throw new Error(error.message);
    return data as { total: number; remaining: number; updated_at: string };
  });
