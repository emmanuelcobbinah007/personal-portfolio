import { contact, site } from "@/lib/content";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-12 lg:py-28"
    >
      <h2
        id="contact-heading"
        className="font-display text-3xl text-cocoa sm:text-4xl"
      >
        Contact
      </h2>
      <hr className="section-rule mt-6 mb-12" />

      <p className="font-display max-w-xl text-2xl leading-snug text-ink sm:text-3xl">
        {contact.intro}
      </p>

      <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
        {contact.links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link text-sm tracking-[0.04em] text-ink"
            >
              {link.label}
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mx-auto max-w-6xl px-6 pb-14 pt-4 sm:px-10 lg:px-12">
      <hr className="section-rule mb-8" />
      <p className="text-sm text-ink-faint">
        © {year} {site.name}. Accra.
      </p>
    </footer>
  );
}
