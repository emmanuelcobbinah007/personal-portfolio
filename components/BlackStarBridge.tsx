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
 * Mobile: shift left so ~65% of the arch sits on the right of the viewport.
 */
export function BlackStarBridge({ className = "" }: { className?: string }) {
  const ref = useStrokeReveal("is-sketched", 0.01);

  return (
    <div
      className={`mx-auto w-full max-w-[90rem] overflow-hidden ${className}`.trim()}
    >
      <div ref={ref} className="helmet-sketch is-sketched w-full" aria-hidden>
        {/*
          Mobile: oversized + translate left so the Arch (right side of the
          viewBox) enters the screen. Desktop: full banner, no shift.
        */}
        <svg
          className="helmet-svg block h-auto w-[160%] max-w-none -translate-x-[42%] text-cocoa sm:w-[125%] sm:-translate-x-[14%] lg:w-full lg:translate-x-0"
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
