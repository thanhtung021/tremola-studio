import { useEffect, useRef } from "react";

/** Pauses CSS ambient loops inside the element while it is off-screen or the tab is hidden. */
export function useAmbientPause<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let visible = true;
    const apply = () => {
      if (visible && !document.hidden) el.removeAttribute("data-ambient-paused");
      else el.setAttribute("data-ambient-paused", "");
    };
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      apply();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", apply);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", apply);
    };
  }, []);
  return ref;
}
