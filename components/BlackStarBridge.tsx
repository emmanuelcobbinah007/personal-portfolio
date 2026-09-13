"use client";

import {
  blackStarConnectors,
  blackStarPaths,
  blackStarViewBox,
} from "@/lib/blackStarPaths";
import { useStrokeReveal } from "@/hooks/useStrokeReveal";

/**
 * Decorative Accra Black Star Square above Notes:
 * connector strokes from the left edge into the landmark on the right.
 */
export function BlackStarBridge({ className = "" }: { className?: string }) {
  const ref = useStrokeReveal("is-sketched", 0.12);

  return (
    <div
      ref={ref}
      className={`helmet-sketch overflow-hidden ${className}`.trim()}
      aria-hidden
    >
      {/* Wider than the section on small screens so the landmark stays readable on the right while the connector still starts at the left edge. */}
      <svg
        className="helmet-svg block h-auto w-[175%] max-w-none -translate-x-[8%] text-cocoa sm:w-[145%] sm:-translate-x-[4%] lg:w-full lg:translate-x-0"
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
            style={{ transitionDelay: `${i * 0.04}s` }}
            pathLength={1}
            d={d}
          />
        ))}
        {blackStarPaths.map((d, i) => (
          <path
            key={`p-${i}`}
            className="helmet-stroke"
            style={{
              transitionDelay: `${0.12 + i * 0.012}s`,
            }}
            pathLength={1}
            d={d}
          />
        ))}
      </svg>
    </div>
  );
}
