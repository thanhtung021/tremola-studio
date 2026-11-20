import { siteConfig } from "@/config/site";

/** Consent-gated analytics. Nothing loads or fires before the visitor accepts. */
export type TrackEvent =
  | "audit_form_start"
  | "audit_form_submit"
  | "pack_signup"
  | "audio_play"
  | "demo_play"
  | "before_after_toggle"
  | "pricing_view"
  | "cta_click";

const CONSENT_KEY = "tremola-consent";
type W = Window & {
  gtag?: (...a: unknown[]) => void;
  dataLayer?: unknown[];
  fbq?: ((...a: unknown[]) => void) & { queue?: unknown[] };
};

export const getConsent = (): "accepted" | "declined" | null => {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(CONSENT_KEY);
  return v === "accepted" || v === "declined" ? v : null;
};

let loaded = false;
function loadScripts() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const w = window as W;
  if (siteConfig.ga4Id) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(siteConfig.ga4Id)}`;
    document.head.appendChild(s);
    w.dataLayer = w.dataLayer ?? [];
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag("js", new Date());
    w.gtag("config", siteConfig.ga4Id);
  }
  if (siteConfig.metaPixelId) {
    const q: unknown[] = [];
    const fbq = ((...a: unknown[]) => q.push(a)) as NonNullable<W["fbq"]>;
    fbq.queue = q;
    w.fbq = fbq;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    w.fbq("init", siteConfig.metaPixelId);
    w.fbq("track", "PageView");
  }
}

export function setConsent(v: "accepted" | "declined") {
  localStorage.setItem(CONSENT_KEY, v);
  if (v === "accepted") loadScripts();
}

/** Call once on the client after hydration. */
export function initTracking() {
  if (getConsent() === "accepted") loadScripts();
}

export function track(event: TrackEvent, props: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined" || getConsent() !== "accepted") return;
  if (!siteConfig.ga4Id && !siteConfig.metaPixelId) return;
  const w = window as W;
  if (siteConfig.ga4Id) w.gtag?.("event", event, props);
  if (siteConfig.metaPixelId) w.fbq?.("trackCustom", event, props);
}
