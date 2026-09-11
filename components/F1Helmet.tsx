"use client";

import { helmetPaths, helmetViewBox } from "@/lib/helmetPaths";
import { useStrokeReveal } from "@/hooks/useStrokeReveal";

/** F1 helmet as vector strokes - draws on enter, undraws on leave. */
export function F1Helmet({ className = "" }: { className?: string }) {
  const ref = useStrokeReveal("is-sketched", 0.18);

  return (
    <div
      ref={ref}
      className={`helmet-sketch ${className}`.trim()}
      aria-hidden
    >
      <svg
        className="helmet-svg mx-auto h-auto w-full max-w-[13.5rem] text-cocoa sm:max-w-[16rem]"
        viewBox={helmetViewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <title>F1 helmet sketch</title>
        {helmetPaths.map((d, i) => (
          <path
            key={i}
            className="helmet-stroke"
            style={{ transitionDelay: `${i * 0.02}s` }}
            pathLength={1}
            d={d}
          />
        ))}
      </svg>
    </div>
  );
}
