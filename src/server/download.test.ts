// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { signDownload, verifyDownload } from "./download.server";

beforeAll(() => {
  process.env["DOWNLOAD_SIGNING_SECRET"] = "test-secret-please-change";
  process.env["DOWNLOAD_TTL_SECONDS"] = "60";
  process.env["FREE_PACK_OBJECT_KEY"] = "free-pack/test.zip";
});

describe("signed pack download links", () => {
  it("round-trips a valid token", async () => {
    const t = await signDownload("00000000-0000-0000-0000-000000000001");
    const c = await verifyDownload(t);
    expect(c?.sid).toBe("00000000-0000-0000-0000-000000000001");
    expect(c?.key).toBe("free-pack/test.zip");
  });
  it("rejects an expired token", async () => {
    const t = await signDownload("x", Date.now() - 120_000);
    expect(await verifyDownload(t)).toBeNull();
  });
  it("rejects a tampered token", async () => {
    const t = await signDownload("x");
    const [p, s] = t.split(".");
    const forged = btoa(JSON.stringify({ sid: "x", key: "secret/other.zip", exp: 9e9 })).replace(
      /=+$/,
      "",
    );
    expect(await verifyDownload(`${forged}.${s}`)).toBeNull();
    expect(await verifyDownload(`${p}.AAAA`)).toBeNull();
  });
});
