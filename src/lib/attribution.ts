/** First-visit UTM + referrer capture, kept for the browser session. Call from useEffect only. */
const KEY = "tremola-attribution";
export type Attribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
};
const clip = (v: string | null) => (v ? v.slice(0, 200) : null);

export function captureAttribution() {
  if (typeof window === "undefined" || sessionStorage.getItem(KEY)) return;
  const q = new URLSearchParams(window.location.search);
  const a: Attribution = {
    utm_source: clip(q.get("utm_source")),
    utm_medium: clip(q.get("utm_medium")),
    utm_campaign: clip(q.get("utm_campaign")),
    utm_content: clip(q.get("utm_content")),
    referrer: document.referrer ? document.referrer.slice(0, 500) : null,
    landing_page: (window.location.pathname + window.location.search).slice(0, 500),
  };
  sessionStorage.setItem(KEY, JSON.stringify(a));
}

export function getAttribution(): Attribution {
  const empty: Attribution = {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    referrer: null,
    landing_page: null,
  };
  if (typeof window === "undefined") return empty;
  try {
    return { ...empty, ...JSON.parse(sessionStorage.getItem(KEY) ?? "{}") };
  } catch {
    return empty;
  }
}
