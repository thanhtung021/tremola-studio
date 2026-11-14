/**
 * Transactional email through the Resend REST API (no SDK: keeps the Worker bundle small).
 * Missing configuration never breaks a submission: the lead is already saved, we only log.
 */
import { emailCopy } from "@/content/emails";
import type { Locale } from "@/i18n";
import { env } from "./env.server";

type Mail = {
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string | undefined;
};

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

type MailResult = { ok: boolean; error?: string; skipped?: boolean };

export async function sendMail(mail: Mail): Promise<MailResult> {
  const key = env("RESEND_API_KEY");
  const from = env("EMAIL_FROM");
  if (!key || !from)
    return { ok: false, error: "email not configured (RESEND_API_KEY/EMAIL_FROM)" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
    }),
  });
  if (!res.ok)
    return { ok: false, error: `resend ${res.status}: ${(await res.text()).slice(0, 300)}` };
  return { ok: true };
}

const salesInbox = () =>
  (env("SALES_INBOX") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** Brand-styled wrapper (night wood background, ivory text, bronze accents). */
function layout(preheader: string, inner: string) {
  return `<!doctype html><html><body style="margin:0;background:#1f1a14;color:#e6cf9a;font-family:'Be Vietnam Pro',Helvetica,Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1f1a14"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#282119;border:1px solid rgba(201,164,92,0.18);border-radius:16px">
<tr><td style="padding:32px 32px 8px;font-family:'Cormorant Garamond',Georgia,serif;font-size:28px;color:#e6cf9a">Tremola Studio</td></tr>
<tr><td style="padding:8px 32px 32px;font-size:15px;line-height:1.6;color:rgba(230,207,154,0.80)">${inner}</td></tr>
</table></td></tr></table></body></html>`;
}

const linkify = (line: string) =>
  esc(line).replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" style="color:#c9a45c;text-decoration:underline">$1</a>',
  );

function visitorMail(
  kind: "audit" | "pack",
  locale: Locale,
  vars: { name: string; link?: string },
): Omit<Mail, "to"> {
  const c = emailCopy[locale][kind];
  const fill = (s: string) => s.replace("{name}", vars.name).replace("{link}", vars.link ?? "");
  const lines = c.body.map(fill);
  return {
    subject: c.subject,
    text: [...lines, "", c.signoff].join("\n\n"),
    html: layout(
      c.preheader,
      lines.map((l) => `<p style="margin:0 0 16px">${linkify(l)}</p>`).join("") +
        `<p style="margin:24px 0 0;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(230,207,154,0.62)">${esc(c.signoff)}</p>`,
    ),
    replyTo: env("EMAIL_REPLY_TO") ?? salesInbox()[0],
  };
}

export async function sendVisitorConfirmation(
  kind: "audit" | "pack",
  locale: Locale,
  to: string,
  vars: { name: string; link?: string },
): Promise<MailResult> {
  // The pack email carries the download link the page promises; the audit confirmation is opt-in
  // until the copy is approved and the sending domain is verified.
  if (kind === "audit" && env("SEND_VISITOR_CONFIRMATION") !== "true")
    return { ok: true, skipped: true };
  return sendMail({ to: [to], ...visitorMail(kind, locale, vars) });
}

const LABELS: Record<string, string> = {
  qualified: "Qualified",
  locale: "Locale",
  name: "Name",
  email: "Email",
  company: "Company",
  role: "Role",
  listen_to: "Listen to",
  link: "Trailer / app link",
  team_size: "Team size",
  launch: "Launch",
  budget: "Budget",
  pain: "Notes from the visitor",
  heard_from: "Heard from",
  app_status: "App status (VI)",
  making: "Making",
  message: "Message",
  utm_source: "utm_source",
  utm_medium: "utm_medium",
  utm_campaign: "utm_campaign",
  utm_content: "utm_content",
  referrer: "Referrer",
  landing_page: "Landing page",
  country: "Country (IP)",
};

/** Internal notification to the sales inbox with every field, the qualified flag, UTM and locale. */
export async function sendInternalNotification(
  kind: "audit" | "pack" | "contact",
  row: Record<string, unknown>,
) {
  const to = salesInbox();
  if (!to.length) return { ok: false, error: "SALES_INBOX not configured" };
  const q = row["qualified"] === true;
  const subject =
    kind === "audit"
      ? `${q ? "[QUALIFIED] " : ""}Sound Audit · ${row["company"]} · ${row["name"]} (${String(row["locale"]).toUpperCase()})`
      : kind === "pack"
        ? `Free pack sign-up · ${row["name"]} (${String(row["locale"]).toUpperCase()})`
        : `Contact message · ${row["name"]} (${String(row["locale"]).toUpperCase()})`;
  const entries = Object.keys(LABELS)
    .filter((k) => k in row)
    .map((k) => [LABELS[k]!, row[k] === null || row[k] === "" ? "—" : String(row[k])] as const);
  const text = [
    subject,
    kind === "audit" ? "Reply within 24 hours." : "",
    "",
    ...entries.map(([k, v]) => `${k}: ${v}`),
  ].join("\n");
  const html = layout(
    subject,
    `<p style="margin:0 0 16px;color:#e6cf9a"><strong>${esc(subject)}</strong>${kind === "audit" ? "<br>Reply within 24 hours." : ""}</p>
<table role="presentation" cellpadding="6" cellspacing="0" style="font-size:14px;width:100%">${entries
      .map(
        ([k, v]) =>
          `<tr><td style="color:rgba(230,207,154,0.62);vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="color:#e6cf9a">${linkify(v)}</td></tr>`,
      )
      .join("")}</table>`,
  );
  return sendMail({
    to,
    subject,
    text,
    html,
    replyTo: typeof row["email"] === "string" ? row["email"] : undefined,
  });
}
