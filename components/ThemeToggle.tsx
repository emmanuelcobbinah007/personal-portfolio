"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  preloadInkBloom,
  readTheme,
  setTheme,
  subscribeTheme,
  type Theme,
} from "@/lib/theme";

/**
 * Hand-drawn sun / moon toggle. The icon swaps purely in CSS off
 * html[data-theme] (set before paint), so it is right on first paint and
 * inside the view-transition snapshots; React only tracks it for aria-pressed.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(
    subscribeTheme,
    readTheme,
    () => null,
  );
  const isDark = theme === "dark";
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // The next bloom is baked ahead of time from where the toggle sits
    preloadInkBloom(() => {
      const el = ref.current;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      className="theme-toggle"
      aria-label="Dark mode"
      aria-pressed={theme === null ? undefined : isDark}
      data-cursor="link"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTheme(readTheme() === "dark" ? "light" : "dark", {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
        });
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden>
        {/* Moon: a quick crescent and a speck of a star */}
        <g className="tt-moon">
          <path
            className="tt-stroke"
            pathLength={1}
            d="M15.6 3.6 C 10.2 3.1 5.9 7.3 6.2 12.4 C 6.5 17.4 11.1 20.9 16.2 19.9 C 17.6 19.6 18.8 19.0 19.7 18.2 C 14.7 18.6 10.8 15.2 10.7 10.9 C 10.6 7.6 12.6 4.9 15.9 3.9"
          />
          <path
            className="tt-stroke"
            pathLength={1}
            d="M18.6 6.9 Q 18.9 8.2 20.1 8.6 Q 18.9 9.0 18.6 10.3 Q 18.3 9.1 17.1 8.6 Q 18.2 8.2 18.6 6.8"
          />
        </g>
        {/* Sun: a loose circle that overshoots, and uneven rays */}
        <g className="tt-sun">
          <path
            className="tt-stroke"
            pathLength={1}
            d="M12.4 8.1 C 14.7 8.0 16.2 9.8 16.0 12.1 C 15.8 14.5 13.9 16.0 11.7 15.8 C 9.4 15.6 7.9 13.8 8.1 11.6 C 8.3 9.5 10.1 7.9 12.7 8.4"
          />
          <path
            className="tt-stroke"
            pathLength={1}
            d="M12.1 2.9 L 12.0 5.4 M12.2 18.7 L 12.0 21.3 M2.9 12.1 L 5.3 12.0 M18.8 11.8 L 21.2 12.0 M5.3 5.4 L 7.0 7.1 M17.1 17.0 L 18.8 18.6 M18.7 5.2 L 17.1 6.9 M6.9 17.1 L 5.2 18.8"
          />
        </g>
      </svg>
    </button>
  );
}
