import type { Metadata } from "next";
import { Footer } from "@/components/Contact";
import { Nav } from "@/components/Nav";
import { NotesList } from "@/components/NotesList";
import { Reveal } from "@/components/Reveal";
import { SkipLink } from "@/components/SkipLink";
import { getAllNotes } from "@/lib/notes";

const description =
  "Notes by Emmanuel Cobbinah on building products, shipping software, and the lessons that come with it. Written monthly from Accra.";

export const metadata: Metadata = {
  title: "Notes",
  description,
  alternates: { canonical: "/notes" },
  openGraph: {
    type: "website",
    url: "/notes",
    title: "Notes · Emmanuel Cobbinah",
    description,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Notes · Emmanuel Cobbinah",
    description,
    images: ["/og.png"],
  },
};

export default function NotesIndex() {
  const notes = getAllNotes();

  return (
    <>
      <SkipLink />
      <Nav section="notes" />
      <main id="main">
        <section
          aria-labelledby="notes-index-heading"
          className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:px-10 sm:pb-24 sm:pt-20 lg:px-12 lg:pb-28"
        >
          <div className="fade-in">
            <h1
              id="notes-index-heading"
              className="font-display text-4xl text-cocoa sm:text-5xl"
            >
              Notes
            </h1>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-ink-muted">
              Writing on building, shipping, and what breaks along the way.
              A new one every month.
            </p>
            <hr className="section-rule mt-8 mb-12" />
          </div>

          <Reveal>
            <NotesList notes={notes} showDate />
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
