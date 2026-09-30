"use client";

import { signaturePaths, signatureViewBox } from "@/lib/signaturePaths";
import { useEffect, useState } from "react";

/** sessionStorage key; also read by the pre-paint script in app/layout.tsx. */
export const LOADER_SEEN_KEY = "mrcob-loader-seen";

function markSeen() {
  try {
    sessionStorage.setItem(LOADER_SEEN_KEY, "1");
  } catch {
    /* storage unavailable: loader simply plays again next load */
  }
}

function hasSeen() {
  try {
    return sessionStorage.getItem(LOADER_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Parchment intro: signature draws once per browser session, then fades out.
 * Repeat visits are hidden before paint by the `loader-seen` class that the
 * inline script in app/layout.tsx sets on <html> (see globals.css), so the
 * server markup stays identical and hydration is unaffected.
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

    // Already played this session: CSS keeps it hidden; nothing to animate.
    if (hasSeen()) return;

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
      // Mark only once it has fully played, so an interrupted intro replays.
      markSeen();
      document.documentElement.classList.add("loader-seen");
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
