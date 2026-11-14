import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("CSV export", () => {
  it("quotes commas, quotes and newlines and keeps Vietnamese text", () => {
    const csv = toCsv([{ name: 'Mai "Lan", Nguyễn', pain: "line1\nline2" }], ["name", "pain"]);
    expect(csv).toBe('﻿name,pain\r\n"Mai ""Lan"", Nguyễn","line1\nline2"');
  });
  it("neutralises formula injection", () => {
    expect(toCsv([{ a: "=HYPERLINK(1)" }], ["a"])).toBe("﻿a\r\n'=HYPERLINK(1)");
  });
});
