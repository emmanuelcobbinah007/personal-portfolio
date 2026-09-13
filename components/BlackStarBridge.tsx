"use client";

import {
  blackStarConnectors,
  blackStarPaths,
  blackStarViewBox,
} from "@/lib/blackStarPaths";
import { useStrokeReveal } from "@/hooks/useStrokeReveal";

/**
 * Independence Arch banner between Resume and Notes.
 * Wider than the content column; one handwritten wave joins the arch.
 * Mobile: overflow clips so ~65% of the arch stays on the right.
 */
export function BlackStarBridge({ className = "" }: { className?: string }) {
  const ref = useStrokeReveal("is-sketched", 0.01);

  return (
    <div
      className={`mx-auto w-[min(100%,90rem)] overflow-hidden ${className}`.trim()}
    >
      <div
        ref={ref}
        className="helmet-sketch is-sketched relative w-full"
        aria-hidden
      >
        {/*
          Banner SVG: full width on desktop. On mobile, widen + shift left
          so the arch sits on the right with ~65% visible.
        */}
        <svg
          className="helmet-svg block h-auto w-[155%] max-w-none -translate-x-[8%] text-cocoa sm:w-[120%] sm:-translate-x-[4%] lg:w-full lg:translate-x-0"
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
              style={{ transitionDelay: "0s" }}
              pathLength={1}
              d={d}
            />
          ))}
          {blackStarPaths.map((d, i) => (
            <path
              key={`p-${i}`}
              className="helmet-stroke"
              style={{ transitionDelay: `${0.1 + i * 0.012}s` }}
              pathLength={1}
              d={d}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
