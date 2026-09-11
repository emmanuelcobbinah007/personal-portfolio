"use client";

import { brandPaths, brandViewBox } from "@/lib/brandPaths";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "mrcob-brand-drawn";

/** Handwritten MrCob.binah — draws once on first visit this session. */
export function BrandMark() {
  const ref = useRef<HTMLSpanElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const already =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(STORAGE_KEY) === "1";

    if (already) return;

    setAnimate(true);
    const id = requestAnimationFrame(() => {
      el.classList.add("is-drawn");
      sessionStorage.setItem(STORAGE_KEY, "1");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <span
      ref={ref}
      className="brand-mark inline-flex items-center text-cocoa"
      data-animate={animate ? "true" : "false"}
      aria-hidden
    >
      <svg
        className="brand-mark-svg h-7 w-auto sm:h-8"
        viewBox={brandViewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <title>MrCob.binah</title>
        {brandPaths.map((d, i) => (
          <path
            key={i}
            className="brand-stroke"
            style={{ transitionDelay: animate ? `${i * 0.04}s` : "0s" }}
            pathLength={1}
            d={d}
          />
        ))}
      </svg>
    </span>
  );
}
