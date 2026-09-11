import { nav, site } from "@/lib/content";

export function Nav() {
  return (
    <header className="fade-in">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-baseline justify-between gap-6 px-6 pb-2 pt-8 sm:px-10 lg:px-12"
      >
        <a
          href="#top"
          className="font-display text-lg tracking-tight text-ink transition-opacity duration-200 hover:opacity-70"
        >
          {site.shortName}
        </a>
        <ul className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 sm:gap-x-7">
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="nav-link text-[0.8125rem] tracking-[0.04em]"
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
