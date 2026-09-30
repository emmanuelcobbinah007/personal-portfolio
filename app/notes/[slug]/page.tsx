import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Contact";
import { Nav } from "@/components/Nav";
import { NoteProse } from "@/components/NoteProse";
import { SkipLink } from "@/components/SkipLink";
import { site } from "@/lib/content";
import { formatNoteDate, getInternalNotes, getNote } from "@/lib/notes";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrcobbinah.vercel.app";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getInternalNotes().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return {};

  const path = `/notes/${note.slug}`;
  const canonical = note.canonical ?? `${siteUrl}${path}`;
  const image = note.cover ?? "/og.png";

  return {
    title: note.title,
    description: note.excerpt,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: note.title,
      description: note.excerpt,
      publishedTime: note.date,
      authors: [site.name],
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: note.title,
      description: note.excerpt,
      images: [image],
    },
  };
}

function isMedium(url?: string) {
  return !!url && /(^|\.)medium\.com\//.test(url.replace(/^https?:\/\//, ""));
}

export default async function NotePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  const url = `${siteUrl}/notes/${note.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: note.title,
    description: note.excerpt,
    datePublished: note.date,
    url,
    mainEntityOfPage: note.canonical ?? url,
    ...(note.originalUrl ? { sameAs: note.originalUrl } : {}),
    ...(note.cover ? { image: `${siteUrl}${note.cover}` } : {}),
    author: { "@type": "Person", name: site.name, url: siteUrl },
  };

  return (
    <>
      <SkipLink />
      <Nav section="notes" />
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="mx-auto max-w-6xl px-6 pb-20 pt-14 sm:px-10 sm:pb-24 sm:pt-20 lg:px-12 lg:pb-28">
          <div className="note-column mx-auto">
            <header className="fade-in">
              <Link
                href="/notes"
                className="quiet-link text-sm tracking-[0.04em] text-ink-muted"
              >
                <span aria-hidden>←</span> Back to notes
              </Link>

              <p className="note-meta mt-10 text-ink-faint">
                <time dateTime={note.date}>{formatNoteDate(note.date)}</time>
                <span aria-hidden> · </span>
                <span>{note.readingMinutes} min read</span>
              </p>
              <h1 className="font-display mt-3 text-4xl leading-[1.08] text-cocoa sm:text-5xl">
                {note.title}
              </h1>
              <hr className="section-rule mt-8 mb-10" />
            </header>

            <div className="fade-in fade-in-delay-2">
              <NoteProse source={note.body} />
            </div>

            <footer className="mt-14">
              {note.originalUrl && (
                <aside className="note-origin text-[0.9rem] leading-relaxed text-ink-muted">
                  {isMedium(note.originalUrl)
                    ? "Originally published on Medium. "
                    : "Originally published elsewhere. "}
                  <a
                    href={note.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-lagoon"
                  >
                    Read the original
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                  <span aria-hidden> ↗</span>
                </aside>
              )}
              <hr className="section-rule mt-10 mb-8" />
              <Link
                href="/notes"
                className="quiet-link text-sm tracking-[0.04em] text-ink-muted"
              >
                <span aria-hidden>←</span> Back to notes
              </Link>
            </footer>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
