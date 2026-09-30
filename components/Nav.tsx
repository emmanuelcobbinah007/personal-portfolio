import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { nav, site } from "@/lib/content";

/** Nav items that have their own page, and where that page lives. */
const sectionPages = {
  notes: { label: "Notes", href: "/notes" },
  projects: { label: "Work", href: "/projects" },
} as const;

/**
 * `section` marks the page the nav is rendered on. On /notes pages the Notes
 * item points to the notes index; on /projects the Work item points there.
 * Everything else uses the home anchors (/#work etc.), so it works anywhere.
 */
export function Nav({ section }: { section?: keyof typeof sectionPages } = {}) {
  const current = section ? sectionPages[section] : undefined;
  return (
    <header className="fade-in">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 pb-2 pt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-10 lg:px-12"
      >
        <Link
          href="/#top"
          className="text-ink transition-opacity duration-200 hover:opacity-70"
          aria-label={site.shortName}
        >
          <BrandMark />
        </Link>
        <ul className="flex w-full items-center justify-between gap-x-3 sm:w-auto sm:justify-end sm:gap-x-7">
          {nav.map((item) => {
            const isCurrent = current?.label === item.label;
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={isCurrent && current ? current.href : item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className="nav-link text-[0.75rem] tracking-[0.04em] sm:text-[0.8125rem]"
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
