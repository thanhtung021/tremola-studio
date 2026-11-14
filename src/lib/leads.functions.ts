/**
 * Public lead-capture server functions. Every submission:
 *   1. is validated with the shared zod schema (same as the client),
 *   2. is dropped silently when the honeypot is filled,
 *   3. passes per-IP and per-email rate limits,
 *   4. is written with the server-only service role (the browser has no INSERT rights),
 *   5. triggers notification emails; email failures are logged, never shown to the visitor.
 * `qualified` is computed here only and never returned to the browser.
 */
import { createServerFn } from "@tanstack/react-start";
import { auditSchema, contactSchema, isQualified, packSchema } from "./leads";

const HOUR = 3600;
const DAY = 86400;

export class SubmissionError extends Error {}

/** End-to-end tests run with E2E_MOCK_BACKEND=true: validate, then skip database, limits and email. */
async function mockBackend() {
  const { env } = await import("@/server/env.server");
  return env("E2E_MOCK_BACKEND") === "true";
}

export const submitContactMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website || (await mockBackend())) return { ok: true };
    const { requestContext, withinRateLimits, logSubmissionError } =
      await import("@/server/leads.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendInternalNotification } = await import("@/server/email.server");
    const ctx = requestContext();
    if (
      !(await withinRateLimits([
        { bucket: "contact:ip", key: ctx.ip, max: 5, windowSeconds: HOUR },
      ]))
    )
      throw new SubmissionError("Too many messages. Please try again later.");

    const row = {
      locale: data.locale,
      name: data.name,
      email: data.email,
      company: data.company,
      message: data.message,
    };
    const { error } = await supabaseAdmin.from("contact_submissions").insert(row);
    if (error) {
      await logSubmissionError("contact", "insert", error.message, data.locale);
      throw new SubmissionError("Could not save your message");
    }
    const mail = await sendInternalNotification("contact", row);
    if (!mail.ok) await logSubmissionError("contact", "notify", mail.error, data.locale);
    return { ok: true };
  });

export const submitAuditRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => auditSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website || (await mockBackend())) return { ok: true };
    const { requestContext, withinRateLimits, logSubmissionError } =
      await import("@/server/leads.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendInternalNotification, sendVisitorConfirmation } =
      await import("@/server/email.server");
    const ctx = requestContext();
    const allowed = await withinRateLimits([
      { bucket: "audit:ip", key: ctx.ip, max: 5, windowSeconds: HOUR },
      { bucket: "audit:email", key: data.email, max: 3, windowSeconds: DAY },
    ]);
    if (!allowed) throw new SubmissionError("Too many requests. Please try again later.");

    const row = {
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
    };
    const { error } = await supabaseAdmin.from("audit_requests").insert(row);
    if (error) {
      await logSubmissionError("audit", "insert", error.message, data.locale);
      throw new SubmissionError("Could not save your request");
    }

    const [internal, visitor] = await Promise.all([
      sendInternalNotification("audit", { ...row, country: ctx.country }),
      sendVisitorConfirmation("audit", data.locale, data.email, { name: data.name }),
    ]);
    if (!internal.ok)
      await logSubmissionError("audit", "notify_internal", internal.error, data.locale);
    if (!visitor.ok)
      await logSubmissionError("audit", "notify_visitor", visitor.error, data.locale);
    return { ok: true };
  });

export const submitPackSignup = createServerFn({ method: "POST" })
  .validator((input: unknown) => packSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true; downloadUrl: string | null }> => {
    if (data.website) return { ok: true, downloadUrl: null };
    if (await mockBackend()) {
      const { signDownload, downloadPath } = await import("@/server/download.server");
      return { ok: true, downloadUrl: downloadPath(await signDownload("e2e-mock")) };
    }
    const { requestContext, withinRateLimits, logSubmissionError } =
      await import("@/server/leads.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendInternalNotification, sendVisitorConfirmation } =
      await import("@/server/email.server");
    const { signDownload, downloadPath } = await import("@/server/download.server");
    const { env } = await import("@/server/env.server");
    const ctx = requestContext();
    const allowed = await withinRateLimits([
      { bucket: "pack:ip", key: ctx.ip, max: 10, windowSeconds: HOUR },
      { bucket: "pack:email", key: data.email, max: 5, windowSeconds: DAY },
    ]);
    if (!allowed) throw new SubmissionError("Too many requests. Please try again later.");

    const row = {
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
    };
    const { data: saved, error } = await supabaseAdmin
      .from("pack_signups")
      .insert(row)
      .select("id")
      .single();
    if (error || !saved) {
      await logSubmissionError("pack", "insert", error?.message ?? "no row", data.locale);
      throw new SubmissionError("Could not save your signup");
    }

    let downloadUrl: string | null = null;
    try {
      downloadUrl = downloadPath(await signDownload(saved.id));
    } catch (e) {
      await logSubmissionError("pack", "sign", e, data.locale);
    }
    const site = env("SITE_URL") ?? "";
    const [internal, visitor] = await Promise.all([
      sendInternalNotification("pack", { ...row, country: ctx.country }),
      downloadUrl
        ? sendVisitorConfirmation("pack", data.locale, data.email, {
            name: data.name,
            link: `${site}${downloadUrl}`,
          })
        : Promise.resolve({ ok: true as boolean, error: undefined as string | undefined }),
    ]);
    if (!internal.ok)
      await logSubmissionError("pack", "notify_internal", internal.error, data.locale);
    if (!visitor.ok) await logSubmissionError("pack", "notify_visitor", visitor.error, data.locale);
    return { ok: true, downloadUrl };
  });
