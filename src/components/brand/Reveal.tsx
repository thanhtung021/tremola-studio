import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, reducedFade } from "@/lib/motion";

/**
 * Animates children once when 20% of the element enters the viewport.
 * `eager` (above-the-fold heroes): the same fade-up runs as a CSS animation from the first paint,
 * so server-rendered text is visible without waiting for JavaScript (LCP), with identical motion.
 */
export function Reveal({
  children,
  className,
  as = "div",
  id,
  eager,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
  id?: string;
  eager?: boolean;
}) {
  const reduce = useReducedMotion();
  if (eager) {
    const Tag = as;
    return (
      <Tag id={id} className={className ? `reveal-eager ${className}` : "reveal-eager"}>
        {children}
      </Tag>
    );
  }
  const Comp = as === "section" ? m.section : m.div;
  return (
    <Comp
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={reduce ? reducedFade : fadeUp}
    >
      {children}
    </Comp>
  );
}
