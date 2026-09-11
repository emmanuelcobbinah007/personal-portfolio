"use client";

import { helmetPaths, helmetViewBox } from "@/lib/helmetPaths";
import Image from "next/image";
import { useEffect, useRef } from "react";

/** Da Vinci–style F1 helmet: sketch strokes draw in as it enters view. */
export function F1Helmet({
  className = "",
  variant = "mark",
}: {
  className?: string;
  variant?: "mark" | "study";
}) {
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

  if (variant === "study") {
    return (
      <div ref={ref} className={`helmet-sketch ${className}`.trim()}>
        <div className="helmet-sketch-frame relative overflow-hidden rounded-sm">
          <Image
            src="/f1-helmet-sketch.png"
            alt="Study sketch of an F1 helmet in the style of a classical drawing"
            width={720}
            height={405}
            className="helmet-sketch-raster h-auto w-full select-none"
          />
          <svg
            className="helmet-sketch-strokes pointer-events-none absolute inset-0 h-full w-full text-cocoa"
            viewBox={helmetViewBox}
            fill="none"
            aria-hidden
          >
            {helmetPaths.map((d, i) => (
              <path
                key={i}
                className="helmet-stroke"
                style={{ animationDelay: `${0.04 + i * 0.045}s` }}
                pathLength={1}
                d={d}
              />
            ))}
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`helmet-mark inline-flex ${className}`.trim()}>
      <svg
        className="h-full w-full text-cocoa"
        viewBox={helmetViewBox}
        fill="none"
        aria-hidden
      >
        {helmetPaths.slice(0, 14).map((d, i) => (
          <path
            key={i}
            className="helmet-stroke"
            style={{ animationDelay: `${i * 0.05}s` }}
            pathLength={1}
            d={d}
          />
        ))}
      </svg>
    </div>
  );
}
