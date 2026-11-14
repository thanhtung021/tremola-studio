/**
 * Smoke tests (docs/TESTING.md).
 * Local/CI: starts `vite dev` with E2E_MOCK_BACKEND=true, so forms are validated by the real server
 * functions but nothing is written to the database or emailed. Media requests are answered with tiny
 * fixtures (e2e/fixtures) so tests don't depend on R2.
 * Against a deployed preview: E2E_BASE_URL=https://… bun run e2e --grep @remote
 */
import { defineConfig, devices } from "@playwright/test";

const PORT = 8110;
const remote = process.env["E2E_BASE_URL"];

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env["CI"] ? 1 : 0,
  reporter: process.env["CI"] ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: remote ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...(process.env["CI"] ? {} : { channel: "chrome" }),
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"], viewport: { width: 375, height: 812 } },
    },
  ],
  ...(remote
    ? {}
    : {
        webServer: {
          command: `bunx vite dev --port ${PORT} --strictPort`,
          url: `http://localhost:${PORT}`,
          reuseExistingServer: !process.env["CI"],
          timeout: 180_000,
          env: {
            E2E_MOCK_BACKEND: "true",
            DOWNLOAD_SIGNING_SECRET: "e2e-only-secret",
            VITE_APP_ENV: "development",
          },
        },
      }),
});
