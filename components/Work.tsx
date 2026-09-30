import Link from "next/link";
import { ProductsShowcase } from "@/components/ProductsShowcase";

export function Work() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-12 lg:py-28"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="work-heading"
          className="font-display text-3xl text-cocoa sm:text-4xl"
        >
          Work
        </h2>
        <p className="text-sm text-ink-faint">Selected, not exhaustive</p>
      </div>

      <hr className="section-rule mt-6 mb-12" />

      <ProductsShowcase />

      <p className="mt-16 border-t border-rule pt-7 lg:mt-20">
        <Link
          href="/projects"
          className="quiet-link text-sm tracking-[0.04em] text-ink-muted"
        >
          All projects <span aria-hidden>→</span>
        </Link>
      </p>
    </section>
  );
}
