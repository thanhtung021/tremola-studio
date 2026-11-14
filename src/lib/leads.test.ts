import { describe, expect, it } from "vitest";
import { isQualified } from "./leads";

describe("audit qualification", () => {
  it("qualifies when launch is set and budget is above the lowest range", () => {
    expect(isQualified("2027-03", "usd_500_2000")).toBe(true);
    expect(isQualified("2027-03", "vnd_15_40m")).toBe(true);
  });
  it("does not qualify without a launch date", () => {
    expect(isQualified(null, "usd_5000_plus")).toBe(false);
  });
  it("does not qualify for 'not sure' or the lowest budget", () => {
    expect(isQualified("2027-03", "not_sure")).toBe(false);
    expect(isQualified("2027-03", "usd_under_500")).toBe(false);
    expect(isQualified("2027-03", "vnd_under_5m")).toBe(false);
  });
});

import { auditSchema, isValidLaunch, packSchema } from "./leads";

const baseAudit = {
  locale: "en" as const,
  name: "Mai",
  email: "mai@example.com",
  company: "Lantern Games",
  role: "founder",
  listenTo: "game",
  link: "https://youtu.be/abc",
  teamSize: "2-5",
  launch: "2027-03",
  budget: "usd_2000_5000",
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  referrer: null,
  landing_page: null,
};

describe("audit schema (shared client/server)", () => {
  it("accepts a complete English request", () => {
    expect(auditSchema.safeParse(baseAudit).success).toBe(true);
  });
  it("rejects a non-existent month", () => {
    expect(isValidLaunch("2027-13")).toBe(false);
    expect(isValidLaunch("2027-00")).toBe(false);
    expect(auditSchema.safeParse({ ...baseAudit, launch: "2027-13" }).success).toBe(false);
  });
  it("rejects non-http trailer links", () => {
    expect(auditSchema.safeParse({ ...baseAudit, link: "javascript:alert(1)" }).success).toBe(
      false,
    );
    expect(auditSchema.safeParse({ ...baseAudit, link: "ftp://x.y/z" }).success).toBe(false);
  });
  it("requires appStatus and a VND budget on the Vietnamese form", () => {
    const vi = { ...baseAudit, locale: "vi" as const, budget: "vnd_15_40m" };
    expect(auditSchema.safeParse(vi).success).toBe(false);
    expect(auditSchema.safeParse({ ...vi, appStatus: "has_app" }).success).toBe(true);
    expect(
      auditSchema.safeParse({ ...vi, appStatus: "has_app", budget: "usd_500_2000" }).success,
    ).toBe(false);
  });
  it("keeps the honeypot field so the server can discard bots", () => {
    const r = packSchema.safeParse({ ...baseAudit, making: "game", website: "http://spam" });
    expect(r.success && r.data.website).toBe("http://spam");
  });
});
