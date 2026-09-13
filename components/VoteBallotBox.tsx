"use client";

import { votePaths, voteViewBox } from "@/lib/votePaths";
import { useStrokeReveal } from "@/hooks/useStrokeReveal";

/** VoteAurora ballot box as vector strokes — draws on enter, undraws on leave. */
export function VoteBallotBox({ className = "" }: { className?: string }) {
  const ref = useStrokeReveal("is-sketched", 0.18);

  return (
    <div
      ref={ref}
      className={`helmet-sketch ${className}`.trim()}
      aria-hidden
    >
      <svg
        className="helmet-svg mx-auto h-auto w-full max-w-[14rem] text-cocoa sm:max-w-[16rem] lg:max-w-[18rem]"
        viewBox={voteViewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <title>VoteAurora ballot box sketch</title>
        {votePaths.map((d, i) => (
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
