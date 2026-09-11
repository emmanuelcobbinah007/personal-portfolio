"use client";

import { brandPaths, brandViewBox } from "@/lib/brandPaths";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "mrcob-brand-drawn";

/** Handwritten MrCob.binah — solid ink mark, draws once per session. */
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
      className="brand-mark inline-flex items-center text-ink"
      data-animate={animate ? "true" : "false"}
      aria-hidden
    >
      <svg
        className="brand-mark-svg h-8 w-auto sm:h-9"
        viewBox={brandViewBox}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <title>MrCob.binah</title>
        {brandPaths.map((d, i) => (
          <path key={i} className="brand-fill" d={d} />
        ))}
      </svg>
    </span>
  );
}
