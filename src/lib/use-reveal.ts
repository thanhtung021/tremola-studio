import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Scroll-in reveal without waiting for the lazily loaded animation bundle.
 *
 * Server-rendered content is always visible in the HTML. After hydration, only elements that are
 * still below the fold are hidden, then revealed by CSS when `amount` of them enters the viewport
 * (classes `reveal-hidden` / `reveal-in` in styles.css, same motion as `fadeUp`). Content the
 * visitor has already scrolled past is never hidden again, however slowly scripts arrive.
 * Elements mounted by a client-side navigation start hidden and reveal as soon as they are in view.
 */
export type RevealState = "static" | "hidden" | "in";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const noop = () => () => {};

/** false while hydrating server HTML, true for components first rendered in the browser. */
function useIsClientMount() {
  const isClient = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const first = useRef<boolean | null>(null);
  if (first.current === null) first.current = isClient;
  return first.current;
}

export function useReveal<T extends Element>(amount = 0.2) {
  const ref = useRef<T>(null);
  const clientMount = useIsClientMount();
  const [state, setState] = useState<RevealState>("static");

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Hydrating: whatever is already on screen (or above it) stays exactly as the server painted it.
    if (!clientMount && el.getBoundingClientRect().top < window.innerHeight) return;
    setState("hidden");
    const reveal = (entries: IntersectionObserverEntry[]) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      setState("in");
      observers.forEach((o) => o.disconnect());
    };
    const observers = [
      // Same trigger as framer-motion `amount`.
      new IntersectionObserver(reveal, { threshold: amount }),
      // Very tall sections can never be `amount` visible: also reveal once the top passes 80 %.
      new IntersectionObserver(reveal, { rootMargin: "0px 0px -20% 0px" }),
    ];
    observers.forEach((o) => o.observe(el));
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return [ref, state] as const;
}

export function revealClass(state: RevealState, base?: string) {
  const c = state === "hidden" ? "reveal-hidden" : state === "in" ? "reveal-in" : "";
  return [c, base].filter(Boolean).join(" ") || undefined;
}
