import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const tone = readFileSync(path.resolve("e2e/fixtures/tone.mp3"));
const clip = readFileSync(path.resolve("e2e/fixtures/clip.mp4"));
const remote = !!process.env["E2E_BASE_URL"];

/** Serve media from fixtures (local runs) and dismiss the cookie notice. */
async function prepare(page: Page) {
  if (!remote) {
    await page.route("**/media/**", (route) => {
      const url = route.request().url();
      if (url.endsWith(".mp4")) return route.fulfill({ body: clip, contentType: "video/mp4" });
      if (/\.(jpg|webp)$/.test(url)) return route.fulfill({ status: 404, body: "" });
      return route.fulfill({ body: tone, contentType: "audio/mpeg" });
    });
  }
  await page.addInitScript(() => {
    try {
      localStorage.setItem("tremola-consent", "declined");
    } catch {
      /* ignore */
    }
  });
}

test.beforeEach(async ({ page }) => prepare(page));

/** Navigate and wait until the page has hydrated (no pending module/network requests). */
async function open(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}

test("home renders in English with its own SEO head @remote", async ({ page }) => {
  await open(page, "/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page).toHaveTitle(/Tremola Studio/);
  await expect(page.locator('html[lang="en"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="vi"]')).toHaveCount(1);
});

/** Clicks the EN/VI switch; on mobile it lives in the menu. */
async function switchLanguage(page: Page, to: "en" | "vi") {
  await page.waitForLoadState("networkidle");
  const link = page.locator(`[aria-label="Language"] a[hreflang="${to}"]:visible`);
  if (!(await link.count())) {
    await page.locator("header button[aria-expanded]").first().click();
    await expect(link.first()).toBeVisible();
  }
  await link.first().click();
}

test("language switch goes to the Vietnamese page and back @remote", async ({ page }) => {
  await open(page, "/services");
  await switchLanguage(page, "vi");
  await expect(page).toHaveURL(/\/vi\/services$/);
  await expect(page.locator('html[lang="vi"]')).toHaveCount(1);
  await switchLanguage(page, "en");
  await expect(page).toHaveURL(/\/services$/);
});

test("audio plays on click and only one track plays at a time", async ({ page }) => {
  await open(page, "/work/lantern-valley");
  const playingTitles = async () =>
    new Set(
      (await page
        .locator('button[aria-label^="Pause "]')
        .evaluateAll((els) =>
          els.map((e) => e.getAttribute("aria-label")!.replace(/^Pause /, "")),
        )) as string[],
    );
  const labels = await page
    .locator('button[aria-label^="Play "]')
    .evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute("aria-label")!))]);
  expect(labels.length).toBeGreaterThan(1);
  const [first, second] = labels as [string, string];

  await page.locator(`button[aria-label="${first}"]`).first().click();
  await expect(page.locator('[aria-label="Now playing"]')).toBeVisible();
  await expect.poll(playingTitles).toEqual(new Set([first.replace(/^Play /, "")]));

  await page.locator(`button[aria-label="${second}"]`).first().click();
  // The first track stopped: exactly one track (the second) is playing anywhere on the page.
  await expect.poll(playingTitles).toEqual(new Set([second.replace(/^Play /, "")]));
});

test("no audio autoplays and media is not preloaded @remote", async ({ page }) => {
  await open(page, "/");
  await page.waitForTimeout(1500);
  await expect(page.locator('[data-audio-playing="true"]')).toHaveCount(0);
  const preloads = await page.$$eval("audio, video", (els) =>
    els.map((e) => (e as HTMLMediaElement).preload),
  );
  expect(preloads.every((p) => p === "none")).toBe(true);
});

test("before/after toggle switches version while playing", async ({ page }) => {
  await open(page, "/sound-audit");
  const player = page.locator('[aria-label^="Before and after"]');
  await player.locator('button[aria-label="Play"]').first().click();
  await expect(player).toHaveAttribute("data-audio-playing", "true");
  await player.getByRole("radio", { name: "Before" }).click();
  await expect(player.getByRole("radio", { name: "Before" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(player).toHaveAttribute("data-audio-playing", "true");
  await player.locator('button[aria-label="Pause"]').click();
  await expect(player).toHaveAttribute("data-audio-playing", "false");
});

async function fillAudit(page: Page, vi: boolean) {
  await page.fill("#a-name", "E2E Test");
  await page.fill("#a-email", "e2e@example.com");
  await page.fill("#a-company", "E2E Studio");
  await page.selectOption("#a-role", "founder");
  if (vi) await page.selectOption("#a-appStatus", "has_app");
  await page.locator("#a-listenTo [role=radio]").first().click();
  await page.fill("#a-link", "https://example.com/trailer");
  await page.selectOption("#a-teamSize", "2-5");
  await page.selectOption("#a-launch", "06");
  await page.locator("#a-launch").locator("xpath=following-sibling::select").selectOption({
    index: 2,
  });
  await page.selectOption("#a-budget", vi ? "vnd_15_40m" : "usd_2000_5000");
}

test("Sound Audit form validates and submits in English", async ({ page }) => {
  await open(page, "/sound-audit");
  await page.getByRole("button", { name: "Request my free audit" }).click();
  await expect(page.locator("#a-name-error, [id$='-error']").first()).toBeVisible();
  await fillAudit(page, false);
  await page.getByRole("button", { name: "Request my free audit" }).click();
  await expect(page.getByRole("status")).toContainText("Thank you");
});

test("Sound Audit form submits in Vietnamese", async ({ page }) => {
  await open(page, "/vi/sound-audit");
  await fillAudit(page, true);
  await page.getByRole("button", { name: "Gửi yêu cầu audit miễn phí" }).click();
  await expect(page.getByRole("status")).toContainText("Cảm ơn bạn");
});

test("Free Pack form returns a signed, time-limited download link", async ({ page }) => {
  await open(page, "/free-pack");
  await page.fill("#p-name", "E2E Test");
  await page.fill("#p-email", "e2e@example.com");
  await page.selectOption("#p-making", "game");
  await page.getByRole("button", { name: "Get the free pack" }).click();
  const link = page.getByRole("link", { name: "Download the pack" });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", /^\/api\/pack\/download\?t=[\w-]+\.[\w-]+$/);
  // A tampered token is refused.
  const res = await page.request.get("/api/pack/download?t=forged.token");
  expect(res.status()).toBe(410);
});

test("admin requires login @remote", async ({ page }) => {
  await open(page, "/admin");
  await expect(page.locator("#admin-email")).toBeVisible();
  await expect(page.locator("#admin-password")).toBeVisible();
  await expect(page.getByText("Sound Audit requests")).toHaveCount(0);
  const robots = await page.locator('meta[name="robots"]').first().getAttribute("content");
  expect(robots).toContain("noindex");
});

const viPages = [
  "/vi",
  "/vi/work",
  "/vi/work/lantern-valley",
  "/vi/services",
  "/vi/sound-audit",
  "/vi/free-pack",
  "/vi/about",
];

test("Vietnamese pages: diacritics in every font, no heading overflow at 375 px @remote", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const url of viPages) {
    await open(page, url);
    const result = await page.evaluate(async () => {
      await document.fonts.ready;
      const sample = "đĐ ư ơ ả ỗ ặ ễ ự Âm thanh có hồn riêng";
      const fonts = [
        '500 32px "Cormorant Garamond"',
        '400 16px "Be Vietnam Pro"',
        '400 13px "JetBrains Mono"',
      ];
      // Load the Vietnamese subset explicitly, then confirm it is available.
      await Promise.all(fonts.map((f) => document.fonts.load(f, sample)));
      const missing = fonts.filter((f) => !document.fonts.check(f, sample));
      // Measure the rendered text itself (decorative pseudo-elements may extend past the box).
      const overflow = [...document.querySelectorAll("h1, h2, h3")]
        .filter((h) => (h as HTMLElement).offsetParent !== null)
        .filter((h) => {
          const range = document.createRange();
          range.selectNodeContents(h);
          const text = range.getBoundingClientRect();
          const box = h.getBoundingClientRect();
          return text.right > Math.min(box.right, innerWidth) + 1 || text.left < -1;
        })
        .map((h) => h.textContent?.trim().slice(0, 60));
      return { missing, overflow, pageOverflow: document.documentElement.scrollWidth > innerWidth };
    });
    expect(result.missing, `${url}: fonts without Vietnamese glyphs`).toEqual([]);
    expect(result.overflow, `${url}: headings overflowing at 375px`).toEqual([]);
    expect(result.pageOverflow, `${url}: horizontal page scroll`).toBe(false);
  }
});
