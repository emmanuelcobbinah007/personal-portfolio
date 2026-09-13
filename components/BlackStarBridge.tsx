"use client";

import {
  blackStarConnectors,
  blackStarPaths,
  blackStarViewBox,
} from "@/lib/blackStarPaths";
import { useStrokeReveal } from "@/hooks/useStrokeReveal";

/**
 * Independence Arch banner between Resume and Notes.
 * Wider than content; one handwritten wave joins the arch on the right.
 * Mobile clips so roughly two-thirds of the arch stays visible on the right.
 */
export function BlackStarBridge({ className = "" }: { className?: string }) {
  const ref = useStrokeReveal("is-sketched", 0.01);

  return (
    <div
      className={`mx-auto w-full max-w-[90rem] overflow-hidden ${className}`.trim()}
    >
      <div ref={ref} className="helmet-sketch is-sketched w-full" aria-hidden>
        <svg
          className="helmet-svg block h-auto w-[145%] max-w-none -translate-x-[5%] text-cocoa sm:w-[115%] sm:-translate-x-[2%] lg:w-full lg:translate-x-0"
          viewBox={blackStarViewBox}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          preserveAspectRatio="xMidYMid meet"
        >
          <title>Accra Independence Arch sketch</title>
          {blackStarConnectors.map((d, i) => (
            <path
              key={`c-${i}`}
              className="helmet-stroke"
              pathLength={1}
              d={d}
            />
          ))}
          {blackStarPaths.map((d, i) => (
            <path
              key={`p-${i}`}
              className="helmet-stroke"
              style={{ transitionDelay: `${0.08 + i * 0.012}s` }}
              pathLength={1}
              d={d}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
