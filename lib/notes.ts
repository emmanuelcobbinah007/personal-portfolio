import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

export type NoteMeta = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO 8601 date string */
  date: string;
  /** Original URL when the note was first published elsewhere (e.g. Medium) */
  canonical?: string;
  /** Link-out only entries have no body and point to `href` */
  external: boolean;
  href: string;
  cover?: string;
};

export type Note = NoteMeta & {
  body: string;
  readingMinutes: number;
};

type Frontmatter = {
  title?: string;
  excerpt?: string;
  date?: string | Date;
  canonical?: string;
  medium?: string;
  external?: boolean;
  href?: string;
  cover?: string;
};

function toIso(value: string | Date | undefined, file: string): string {
  if (!value) throw new Error(`Note "${file}" is missing a date`);
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Note "${file}" has an invalid date: ${String(value)}`);
  }
  return d.toISOString();
}

function readingMinutes(body: string): number {
  const words = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function parse(file: string): Note {
  const slug = file.replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(NOTES_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const fm = data as Frontmatter;

  if (!fm.title) throw new Error(`Note "${file}" is missing a title`);

  const external = fm.external === true;
  if (external && !fm.href) {
    throw new Error(`External note "${file}" needs an href`);
  }

  const canonical = fm.canonical ?? fm.medium;

  return {
    slug,
    title: fm.title,
    excerpt: fm.excerpt ?? "",
    date: toIso(fm.date, file),
    canonical,
    external,
    href: external ? (fm.href as string) : `/notes/${slug}`,
    cover: fm.cover,
    body: content,
    readingMinutes: readingMinutes(content),
  };
}

let cache: Note[] | null = null;

function loadAll(): Note[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const files = fs
    .readdirSync(NOTES_DIR)
    .filter((f) => /\.mdx?$/.test(f) && !f.startsWith("_"));
  const notes = files
    .map(parse)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  cache = notes;
  return notes;
}

function stripBody({ body: _body, readingMinutes: _rm, ...meta }: Note): NoteMeta {
  void _body;
  void _rm;
  return meta;
}

/** Every note, newest first (metadata only). */
export function getAllNotes(): NoteMeta[] {
  return loadAll().map(stripBody);
}

/** Only notes that have a page on this site. */
export function getInternalNotes(): Note[] {
  return loadAll().filter((n) => !n.external);
}

export function getNote(slug: string): Note | undefined {
  return loadAll().find((n) => n.slug === slug && !n.external);
}

export function formatNoteDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
