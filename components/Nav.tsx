import { BrandMark } from "@/components/BrandMark";
import { nav, site } from "@/lib/content";

export function Nav() {
  return (
    <header className="fade-in">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 pb-2 pt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-10 lg:px-12"
      >
        <a
          href="#top"
          className="text-ink transition-opacity duration-200 hover:opacity-70"
          aria-label={site.shortName}
        >
          <BrandMark />
        </a>
        <ul className="flex w-full items-center justify-between gap-x-3 sm:w-auto sm:justify-end sm:gap-x-7">
          {nav.map((item) => (
            <li key={item.href} className="shrink-0">
              <a
                href={item.href}
                className="nav-link text-[0.75rem] tracking-[0.04em] sm:text-[0.8125rem]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
