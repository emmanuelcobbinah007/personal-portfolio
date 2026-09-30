"use client";

export type Theme = "light" | "dark";

export const THEME_KEY = "mrcob-theme";

/** Browser-chrome colour per theme (matches --parchment). */
export const THEME_COLORS: Record<Theme, string> = {
  light: "#F5F1E9",
  dark: "#211A16",
};

export function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function subscribeTheme(onChange: () => void): () => void {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => mo.disconnect();
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* private mode: the choice just won't persist */
  }
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((m) => m.setAttribute("content", THEME_COLORS[theme]));
}

type PaintWorkletCSS = typeof CSS & {
  paintWorklet?: { addModule(url: string): Promise<void> };
};

let workletReady = false;
let workletLoading: Promise<void> | null = null;

/** Load the ink-bloom paint worklet once (Chrome/Edge). Safe to call often. */
export function preloadInkBloom(): void {
  const css = CSS as PaintWorkletCSS;
  if (workletLoading || !css.paintWorklet) return;
  workletLoading = css.paintWorklet
    .addModule("/ink-bloom-worklet.js")
    .then(() => {
      workletReady = true;
    })
    .catch(() => {
      /* fall back to the crossfade */
    });
}

const BLOOM_VARS = ["--ink-x", "--ink-y", "--ink-seed"] as const;

/**
 * Switch theme. With View Transitions + CSS Paint the new theme soaks in as an
 * ink bloom from `origin`; with View Transitions only it crossfades; otherwise
 * (or under reduced motion) it swaps instantly.
 */
export function setTheme(next: Theme, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || typeof document.startViewTransition !== "function") {
    applyTheme(next);
    return;
  }

  const painterly = workletReady;
  const x = origin?.x ?? window.innerWidth - 40;
  const y = origin?.y ?? 40;
  // Fresh randomness every time: shape seed, duration and soak curve
  const seed = Math.floor(Math.random() * 2 ** 31);
  const duration = 1300 + Math.random() * 300;
  // Quick start, long soak. Radius eases out; area (~r^2) reads near-linear.
  const e1 = (0.26 + Math.random() * 0.08).toFixed(3);
  const e2 = (0.24 + Math.random() * 0.1).toFixed(3);
  const e3 = (0.42 + Math.random() * 0.1).toFixed(3);

  root.style.setProperty("--ink-x", String(Math.round(x)));
  root.style.setProperty("--ink-y", String(Math.round(y)));
  root.style.setProperty("--ink-seed", String(seed));
  root.classList.add(painterly ? "ink-bloom" : "ink-fade");

  const vt = document.startViewTransition(() => applyTheme(next));

  if (painterly) {
    vt.ready
      .then(() => {
        root.animate(
          { "--ink-p": [0, 1] },
          {
            duration,
            easing: `cubic-bezier(${e1}, ${e2}, ${e3}, 1)`,
            pseudoElement: "::view-transition-new(root)",
            fill: "both",
          },
        );
      })
      .catch(() => {});
  }

  vt.finished.finally(() => {
    root.classList.remove("ink-bloom", "ink-fade");
    for (const v of BLOOM_VARS) root.style.removeProperty(v);
  });
}
