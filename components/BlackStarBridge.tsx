"use client";

import {
  blackStarConnectors,
  blackStarPaths,
  blackStarViewBox,
} from "@/lib/blackStarPaths";
import { useStrokeReveal } from "@/hooks/useStrokeReveal";

/**
 * Independence Arch bridge between Resume and Notes.
 * Wider than the content column; one handwritten wave joins the arch on the right.
 * Mobile shows ~65% of the arch on the right (rest clipped).
 */
export function BlackStarBridge({ className = "" }: { className?: string }) {
  const ref = useStrokeReveal("is-sketched", 0.1);

  return (
    <div
      className={`mx-auto w-full max-w-[90rem] overflow-hidden ${className}`.trim()}
    >
      <div
        ref={ref}
        className="helmet-sketch relative h-[7rem] w-full sm:h-[8.5rem] lg:h-[10rem]"
        aria-hidden
      >
        {/*
          Right-biased SVG: wave from left joins the smaller arch.
          Mobile: shift right so ~65% of the arch stays in view on the right edge.
        */}
        <svg
          className="helmet-svg absolute inset-y-0 right-0 h-full w-auto min-w-[155%] max-w-none translate-x-[12%] text-cocoa sm:min-w-[130%] sm:translate-x-[4%] lg:min-w-full lg:w-full lg:translate-x-0"
          viewBox={blackStarViewBox}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          preserveAspectRatio="xMaxYMid meet"
        >
          <title>Accra Independence Arch sketch</title>
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
              style={{ transitionDelay: `${0.12 + i * 0.014}s` }}
              pathLength={1}
              d={d}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
