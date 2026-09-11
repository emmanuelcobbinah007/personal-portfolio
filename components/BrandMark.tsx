"use client";

import { site } from "@/lib/content";

/** Temporary typeset mark — handwritten solid stroke needs a cleaner capture. */
export function BrandMark() {
  return (
    <span className="font-display text-lg tracking-tight text-ink sm:text-[1.2rem]">
      {site.shortName}
    </span>
  );
}
