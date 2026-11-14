/**
 * Minimal, free error tracking: browser errors are POSTed to /api/client-error and logged by the
 * Worker, where they appear in Cloudflare → Workers → tremola → Observability (Logs), next to
 * server errors. No third-party SDK, no personal data (message, stack, page path, user agent).
 * Optional: set VITE_SENTRY_DSN later if richer tooling is needed (docs/DEPLOY.md#monitoring).
 */
const MAX = 2000;
let sent = 0;

function describe(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error)
    return {
      message: error.message.slice(0, MAX),
      ...(error.stack ? { stack: error.stack.slice(0, MAX) } : {}),
    };
  return { message: String(error).slice(0, MAX) };
}

export function reportClientError(error: unknown, context: Record<string, string> = {}) {
  if (typeof window === "undefined" || sent >= 10) return; // cap per page view
  sent++;
  const body = JSON.stringify({ ...describe(error), path: location.pathname, ...context });
  try {
    if (
      !navigator.sendBeacon?.("/api/client-error", new Blob([body], { type: "application/json" }))
    )
      void fetch("/api/client-error", { method: "POST", body, keepalive: true });
  } catch {
    /* never throw from the reporter */
  }
}

let installed = false;
/** Global listeners for uncaught errors and unhandled promise rejections. */
export function installClientErrorReporting() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (e) =>
    reportClientError(e.error ?? e.message, { kind: "onerror" }),
  );
  window.addEventListener("unhandledrejection", (e) => {
    // Media play() interruptions are expected when the visitor switches tracks quickly.
    if (e.reason instanceof DOMException && e.reason.name === "AbortError") return;
    reportClientError(e.reason, { kind: "unhandledrejection" });
  });
}
