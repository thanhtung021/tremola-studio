import type { ReactNode } from "react";
import { revealClass, useReveal } from "@/lib/use-reveal";

/**
 * Fades children up once when 20% of the element enters the viewport (CSS, see useReveal).
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
  const Tag = as;
  if (eager) {
    return (
      <Tag id={id} className={className ? `reveal-eager ${className}` : "reveal-eager"}>
        {children}
      </Tag>
    );
  }
  return (
    <InView as={Tag} id={id} className={className}>
      {children}
    </InView>
  );
}

function InView({
  as: Tag,
  id,
  className,
  children,
}: {
  as: "div" | "section";
  id?: string | undefined;
  className?: string | undefined;
  children: ReactNode;
}) {
  const [ref, state] = useReveal<HTMLElement>(0.2);
  return (
    <Tag ref={ref as never} id={id} className={revealClass(state, className)}>
      {children}
    </Tag>
  );
}
