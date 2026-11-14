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
