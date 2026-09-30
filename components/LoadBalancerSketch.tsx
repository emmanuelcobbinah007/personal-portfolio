"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  loadBalancerPaths,
  loadBalancerRoutes,
  loadBalancerViewBox,
} from "@/lib/loadBalancerPaths";

/** Time for the stroke draw to land before requests start flowing (ms). */
const DRAW_MS = 1100;
/** One request's trip from the users to a server (s). */
const TRIP_S = 2.4;
/** Three specks in flight at once; consecutive ones go to server 1, 2, 3. */
const DOTS = 3;
const GAP_S = TRIP_S / DOTS;

/**
 * Load balancer concept sketch. Strokes draw on enter and undraw on leave
 * (same pattern as the other sketches), then ink dots loop from the users
 * through the LB and out to servers 1, 2, 3 in turn. Dots pause offscreen and
 * are never rendered under prefers-reduced-motion.
 */
export function LoadBalancerSketch({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // SVG document time (s) at which the first dot leaves; null = no dots.
  const [startAt, setStartAt] = useState<number | null>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-sketched");
      return;
    }

    let timer: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        window.clearTimeout(timer);
        if (entry.isIntersecting) {
          el.classList.add("is-sketched");
          timer = window.setTimeout(() => {
            const svg = svgRef.current;
            if (!svg) return;
            svg.unpauseAnimations();
            // SMIL begin times are on the document clock, so start from "now"
            setStartAt(svg.getCurrentTime() + 0.05);
          }, DRAW_MS);
        } else {
          el.classList.remove("is-sketched");
          svgRef.current?.pauseAnimations();
          setStartAt(null);
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );

    io.observe(el);
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`helmet-sketch lb-sketch ${className}`.trim()}
      data-cursor="pen"
      aria-hidden
    >
      <svg
        ref={svgRef}
        className="helmet-svg mx-auto h-auto w-full max-w-[19rem] text-cocoa sm:max-w-[22rem] lg:max-w-[24rem]"
        viewBox={loadBalancerViewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <title>Load balancer sketch</title>
        <defs>
          {loadBalancerRoutes.map((d, i) => (
            <path key={i} id={`${uid}-route-${i}`} d={d} />
          ))}
        </defs>

        {loadBalancerPaths.map((d, i) => (
          <path
            key={i}
            className="helmet-stroke"
            style={{ transitionDelay: `${i * 0.025}s` }}
            pathLength={1}
            d={d}
          />
        ))}

        {startAt !== null && (
          <g className="lb-dots" fill="currentColor" stroke="none">
            {Array.from({ length: DOTS }, (_, k) => {
              const begin = `${(startAt + k * GAP_S).toFixed(3)}s`;
              const dur = `${TRIP_S}s`;
              return (
                <circle key={k} r={3.4} opacity={0}>
                  <animateMotion
                    dur={dur}
                    begin={begin}
                    repeatCount="indefinite"
                    rotate="auto"
                  >
                    <mpath href={`#${uid}-route-${k % 3}`} />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;0.62;0.62;0"
                    keyTimes="0;0.08;0.9;1"
                    dur={dur}
                    begin={begin}
                    repeatCount="indefinite"
                  />
                </circle>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}
