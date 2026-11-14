import type { Transition, Variants } from "framer-motion";

export const ease = [0.22, 1, 0.36, 1] as const;
export const durations = { fast: 0.25, base: 0.6, slow: 0.9 } as const;

/** Damped horizontal vibration, like a plucked string settling (SVG units / px). */
export const tremoloKeyframes = [0, 0.7, -0.55, 0.4, -0.25, 0.1, 0];
export const tremoloTransition: Transition = { duration: 0.7, ease };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: durations.base, ease } },
};

export const reducedFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

export const staggerChildren: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
