import { z } from "zod";

/** Option codes are stored; labels live in the form copy (EN/VI). */
export const auditOptions = {
  role: ["founder", "creative_director", "producer", "product_design", "marketing_brand", "other"],
  listenTo: ["game", "app", "brand_media"],
  teamSize: ["1", "2-5", "6-20", "21-50", "50+"],
  budgetEn: ["usd_under_500", "usd_500_2000", "usd_2000_5000", "usd_5000_plus", "not_sure"],
  budgetVi: ["vnd_under_5m", "vnd_5_15m", "vnd_15_40m", "vnd_over_40m", "not_sure"],
  heardFrom: ["reddit", "linkedin", "youtube_tiktok", "email", "discord_jam", "referral", "other"],
  appStatus: ["has_app", "building", "no_app"],
  making: ["game", "app", "video", "other"],
} as const;

const LOWEST_BUDGETS = ["usd_under_500", "vnd_under_5m"];

/** qualified = launch is set AND budget is neither "not sure" nor the lowest range. */
export function isQualified(launch: string | null, budget: string) {
  return !!launch && budget !== "not_sure" && !LOWEST_BUDGETS.includes(budget);
}

const attribution = {
  utm_source: z.string().max(200).nullable(),
  utm_medium: z.string().max(200).nullable(),
  utm_campaign: z.string().max(200).nullable(),
  utm_content: z.string().max(200).nullable(),
  referrer: z.string().max(500).nullable(),
  landing_page: z.string().max(500).nullable(),
};

const oneOf = (values: readonly string[], msg: string) =>
  z.string().refine((v) => values.includes(v), { message: msg });

export const auditSchema = z.object({
  locale: z.enum(["en", "vi"]),
  name: z.string().trim().min(1, "name").max(120, "name"),
  email: z.string().trim().email("email").max(255, "email"),
  company: z.string().trim().min(1, "company").max(160, "company"),
  role: oneOf(auditOptions.role, "role"),
  listenTo: oneOf(auditOptions.listenTo, "listenTo"),
  link: z.string().trim().url("link").max(500, "link").refine((v) => /^https?:\/\//i.test(v), "link"),
  teamSize: oneOf(auditOptions.teamSize, "teamSize"),
  launch: z.string().regex(/^\d{4}-\d{2}$/, "launch").nullable(),
  budget: oneOf([...auditOptions.budgetEn, ...auditOptions.budgetVi], "budget"),
  pain: z.string().trim().max(2000, "pain").optional(),
  heardFrom: z.union([oneOf(auditOptions.heardFrom, "heardFrom"), z.literal("")]).optional(),
  appStatus: z.union([oneOf(auditOptions.appStatus, "appStatus"), z.literal("")]).optional(),
  ...attribution,
});
export type AuditInput = z.infer<typeof auditSchema>;

export const packSchema = z.object({
  locale: z.enum(["en", "vi"]),
  name: z.string().trim().min(1, "name").max(120, "name"),
  email: z.string().trim().email("email").max(255, "email"),
  making: oneOf(auditOptions.making, "making"),
  ...attribution,
});
export type PackInput = z.infer<typeof packSchema>;

export const contactSchema = z.object({
  locale: z.enum(["en", "vi"]),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(160),
  message: z.string().trim().min(1).max(2000),
});
