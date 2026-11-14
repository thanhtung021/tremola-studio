import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const visible = new Set<HTMLSpanElement>();
function updateActive() {
  const first = [...visible].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
  for (const element of visible) element.dataset["gradientActive"] = String(element === first);
}

/** Only one visible text accent may receive the brushed gradient at a time. */
export function GoldText({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) visible.add(element);
      else { visible.delete(element); element.dataset["gradientActive"] = "false"; }
      updateActive();
    });
    observer.observe(element);
    return () => { observer.disconnect(); visible.delete(element); updateActive(); };
  }, []);
  return <span ref={ref} className={cn("gold-text", className)}>{children}</span>;
}