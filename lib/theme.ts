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

type Point = { x: number; y: number };

let workletReady = false;
let workletLoading: Promise<void> | null = null;

const rand = (a: number, b: number) => a + (b - a) * Math.random();

/** One drop's image for one frame, in CSS px of the viewport. */
type Layer = { url: string; x: number; y: number; w: number; h: number } | null;
type Frame = { layers: Layer[]; soak: number };
type Bloom = {
  vars: Record<string, string>;
  duration: number;
  origin: Point;
  w: number;
  h: number;
  dpr: number;
};
type BakedBloom = Bloom & {
  frames: Frame[];
  urls: string[];
  warm: HTMLElement; // keeps the images loaded for CSS
  keyframes: Keyframe[]; // built ahead for the toggle where it was baked
};

// Frame baking: a fresh, fully random bloom is rendered in a worker while
// the page is idle, so a click only has to flip through ready-made masks.
const FPS = 60;
const PIXEL_BUDGET = 180_000; // max pixels per drop image (soft edges hide it)
const MARGIN = 64; // px the toggle may move (scroll) and still reuse a bake
const EMPTY = "linear-gradient(transparent, transparent)";

let worker: Worker | null = null;
let baked: BakedBloom | null = null;
let baking = 0; // id of the bake in flight, 0 when idle
let bakeTimer = 0;
let bakingOrigin: Point | null = null;
let getOrigin: (() => Point | null) | null = null;
let listening = false;
let scrollTimer = 0;

const inView = (o: Point) =>
  o.x >= 0 && o.y >= 0 && o.x <= window.innerWidth && o.y <= window.innerHeight;

function canBake(): boolean {
  return (
    !!(CSS as PaintWorkletCSS).paintWorklet &&
    typeof Worker === "function" &&
    typeof OffscreenCanvas === "function" &&
    typeof document.startViewTransition === "function" &&
    CSS.supports("mask-image", EMPTY) &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Fresh randomness every time: two shape seeds, where the second drop lands,
 * when it lands, how long the whole thing takes, and the soak curve.
 */
function rollBloom(origin: Point | undefined): Bloom {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const x = origin?.x ?? w - 40;
  const y = origin?.y ?? 40;
  const duration = rand(1800, 2200);
  const delay = rand(120, 300);
  // Quick-then-soaking, with a softer start than a plain ease-out. The ink
  // code evaluates this curve itself (the animation runs linearly) so the
  // second drop's delay stays in real time.
  const ease = [rand(0.3, 0.38), rand(0.14, 0.24), rand(0.42, 0.52)]
    .map((n) => n.toFixed(3))
    .join(" ");
  return {
    vars: {
      "--ink-x": String(Math.round(x)),
      "--ink-y": String(Math.round(y)),
      "--ink-seed": String(Math.floor(Math.random() * 2 ** 31)),
      "--ink-x2": String(Math.round(w * rand(0.05, 0.3))),
      "--ink-y2": String(Math.round(h * rand(0.7, 0.95))),
      "--ink-seed2": String(Math.floor(Math.random() * 2 ** 31)),
      "--ink-d2": (delay / duration).toFixed(4),
      "--ink-ease": ease,
      "--ink-dur": String(Math.round(duration)),
    },
    duration,
    origin: { x: Math.round(x), y: Math.round(y) },
    w,
    h,
    dpr: Math.min(2, window.devicePixelRatio || 1),
  };
}

function release(b: { urls: string[]; warm: HTMLElement }) {
  b.warm.remove();
  for (const u of b.urls) URL.revokeObjectURL(u);
}

function discardBake() {
  if (baked) release(baked);
  baked = null;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Wait for an idle moment (or a frame, where there is no idle callback). */
function idle(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => resolve(), { timeout: 500 });
    } else window.setTimeout(resolve, 16);
  });
}

/**
 * CSS fetches its own copy of each image, separately from the <img> preload,
 * and would only start when a frame first asks for it (a 16ms frame is long
 * gone by then). Holding them as backgrounds of an invisible 1px element
 * keeps them loaded and ready for the mask.
 */
let warmer: HTMLDivElement | null = null;
function warmGroup(): HTMLDivElement {
  if (!warmer) {
    warmer = document.createElement("div");
    warmer.setAttribute("aria-hidden", "true");
    warmer.style.cssText =
      "position:fixed;left:-2px;top:-2px;width:1px;height:1px;opacity:0.01;pointer-events:none;overflow:hidden;contain:strict";
    document.body.appendChild(warmer);
  }
  const group = document.createElement("div");
  warmer.appendChild(group);
  return group;
}

function warmCss(group: HTMLElement, urls: string[]) {
  const el = document.createElement("div");
  el.style.cssText = "position:absolute;inset:0;background-size:1px 1px;background-repeat:no-repeat";
  el.style.backgroundImage = urls.map((u) => `url("${u}")`).join(", ");
  group.appendChild(el);
}

/**
 * Turn the worker's blobs into loaded, CSS-warm image URLs, a few at a time
 * between frames (each URL and image costs a little main-thread time).
 */
async function toFrames(
  raw: { layers: ({ blob: Blob; x: number; y: number; w: number; h: number } | null)[]; soak: number }[],
  urls: string[],
  group: HTMLElement,
  stillWanted: () => boolean,
): Promise<Frame[]> {
  const frames: Frame[] = [];
  for (let i = 0; i < raw.length; i += 6) {
    await idle();
    if (!stillWanted()) throw new Error("stale");
    const chunk: string[] = [];
    for (const f of raw.slice(i, i + 6)) {
      frames.push({
        soak: f.soak,
        layers: f.layers.map((l) => {
          if (!l) return null;
          const url = URL.createObjectURL(l.blob);
          chunk.push(url);
          return { url, x: l.x, y: l.y, w: l.w, h: l.h };
        }),
      });
    }
    urls.push(...chunk);
    // Every image must be loaded before the run, or a frame would flash
    await Promise.all(chunk.map(loadImage));
    warmCss(group, chunk);
  }
  return frames;
}

/** Bake the next bloom in the background (no-op if one is ready or baking). */
function bake() {
  if (baked || baking || !canBake()) return;
  const origin = getOrigin?.() ?? undefined;
  // Toggle scrolled out of view: nothing to click, bake once it is back
  if (origin && !inView(origin)) return;
  const bloom = rollBloom(origin);
  try {
    worker ??= new Worker("/ink-bloom-frames-worker.js");
  } catch {
    return;
  }
  const id = Math.floor(Math.random() * 2 ** 31) + 1;
  baking = id;
  bakingOrigin = bloom.origin;
  const w = worker;
  const onMessage = async (ev: MessageEvent) => {
    if (ev.data?.id !== id) return;
    w.removeEventListener("message", onMessage);
    if (baking !== id) return;
    if (ev.data.error) {
      baking = 0;
      return;
    }
    type RawLayer = { blob: Blob; x: number; y: number; w: number; h: number } | null;
    const raw = ev.data.frames as { layers: RawLayer[]; soak: number }[];
    const urls: string[] = [];
    const warm = warmGroup();
    try {
      const frames = await toFrames(raw, urls, warm, () => baking === id);
      if (baking !== id) throw new Error("stale");
      baked = { ...bloom, frames, urls, warm, keyframes: bakedKeyframes(frames, { x: 0, y: 0 }) };
    } catch {
      release({ urls, warm });
    }
    if (baking === id) baking = 0;
  };
  w.addEventListener("message", onMessage);
  w.postMessage({
    id,
    params: bloom.vars,
    w: bloom.w,
    h: bloom.h,
    dpr: bloom.dpr,
    frames: Math.round((bloom.duration / 1000) * FPS) + 1,
    budget: PIXEL_BUDGET,
    margin: MARGIN,
  });
}

/** Re-bake soon, e.g. after a resize or once the page has settled. */
function scheduleBake(delay: number) {
  window.clearTimeout(bakeTimer);
  bakeTimer = window.setTimeout(() => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => bake(), { timeout: 1500 });
    } else bake();
  }, delay);
}

function bakeFits(b: BakedBloom, origin: Point | undefined): boolean {
  if (b.w !== window.innerWidth || b.h !== window.innerHeight) return false;
  if (b.dpr !== Math.min(2, window.devicePixelRatio || 1)) return false;
  if (!origin) return true;
  return Math.abs(origin.x - b.origin.x) <= MARGIN && Math.abs(origin.y - b.origin.y) <= MARGIN;
}

function listen() {
  if (listening) return;
  listening = true;
  const invalidate = () => {
    if (baking) {
      // Drop the bake in flight rather than queue behind it
      worker?.terminate();
      worker = null;
      baking = 0;
    }
    discardBake();
    scheduleBake(400);
  };
  window.addEventListener("resize", invalidate, { passive: true });
  // The toggle scrolls with the page: once scrolling settles, re-bake if it
  // has moved too far from where the current bake expects it
  window.addEventListener(
    "scroll",
    () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        const o = getOrigin?.();
        if (!o) return;
        const at = baked?.origin ?? (baking ? bakingOrigin : null);
        if (!at) scheduleBake(300);
        else if (Math.abs(o.x - at.x) > MARGIN || Math.abs(o.y - at.y) > MARGIN) invalidate();
      }, 150);
    },
    { passive: true },
  );
}

/**
 * Get the ink bloom ready (Chrome/Edge): load the paint worklet (the live
 * fallback) and bake the first bloom in the background. `origin` reports
 * where the toggle is. Safe to call often.
 */
export function preloadInkBloom(origin?: () => Point | null): void {
  if (origin) getOrigin = origin;
  const css = CSS as PaintWorkletCSS;
  if (!css.paintWorklet) return;
  listen();
  scheduleBake(600);
  if (workletLoading) return;
  workletLoading = css.paintWorklet
    .addModule("/ink-bloom-worklet.js")
    .then(() => {
      workletReady = true;
    })
    .catch(() => {
      /* fall back to the crossfade */
    });
}

/**
 * The run as mask keyframes: per frame, one cropped image per drop placed
 * where it belongs, plus the final soak. Stepped, so each frame's image and
 * position switch together.
 */
function bakedKeyframes(frames: Frame[], shift: Point): Keyframe[] {
  const { x: dx, y: dy } = shift;
  const n = frames.length;
  return frames.map((f, i) => {
    const img: string[] = [];
    const pos: string[] = [];
    const size: string[] = [];
    f.layers.forEach((l, j) => {
      if (!l) {
        img.push(EMPTY);
        pos.push("0px 0px");
        size.push("1px 1px");
        return;
      }
      // The first drop follows the toggle if it moved a little since the bake
      const ox = j === 0 ? dx : 0;
      const oy = j === 0 ? dy : 0;
      img.push(`url("${l.url}")`);
      pos.push(`${l.x + ox}px ${l.y + oy}px`);
      size.push(`${l.w}px ${l.h}px`);
    });
    if (f.soak > 0) {
      const c = `rgba(0,0,0,${f.soak.toFixed(3)})`;
      img.push(`linear-gradient(${c}, ${c})`);
      size.push("100% 100%");
    } else {
      img.push(EMPTY);
      size.push("1px 1px");
    }
    pos.push("0px 0px");
    return {
      offset: i / (n - 1),
      easing: "steps(1, end)",
      maskImage: img.join(", "),
      maskPosition: pos.join(", "),
      maskSize: size.join(", "),
    };
  });
}

/**
 * Switch theme. With View Transitions the new theme soaks in as two ink
 * drops: one from `origin` (the toggle) and a second that lands somewhere
 * bottom-left a beat later. Normally the frames were baked in advance and
 * the transition just flips through them; if no bake is ready it draws live
 * with the paint worklet. Without CSS Paint it crossfades; without View
 * Transitions (or under reduced motion) it swaps instantly.
 */
export function setTheme(next: Theme, origin?: Point) {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || typeof document.startViewTransition !== "function") {
    applyTheme(next);
    return;
  }

  const ready = baked && bakeFits(baked, origin) ? baked : null;
  if (ready) baked = null;
  else discardBake(); // whatever was baked (if anything) no longer fits
  const mode = ready ? "ink-frames" : workletReady ? "ink-bloom" : "ink-fade";
  const bloom = ready ?? rollBloom(origin);

  if (mode === "ink-bloom") {
    // Inputs for the live worklet (custom properties inherit, so setting them
    // restyles the whole page; the baked path skips that)
    for (const [k, v] of Object.entries(bloom.vars)) root.style.setProperty(k, v);
  }
  root.classList.add(mode);

  const vt = document.startViewTransition(() => applyTheme(next));

  vt.ready
    .then(() => {
      const timing: KeyframeAnimationOptions = {
        duration: bloom.duration,
        easing: "linear",
        pseudoElement: "::view-transition-new(root)",
        fill: "both",
      };
      if (ready) {
        const dx = origin ? Math.round(origin.x) - ready.origin.x : 0;
        const dy = origin ? Math.round(origin.y) - ready.origin.y : 0;
        const frames = dx || dy ? bakedKeyframes(ready.frames, { x: dx, y: dy }) : ready.keyframes;
        root.animate(frames, timing);
      }
      else if (mode === "ink-bloom") root.animate({ "--ink-p": [0, 1] }, timing);
    })
    .catch(() => {});

  vt.finished.finally(() => {
    root.classList.remove("ink-bloom", "ink-fade", "ink-frames");
    if (mode === "ink-bloom") for (const v of Object.keys(bloom.vars)) root.style.removeProperty(v);
    if (ready) release(ready);
    // A new random bloom for next time
    scheduleBake(300);
  });
}
