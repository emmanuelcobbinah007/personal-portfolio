import Link from "next/link";
import { formatNoteDate, type NoteMeta } from "@/lib/notes";

/** Numbered editorial list shared by the home section and /notes. */
export function NotesList({
  notes,
  showDate = false,
}: {
  notes: readonly NoteMeta[];
  showDate?: boolean;
}) {
  return (
    <ul className="divide-y divide-rule">
      {notes.map((note, i) => {
        const inner = (
          <div className="flex items-baseline justify-between gap-6">
            <span className="flex min-w-0 gap-5 sm:gap-8">
              <span
                aria-hidden
                className="min-w-[1.25rem] pt-1 text-xs tabular-nums text-ink-faint"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                {showDate && (
                  <time
                    dateTime={note.date}
                    className="note-meta mb-2 block text-ink-faint"
                  >
                    {formatNoteDate(note.date)}
                    {note.external && (
                      <span className="text-ink-faint"> · Medium</span>
                    )}
                  </time>
                )}
                <span className="font-display block text-xl leading-snug text-ink sm:text-2xl">
                  {note.title}
                </span>
                {note.excerpt && (
                  <span className="mt-2 block max-w-xl text-[0.95rem] leading-relaxed text-ink-muted">
                    {note.excerpt}
                  </span>
                )}
              </span>
            </span>
            <span
              aria-hidden
              className="shrink-0 text-sm text-ink-faint transition-colors duration-200 group-hover:text-lagoon"
            >
              {note.external ? "↗" : "→"}
            </span>
          </div>
        );

        return (
          <li key={note.slug}>
            {note.external ? (
              <a
                href={note.href}
                target="_blank"
                rel="noopener noreferrer"
                className="note-link group block py-7"
              >
                {inner}
                <span className="sr-only"> (on Medium, opens in new tab)</span>
              </a>
            ) : (
              <Link href={note.href} className="note-link group block py-7">
                {inner}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
