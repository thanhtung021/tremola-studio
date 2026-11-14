import { describe, expect, it } from "vitest";
import { contactSchema } from "./leads";

const valid = {
  locale: "vi",
  name: "Test",
  email: "test@example.com",
  company: "",
  message: "A project enquiry",
};
describe("contact validation", () => {
  it("accepts an enquiry with an optional company and trims inputs", () => {
    expect(contactSchema.parse({ ...valid, name: " Test " }).name).toBe("Test");
  });
  it("rejects blank required fields and invalid email", () => {
    for (const data of [
      { ...valid, name: " " },
      { ...valid, message: " " },
      { ...valid, email: "invalid" },
    ]) {
      expect(contactSchema.safeParse(data).success).toBe(false);
    }
  });
  it("enforces field length limits", () => {
    for (const [key, length] of [
      ["name", 121],
      ["company", 161],
      ["message", 2001],
    ] as const) {
      expect(contactSchema.safeParse({ ...valid, [key]: "a".repeat(length) }).success).toBe(false);
    }
  });
});
