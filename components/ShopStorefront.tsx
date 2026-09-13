"use client";

import { shopPaths, shopViewBox } from "@/lib/shopPaths";
import { useStrokeReveal } from "@/hooks/useStrokeReveal";

/** ShopAurora storefront as vector strokes — draws on enter, undraws on leave. */
export function ShopStorefront({ className = "" }: { className?: string }) {
  const ref = useStrokeReveal("is-sketched", 0.18);

  return (
    <div
      ref={ref}
      className={`helmet-sketch ${className}`.trim()}
      aria-hidden
    >
      <svg
        className="helmet-svg mx-auto h-auto w-full max-w-[16rem] text-cocoa sm:max-w-[18rem] lg:max-w-[20rem]"
        viewBox={shopViewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <title>ShopAurora storefront sketch</title>
        {shopPaths.map((d, i) => (
          <path
            key={i}
            className="helmet-stroke"
            style={{ transitionDelay: `${i * 0.015}s` }}
            pathLength={1}
            d={d}
          />
        ))}
      </svg>
    </div>
  );
}
