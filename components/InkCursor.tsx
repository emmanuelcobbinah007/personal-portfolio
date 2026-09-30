"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * Ink companion cursor — a small cocoa dot that trails the native pointer,
 * swells into a soft ring over interactive elements and becomes a pen nib
 * over the ink sketches (`data-cursor="pen"`).
 *
 * The system cursor is never hidden; this is purely decorative.
 * Only mounts for fine, hover-capable pointers without reduced motion.
 */

const ENABLE_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

const LINK_SELECTOR = [
  "a[href]",
  "button:not(:disabled)",
  '[role="button"]',
  "summary",
  "label[for]",
  "select",
  'input[type="submit"]',
  'input[type="button"]',
  '[data-cursor="link"]',
].join(",");

// Whichever match is nearest to the pointer target wins.
const ANY_SELECTOR = `${LINK_SELECTOR},[data-cursor]`;

type CursorState = "default" | "link" | "pen";

function subscribe(onChange: () => void) {
  const fine = window.matchMedia(ENABLE_QUERY);
  const reduce = window.matchMedia(REDUCE_QUERY);
  fine.addEventListener("change", onChange);
  reduce.addEventListener("change", onChange);
  return () => {
    fine.removeEventListener("change", onChange);
    reduce.removeEventListener("change", onChange);
  };
}

function getSnapshot() {
  return (
    window.matchMedia(ENABLE_QUERY).matches &&
    !window.matchMedia(REDUCE_QUERY).matches
  );
}

function getServerSnapshot() {
  return false;
}

function stateFor(target: EventTarget | null): CursorState {
  if (!(target instanceof Element)) return "default";
  const hit = target.closest(ANY_SELECTOR);
  if (!hit) return "default";
  const kind = hit.getAttribute("data-cursor");
  if (kind === "pen") return "pen";
  if (kind === "none" || kind === "default") return "default";
  return "link";
}

export function InkCursor() {
  const enabled = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  if (!enabled) return null;
  return <InkCursorLayer />;
}

function InkCursorLayer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let raf = 0;
    let last = 0;
    let seen = false;
    let state: CursorState = "default";

    const setState = (next: CursorState) => {
      if (next === state) return;
      state = next;
      el.dataset.state = next;
    };

    const setVisible = (visible: boolean) => {
      el.dataset.visible = visible ? "true" : "false";
    };

    const paint = () => {
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    };

    const tick = (now: number) => {
      // Frame-rate independent lerp (~0.24 per 60fps frame).
      const dt = last ? Math.min(now - last, 64) : 16.67;
      last = now;
      const k = 1 - Math.pow(1 - 0.24, dt / 16.67);
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;

      if (
        Math.abs(target.x - pos.x) < 0.1 &&
        Math.abs(target.y - pos.y) < 0.1
      ) {
        pos.x = target.x;
        pos.y = target.y;
        paint();
        raf = 0;
        last = 0;
        return;
      }
      paint();
      raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") {
        setVisible(false);
        return;
      }
      target.x = e.clientX;
      target.y = e.clientY;
      if (!seen) {
        // First sighting: snap into place instead of sweeping in from 0,0.
        seen = true;
        pos.x = target.x;
        pos.y = target.y;
        paint();
        setState(stateFor(e.target));
      }
      setVisible(true);
      kick();
    };

    const onOver = (e: PointerEvent) => {
      setState(stateFor(e.target));
    };

    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) setVisible(false);
    };

    const onLeave = () => setVisible(false);

    const onDown = () => {
      el.dataset.pressed = "true";
    };
    const onUp = () => {
      delete el.dataset.pressed;
    };

    // Content scrolls under a still pointer — re-resolve what we're over.
    let scrollRaf = 0;
    const onScroll = () => {
      if (!seen || scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        setState(stateFor(document.elementFromPoint(target.x, target.y)));
      });
    };

    const root = document.documentElement;
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    root.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      root.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="ink-cursor"
      data-state="default"
      data-visible="false"
      aria-hidden
    >
      <span className="ink-cursor-ring" />
      <span className="ink-cursor-dot" />
      <svg
        className="ink-cursor-nib"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        focusable="false"
      >
        {/* Nib pointing down; tip sits at (12, 23) = pointer hotspot. */}
        <path
          d="M12 23 L6.6 12.2 C6.1 11 6.3 9.6 7.2 8.6 L9.4 6 L14.6 6 L16.8 8.6 C17.7 9.6 17.9 11 17.4 12.2 Z"
          fill="currentColor"
        />
        <rect x="9" y="2.4" width="6" height="3" rx="0.8" fill="currentColor" />
        <path
          d="M12 22 L12 12.6"
          stroke="var(--parchment)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <circle cx="12" cy="11.2" r="1.25" fill="var(--parchment)" />
      </svg>
    </div>
  );
}
