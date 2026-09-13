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
 * Mobile: right-align an oversized SVG so ~65% of the arch stays in view.
 */
export function BlackStarBridge({ className = "" }: { className?: string }) {
  const ref = useStrokeReveal("is-sketched", 0.01);

  return (
    <div
      className={`mx-auto w-full max-w-[90rem] overflow-hidden ${className}`.trim()}
    >
      <div ref={ref} className="helmet-sketch is-sketched w-full" aria-hidden>
        {/*
          Desktop: full banner. Mobile: wider SVG, right-aligned so the Arch
          (right side of the viewBox) stays on screen instead of clipping away.
        */}
        <svg
          className="helmet-svg ml-auto block h-auto w-[170%] max-w-none text-cocoa sm:w-[125%] lg:w-full"
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
              className="bridge-stroke"
              pathLength={1}
              d={d}
            />
          ))}
          {blackStarPaths.map((d, i) => (
            <path
              key={`p-${i}`}
              className="bridge-stroke"
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
