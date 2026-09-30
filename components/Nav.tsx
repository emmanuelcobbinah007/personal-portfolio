import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { nav, site } from "@/lib/content";

/**
 * `section` marks the page the nav is rendered on. On /notes pages the Notes
 * item points to the index instead of the home anchor.
 */
export function Nav({ section }: { section?: "notes" } = {}) {
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
            const isCurrent = section === "notes" && item.label === "Notes";
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={isCurrent ? "/notes" : item.href}
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
