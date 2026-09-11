"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
} from "react";

/** Scroll-tied word fade: dimmed text lights up word by word as you scroll. */
export function RevealWords({
  text,
  className = "",
  as: Tag = "p",
}: {
  text: string;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [reduce, setReduce] = useState(false);

  const tokens = useMemo(() => text.split(/(\s+)/), [text]);
  const wordCount = useMemo(
    () => tokens.filter((t) => t.trim().length > 0).length,
    [tokens],
  );

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    // Light up while the block travels through the middle band of the viewport
    const start = vh * 0.92;
    const end = vh * 0.28;
    const raw = (start - rect.top) / (start - end + Math.max(rect.height, 1) * 0.35);
    setProgress(Math.min(1, Math.max(0, raw)));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReduce = () => {
      const on = mq.matches;
      setReduce(on);
      if (on) setProgress(1);
    };
    syncReduce();
    mq.addEventListener("change", syncReduce);

    if (mq.matches) {
      return () => mq.removeEventListener("change", syncReduce);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", syncReduce);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  let wordIndex = 0;

  return (
    <Tag
      ref={ref as never}
      className={`reveal-words ${className}`.trim()}
    >
      {tokens.map((token, i) => {
        if (!token.trim()) {
          return <span key={i}>{token}</span>;
        }
        const idx = wordIndex++;
        const lit = reduce
          ? 1
          : Math.min(
              1,
              Math.max(0, progress * wordCount - idx),
            );
        const opacity = 0.16 + lit * 0.84;
        return (
          <span
            key={i}
            className="reveal-word"
            style={{ opacity }}
          >
            {token}
          </span>
        );
      })}
    </Tag>
  );
}
