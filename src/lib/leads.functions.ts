import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import type { Database } from "@/integrations/supabase/types";
import { auditSchema, contactSchema, isQualified, packSchema } from "./leads";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await publicClient().from("contact_submissions").insert(data);
    if (error) throw new Error("Could not save your message");
    return { ok: true };
  });

export const submitAuditRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => auditSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await publicClient().from("audit_requests").insert({
      locale: data.locale,
      name: data.name,
      email: data.email,
      company: data.company,
      role: data.role,
      listen_to: data.listenTo,
      link: data.link,
      team_size: data.teamSize,
      launch: data.launch,
      budget: data.budget,
      pain: data.pain || null,
      heard_from: data.heardFrom || null,
      app_status: data.appStatus || null,
      qualified: isQualified(data.launch, data.budget),
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      utm_content: data.utm_content,
      referrer: data.referrer,
      landing_page: data.landing_page,
    });
    if (error) {
      console.error("audit insert failed", error.message);
      throw new Error("Could not save your request");
    }
    return { ok: true };
  });

export const submitPackSignup = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => packSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await publicClient().from("pack_signups").insert({
      locale: data.locale,
      name: data.name,
      email: data.email,
      making: data.making,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      utm_content: data.utm_content,
      referrer: data.referrer,
      landing_page: data.landing_page,
    });
    if (error) {
      console.error("pack insert failed", error.message);
      throw new Error("Could not save your signup");
    }
    return { ok: true };
  });
