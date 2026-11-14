import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** A 1px line that vibrates like a plucked string on view and on hover. */
export function StringDivider({
  className,
  pluckSignal,
}: {
  className?: string;
  pluckSignal?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const gradientId = `string-${useId().replace(/:/g, "")}`;
  const pathRef = useRef<SVGPathElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduce = useReducedMotion();
  const [width, setWidth] = useState(1000);
  const raf = useRef(0);
  const H = 10;
  const mid = H / 2;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => e && setWidth(Math.max(1, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const flat = `M0 ${mid} L${width} ${mid}`;

  function pluck() {
    if (reduce || !pathRef.current) return;
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 800);
      const amp = 3 * (1 - p) * Math.cos(p * Math.PI * 9);
      pathRef.current?.setAttribute(
        "d",
        `M0 ${mid} Q${width / 2} ${mid + amp * 2} ${width} ${mid}`,
      );
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }

  useEffect(() => {
    if (inView) pluck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  useEffect(() => {
    if (pluckSignal) pluck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pluckSignal]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <svg
      ref={ref}
      aria-hidden
      className={cn("block h-[10px] w-full", className)}
      viewBox={`0 0 ${width} ${H}`}
      preserveAspectRatio="none"
      onMouseEnter={pluck}
    >
      <defs>
        <linearGradient id={gradientId}>
          <stop className="string-light-stop" offset="0%" stopOpacity="0" />
          <stop className="string-light-stop" offset="50%" stopOpacity="1" />
          <stop className="string-light-stop" offset="100%" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d={flat}
        stroke={`url(#${gradientId})`}
        strokeWidth="1"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
