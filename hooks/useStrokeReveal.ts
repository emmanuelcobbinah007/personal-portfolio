"use client";

import { useEffect, useRef } from "react";

/** Toggle a class when the element enters/leaves view so stroke draws reverse on scroll up. */
export function useStrokeReveal(activeClass: string, threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add(activeClass);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          el.classList.add(activeClass);
        } else {
          el.classList.remove(activeClass);
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [activeClass, threshold]);

  return ref;
}
