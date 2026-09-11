"use client";

import { signaturePaths, signatureViewBox } from "@/lib/signaturePaths";
import { useEffect, useRef } from "react";

/** Real signature as vector strokes - draws like a pen when it enters view. */
export function Signature() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-drawn");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("is-drawn");
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

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
            style={{ animationDelay: `${i * 0.07}s` }}
            pathLength={1}
            d={d}
          />
        ))}
      </svg>
    </div>
  );
}
