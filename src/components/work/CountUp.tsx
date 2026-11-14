import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Counts the numeric part of a value up once when in view ("+40%" -> 0..40). */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const m = value.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
  const [shown, setShown] = useState(m ? `${m[1]}0${m[3]}` : value);
  useEffect(() => {
    if (!m || !inView) return;
    const target = parseFloat(m[2]!.replace(",", "."));
    if (reduce) return setShown(value);
    const decimals = (m[2]!.split(/[.,]/)[1] ?? "").length;
    const c = animate(0, target, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(`${m[1]}${v.toFixed(decimals)}${m[3]}`),
    });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  return <span ref={ref}>{shown}</span>;
}
