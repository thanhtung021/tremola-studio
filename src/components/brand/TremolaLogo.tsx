import { m, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import { ease, tremoloKeyframes } from "@/lib/motion";

type Props = {
  size?: number;
  withTile?: boolean;
  animated?: "intro" | "hover" | "none";
  className?: string;
  /** Change this number to play the pluck programmatically. */
  pluckSignal?: number;
};

const INTRO_KEY = "tremola-intro-played";
// Official logo colors — exact values from the brand mark, never change.
const C = { tile: "#1f1a14", gold: "#c9a45c", ivory: "#e6cf9a" };
const RING_LEN = 2 * Math.PI * 25;
const segs = [
  { y: 16, h: 9.4 },
  { y: 26.8, h: 9.6 },
  { y: 37.8, h: 10.2 },
];

export function TremolaLogo({
  size = 40,
  withTile = false,
  animated = "none",
  className,
  pluckSignal,
}: Props) {
  const maskId = `tremola-mask-${useId().replace(/:/g, "")}`;
  const reduce = useReducedMotion();
  const pluck = useAnimationControls();
  const [playIntro, setPlayIntro] = useState(false);

  useEffect(() => {
    if (animated !== "intro" || reduce) return;
    if (sessionStorage.getItem(INTRO_KEY)) return;
    sessionStorage.setItem(INTRO_KEY, "1");
    setPlayIntro(true);
  }, [animated, reduce]);

  useEffect(() => {
    if (!playIntro) return;
    const t = setTimeout(() => doPluck(), 1150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playIntro]);

  useEffect(() => {
    if (!pluckSignal) return;
    const t = setTimeout(() => doPluck(), 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pluckSignal]);

  function doPluck() {
    if (reduce) return;
    pluck.start({ x: tremoloKeyframes, transition: { duration: 0.7, ease } });
  }

  const i = playIntro; // whether to start from hidden state
  return (
    <m.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="Tremola Studio"
      className={className}
      onMouseEnter={animated === "hover" ? doPluck : undefined}
      key={i ? "intro" : "static"}
    >
      <defs>
        <mask id={maskId}>
          <rect width="64" height="64" fill="#fff" />
          <circle cx="38" cy="28" r="14" fill="#000" />
        </mask>
      </defs>
      {withTile && <rect className="t-tile" width="64" height="64" rx="12" fill={C.tile} />}
      <m.circle
        className="t-ring"
        cx="32"
        cy="32"
        r="25"
        fill="none"
        stroke={C.gold}
        strokeWidth="1.6"
        strokeDasharray={RING_LEN}
        initial={i ? { strokeDashoffset: RING_LEN } : false}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.9, ease }}
        style={{ rotate: -90, transformOrigin: "32px 32px" }}
      />
      <m.circle
        className="t-moon"
        cx="30"
        cy="33"
        r="16"
        fill={C.gold}
        mask={`url(#${maskId})`}
        initial={i ? { opacity: 0, scale: 0.96 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease }}
        style={{ transformOrigin: "30px 33px" }}
      />
      <m.g animate={pluck}>
        <g className="t-bamboo" fill={C.ivory}>
          {segs.map((s, idx) => (
            <m.rect
              key={idx}
              className="t-seg"
              x="43"
              y={s.y}
              width="2"
              height={s.h}
              rx="1"
              initial={i ? { scaleY: 0 } : false}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.5 + (2 - idx) * 0.09, duration: 0.4, ease }}
              style={{ transformOrigin: `44px ${s.y + s.h}px` }}
            />
          ))}
        </g>
        <m.path
          className="t-leaf"
          fill={C.ivory}
          d="M45 21.2C46.6 18.4 49 16.6 52 16c-1.2 2.8-3.6 4.6-7 5.2z"
          initial={i ? { opacity: 0, rotate: -14 } : false}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.85, duration: 0.4, ease }}
          style={{ transformOrigin: "45px 21.2px" }}
        />
      </m.g>
    </m.svg>
  );
}
