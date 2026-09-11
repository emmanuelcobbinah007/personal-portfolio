import { about } from "@/lib/content";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-12 lg:py-28"
    >
      <h2
        id="about-heading"
        className="font-display text-3xl text-cocoa sm:text-4xl"
      >
        About
      </h2>
      <hr className="section-rule mt-6 mb-12" />

      <article className="letter mx-auto max-w-2xl">
        <p className="font-display text-2xl text-ink sm:text-[1.75rem]">
          {about.salutation}
        </p>
        <div className="mt-8 space-y-6 text-base leading-relaxed text-ink-muted sm:text-lg">
          {about.paragraphs.map((p) => (
            <p key={p.slice(0, 28)}>{p}</p>
          ))}
        </div>
        <p className="font-display mt-10 text-xl text-cocoa">{about.signoff}</p>
      </article>
    </section>
  );
}
