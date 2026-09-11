"use client";

import { helmetPaths, helmetViewBox } from "@/lib/helmetPaths";
import { useEffect, useRef } from "react";

/** F1 helmet as vector strokes - draws like a pen when it enters view (same idea as Signature). */
export function F1Helmet({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-sketched");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("is-sketched");
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`helmet-sketch ${className}`.trim()}
      aria-hidden
    >
      <svg
        className="helmet-svg mx-auto h-auto w-full max-w-md text-cocoa"
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
            style={{ animationDelay: `${i * 0.035}s` }}
            pathLength={1}
            d={d}
          />
        ))}
      </svg>
    </div>
  );
}
