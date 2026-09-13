"use client";

import {
  blackStarConnectors,
  blackStarPaths,
  blackStarViewBox,
} from "@/lib/blackStarPaths";
import { useStrokeReveal } from "@/hooks/useStrokeReveal";

/**
 * Full-bleed Accra Black Star Square above Notes:
 * one handwritten wavy stroke from the left edge into the landmark on the right.
 */
export function BlackStarBridge({ className = "" }: { className?: string }) {
  const ref = useStrokeReveal("is-sketched", 0.1);

  return (
    <div
      ref={ref}
      className={`helmet-sketch relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden ${className}`.trim()}
      aria-hidden
    >
      <svg
        className="helmet-svg block h-auto w-[165%] max-w-none -translate-x-[6%] text-cocoa sm:w-[135%] sm:-translate-x-[3%] lg:w-full lg:translate-x-0"
        viewBox={blackStarViewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        preserveAspectRatio="xMinYMid meet"
      >
        <title>Accra Black Star Square sketch</title>
        {blackStarConnectors.map((d, i) => (
          <path
            key={`c-${i}`}
            className="helmet-stroke"
            style={{ transitionDelay: "0s" }}
            pathLength={1}
            d={d}
          />
        ))}
        {blackStarPaths.map((d, i) => (
          <path
            key={`p-${i}`}
            className="helmet-stroke"
            style={{ transitionDelay: `${0.15 + i * 0.015}s` }}
            pathLength={1}
            d={d}
          />
        ))}
      </svg>
    </div>
  );
}
