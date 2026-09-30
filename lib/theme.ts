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

const BLOOM_VARS = [
  "--ink-x",
  "--ink-y",
  "--ink-seed",
  "--ink-x2",
  "--ink-y2",
  "--ink-seed2",
  "--ink-d2",
  "--ink-ease",
  "--ink-dur",
] as const;

const rand = (a: number, b: number) => a + (b - a) * Math.random();

/**
 * Switch theme. With View Transitions + CSS Paint the new theme soaks in as
 * two ink drops: one from `origin` (the toggle) and a second that lands
 * somewhere bottom-left a beat later. With View Transitions only it
 * crossfades; otherwise (or under reduced motion) it swaps instantly.
 */
export function setTheme(next: Theme, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || typeof document.startViewTransition !== "function") {
    applyTheme(next);
    return;
  }

  const painterly = workletReady;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const x = origin?.x ?? w - 40;
  const y = origin?.y ?? 40;

  // Fresh randomness every time: two shape seeds, where the second drop
  // lands, when it lands, how long the whole thing takes, and the soak curve.
  const seed = Math.floor(Math.random() * 2 ** 31);
  const seed2 = Math.floor(Math.random() * 2 ** 31);
  const x2 = w * rand(0.05, 0.3);
  const y2 = h * rand(0.7, 0.95);
  const duration = rand(1800, 2200);
  const delay = rand(120, 300);
  // Quick-then-soaking, with a softer start than a plain ease-out. The
  // worklet evaluates this curve itself (the animation runs linearly) so the
  // second drop's delay stays in real time.
  const ease = [rand(0.3, 0.38), rand(0.14, 0.24), rand(0.42, 0.52)]
    .map((n) => n.toFixed(3))
    .join(" ");

  root.style.setProperty("--ink-x", String(Math.round(x)));
  root.style.setProperty("--ink-y", String(Math.round(y)));
  root.style.setProperty("--ink-seed", String(seed));
  root.style.setProperty("--ink-x2", String(Math.round(x2)));
  root.style.setProperty("--ink-y2", String(Math.round(y2)));
  root.style.setProperty("--ink-seed2", String(seed2));
  root.style.setProperty("--ink-d2", (delay / duration).toFixed(4));
  root.style.setProperty("--ink-ease", ease);
  root.style.setProperty("--ink-dur", String(Math.round(duration)));
  root.classList.add(painterly ? "ink-bloom" : "ink-fade");

  const vt = document.startViewTransition(() => applyTheme(next));

  if (painterly) {
    vt.ready
      .then(() => {
        root.animate(
          { "--ink-p": [0, 1] },
          {
            duration,
            easing: "linear",
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
