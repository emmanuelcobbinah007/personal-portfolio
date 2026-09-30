import type { MetadataRoute } from "next";
import { getAllNotes, getInternalNotes } from "@/lib/notes";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrcobbinah.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const latest = getAllNotes()[0];

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/notes`,
      lastModified: latest ? new Date(latest.date) : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...getInternalNotes().map((note) => ({
      url: `${siteUrl}/notes/${note.slug}`,
      lastModified: new Date(note.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
