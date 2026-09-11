import Image from "next/image";
import { site } from "@/lib/content";

/** Loose ink doodle - continuous stroke, imperfect points. */
function StatusStar({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden
      fill="none"
    >
      <path
        d="M 7.85 1.55 C 8.05 2.8 8.55 4.9 9.15 5.85 C 10.4 5.9 12.6 6.0 14.05 6.15 C 12.7 7.15 11.2 8.35 10.35 9.05 C 10.75 10.7 11.35 12.9 11.55 13.95 C 10.2 12.95 8.85 11.7 7.85 11.25 C 6.7 12.2 5.1 13.4 4.05 13.95 C 4.45 12.7 5.15 10.55 5.45 9.05 C 4.2 8.2 2.4 7.0 1.55 6.05 C 3.2 5.85 5.5 5.75 6.55 5.7 C 6.95 4.35 7.45 2.5 7.85 1.55"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-16 text-center sm:px-10 sm:pt-24 lg:pb-32 lg:pt-28"
    >
      <div className="fade-in hero-avatar relative h-28 w-28 overflow-hidden rounded-full sm:h-32 sm:w-32">
        <Image
          src="/emmanuel-hero.jpg"
          alt="Emmanuel Cobbinah in a thinking cap and headphones, smiling"
          fill
          priority
          sizes="128px"
          className="select-none object-cover object-center"
        />
      </div>

      <p className="fade-in fade-in-delay-1 mt-8 text-[0.8125rem] tracking-[0.08em] text-ink-muted uppercase">
        {site.location}
      </p>

      <h1
        id="hero-heading"
        className="fade-in fade-in-delay-1 font-display mt-4 text-[clamp(2.6rem,9vw,4.75rem)] leading-[0.95] text-cocoa"
      >
        {site.name}
      </h1>

      <p className="fade-in fade-in-delay-2 font-display mt-7 max-w-xl text-[clamp(1.25rem,3vw,1.85rem)] leading-snug text-ink">
        {site.heroLine}
      </p>

      <div
        aria-hidden
        className="fade-in fade-in-delay-2 mt-6 h-px w-14 bg-ochre/70"
      />

      <p className="fade-in fade-in-delay-3 mt-8 inline-flex items-center gap-2 text-sm text-ink-muted">
        <StatusStar className="text-cocoa/75" />
        <span>{site.status}</span>
      </p>
    </section>
  );
}
