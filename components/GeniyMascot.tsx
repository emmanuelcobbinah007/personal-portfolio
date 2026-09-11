"use client";

import { geniyPaths, geniyViewBox } from "@/lib/geniyPaths";
import { useStrokeReveal } from "@/hooks/useStrokeReveal";

/** Geniy mascot as vector strokes — draws on enter, undraws on leave. */
export function GeniyMascot({ className = "" }: { className?: string }) {
  const ref = useStrokeReveal("is-sketched", 0.18);

  return (
    <div
      ref={ref}
      className={`ink-sketch ${className}`.trim()}
      aria-hidden
    >
      <svg
        className="ink-sketch-svg mx-auto h-auto w-full max-w-[11rem] text-cocoa sm:max-w-[13rem]"
        viewBox={geniyViewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <title>Geniy mascot sketch</title>
        {geniyPaths.map((d, i) => (
          <path
            key={i}
            className="ink-stroke"
            style={{ transitionDelay: `${i * 0.03}s` }}
            pathLength={1}
            d={d}
          />
        ))}
      </svg>
    </div>
  );
}
