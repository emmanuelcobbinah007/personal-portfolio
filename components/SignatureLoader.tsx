"use client";

import { signaturePaths, signatureViewBox } from "@/lib/signaturePaths";
import { useEffect, useState } from "react";

/**
 * Parchment intro: signature draws once per page load, then fades out.
 * Skips animation when prefers-reduced-motion.
 */
export function SignatureLoader() {
  const [phase, setPhase] = useState<"drawing" | "leaving" | "done">("drawing");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("done");
      return;
    }

    document.documentElement.classList.add("loader-lock");

    // Let paint land, then trigger stroke draw
    const drawId = requestAnimationFrame(() => {
      document.documentElement.classList.add("loader-drawn");
    });

    // ~ path delays (0.05s * n) + stroke duration 0.85s + breath
    const pathCount = signaturePaths.length;
    const drawMs = 850 + pathCount * 50 + 400;
    const fadeMs = 550;

    const leaveTimer = window.setTimeout(() => setPhase("leaving"), drawMs);
    const doneTimer = window.setTimeout(() => {
      setPhase("done");
      document.documentElement.classList.remove("loader-lock", "loader-drawn");
    }, drawMs + fadeMs);

    return () => {
      cancelAnimationFrame(drawId);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
      document.documentElement.classList.remove("loader-lock", "loader-drawn");
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`signature-loader${phase === "leaving" ? " is-leaving" : ""}`}
      aria-hidden
    >
      <div className="signature-loader-inner">
        <svg
          className="signature-svg signature-loader-svg text-cocoa"
          viewBox={signatureViewBox}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <title>Emmanuel Cobbinah</title>
          {signaturePaths.map((d, i) => (
            <path
              key={i}
              className="signature-stroke signature-loader-stroke"
              style={{ transitionDelay: `${i * 0.05}s` }}
              pathLength={1}
              d={d}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
