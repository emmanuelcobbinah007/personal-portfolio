"use client";

import { signaturePaths, signatureViewBox } from "@/lib/signaturePaths";
import { useStrokeReveal } from "@/hooks/useStrokeReveal";

/** Real signature as vector strokes - draws on enter, undraws on leave. */
export function Signature() {
  const ref = useStrokeReveal("is-drawn", 0.2);

  return (
    <div
      ref={ref}
      className="signature-draw mx-auto max-w-6xl px-6 pb-4 pt-10 sm:px-10 lg:px-12"
      aria-hidden
    >
      <svg
        className="signature-svg mx-auto h-auto w-full max-w-xl text-cocoa"
        viewBox={signatureViewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <title>Signature</title>
        {signaturePaths.map((d, i) => (
          <path
            key={i}
            className="signature-stroke"
            style={{ transitionDelay: `${i * 0.05}s` }}
            pathLength={1}
            d={d}
          />
        ))}
      </svg>
    </div>
  );
}
