import Link from "next/link";
import { NotesList } from "@/components/NotesList";
import { getAllNotes } from "@/lib/notes";

const HOME_COUNT = 3;

export function Notes() {
  const notes = getAllNotes();
  const latest = notes.slice(0, HOME_COUNT);

  return (
    <section
      id="notes"
      aria-labelledby="notes-heading"
      className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-10 sm:pb-24 sm:pt-12 lg:px-12 lg:pb-28 lg:pt-14"
    >
      <h2
        id="notes-heading"
        className="font-display text-3xl text-cocoa sm:text-4xl"
      >
        Notes
      </h2>
      <hr className="section-rule mt-6 mb-12" />

      <NotesList notes={latest} />

      <p className="mt-8 border-t border-rule pt-7">
        <Link
          href="/notes"
          className="quiet-link text-sm tracking-[0.04em] text-ink-muted"
        >
          All notes <span aria-hidden>→</span>
        </Link>
      </p>
    </section>
  );
}
