import { notes } from "@/lib/content";
import { BlackStarBridge } from "@/components/BlackStarBridge";

export function Notes() {
  return (
    <section
      id="notes"
      aria-labelledby="notes-heading"
      className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-12 lg:py-28"
    >
      <BlackStarBridge className="-mx-6 mb-10 sm:-mx-10 sm:mb-12 lg:-mx-12 lg:mb-14" />

      <h2
        id="notes-heading"
        className="font-display text-3xl text-cocoa sm:text-4xl"
      >
        Notes
      </h2>
      <hr className="section-rule mt-6 mb-12" />

      <ul className="divide-y divide-rule">
        {notes.map((note, i) => (
          <li key={note.href}>
            <a
              href={note.href}
              target="_blank"
              rel="noopener noreferrer"
              className="note-link group block py-7"
            >
              <div className="flex items-baseline justify-between gap-6">
                <span className="flex min-w-0 gap-5 sm:gap-8">
                  <span
                    aria-hidden
                    className="pt-1 text-xs tabular-nums text-ink-faint"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="font-display block text-xl leading-snug text-ink sm:text-2xl">
                      {note.title}
                    </span>
                    <span className="mt-2 block max-w-xl text-[0.95rem] leading-relaxed text-ink-muted">
                      {note.excerpt}
                    </span>
                  </span>
                </span>
                <span
                  aria-hidden
                  className="shrink-0 text-sm text-ink-faint transition-colors duration-200 group-hover:text-lagoon"
                >
                  →
                </span>
              </div>
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
