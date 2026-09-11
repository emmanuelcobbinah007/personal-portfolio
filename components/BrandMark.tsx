"use client";

import { site } from "@/lib/content";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "mrcob-brand-drawn";

/** Clean Instrument Serif wordmark — first-visit wipe. */
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
      <span className="brand-mark-text font-display text-[1.35rem] leading-none tracking-[-0.01em] sm:text-[1.5rem]">
        {site.shortName}
      </span>
    </span>
  );
}
