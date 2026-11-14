import { describe, expect, it } from "vitest";
import { formatListed, formatPrice, pricing, rights, rightsLabel, showFounding } from "./pricing";

const en = (id: string) => pricing.en.packages.find((p) => p.id === id)!;
const vi = (id: string) => pricing.vi.packages.find((p) => p.id === id)!;

describe("pricing", () => {
  it("formats VND with dots and đ", () => {
    expect(formatPrice(7_000_000, "VND")).toBe("7.000.000đ");
  });
  it("keeps USD listed and founding prices", () => {
    expect([en("basic").listed, en("basic").founding]).toEqual([550, 200]);
    expect([en("premium").listed, en("premium").founding]).toEqual([4500, 999]);
  });
  it("keeps VND prices", () => {
    expect([vi("indie").listed, vi("indie").founding]).toEqual([20_000_000, 5_000_000]);
  });
  it("live recording has no discount and VI shows Liên hệ", () => {
    expect(en("live-recording").founding).toBeNull();
    expect(formatListed(en("live-recording"), "USD")).toBe("$300–$600");
    expect(formatListed(vi("live-recording"), "VND")).toBe("Liên hệ");
  });
  it("hides founding price when no slots remain", () => {
    expect(showFounding(en("basic"), 0)).toBe(false);
    expect(showFounding(en("basic"), 5)).toBe(true);
  });
  it("rights: non-exclusive −20%, exclusive base, buyout +50%", () => {
    expect(rights.map((r) => rightsLabel(r.modifier))).toEqual(["−20%", "Base price", "+50%"]);
  });
});
