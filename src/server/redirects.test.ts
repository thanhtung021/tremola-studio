import { describe, expect, it } from "vitest";
import { permanentRedirect, RETIRED_WORK } from "./redirects";

const go = (path: string, method = "GET") => {
  const url = new URL(`https://tremolastudio.com${path}`);
  return permanentRedirect(new Request(url, { method }), url);
};

describe("permanent redirects", () => {
  it("sends every retired demo URL (EN and VI) to its replacement with 301", () => {
    for (const [old, now] of Object.entries(RETIRED_WORK)) {
      for (const prefix of ["", "/vi"]) {
        const r = go(`${prefix}/work/${old}`);
        expect(r?.status).toBe(301);
        expect(r?.headers.get("location")).toBe(`https://tremolastudio.com${prefix}/work/${now}`);
      }
    }
  });

  it("drops a trailing slash with 301 and keeps the query", () => {
    const r = go("/about/?utm_source=x");
    expect(r?.status).toBe(301);
    expect(r?.headers.get("location")).toBe("https://tremolastudio.com/about?utm_source=x");
    expect(go("/vi/")?.headers.get("location")).toBe("https://tremolastudio.com/vi");
  });

  it("leaves live pages, the root and non-GET requests alone", () => {
    expect(go("/")).toBeNull();
    expect(go("/work/the-hospital")).toBeNull();
    expect(go("/about/", "POST")).toBeNull();
  });
});
