import Image from "next/image";
import { site } from "@/lib/content";

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

      <p className="fade-in fade-in-delay-3 mt-8 inline-flex items-center gap-2.5 text-sm text-ink-muted">
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full bg-lagoon"
        />
        <span>{site.status}</span>
      </p>
    </section>
  );
}
