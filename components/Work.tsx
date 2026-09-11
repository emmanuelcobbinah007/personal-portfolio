import { F1Helmet } from "@/components/F1Helmet";
import { GeniyMascot } from "@/components/GeniyMascot";
import { RevealWords } from "@/components/RevealWords";
import { work } from "@/lib/content";

function ProjectLinks({
  href,
  hrefLabel,
  links,
}: {
  href: string | null;
  hrefLabel: string | null;
  links?: readonly { label: string; href: string }[];
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
      {href && hrefLabel && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-ink underline decoration-rule underline-offset-4 transition-colors duration-200 hover:text-lagoon hover:decoration-lagoon"
        >
          {hrefLabel}
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      )}
      {links?.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-ink-muted underline decoration-rule underline-offset-4 transition-colors duration-200 hover:text-lagoon"
        >
          {l.label}
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      ))}
    </div>
  );
}

export function Work() {
  const [lead, ...rest] = work;

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-12 lg:py-28"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="work-heading"
          className="font-display text-3xl text-cocoa sm:text-4xl"
        >
          Work
        </h2>
        <p className="text-sm text-ink-faint">Selected, not exhaustive</p>
      </div>

      <hr className="section-rule mt-6 mb-12" />

      <article className="work-card max-w-3xl">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-display text-2xl text-ink sm:text-3xl">
            {lead.name}
          </h3>
          <span className="text-xs tracking-[0.06em] text-clay uppercase">
            {lead.status}
          </span>
        </div>
        <RevealWords
          text={lead.blurb}
          className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg"
        />
        <ProjectLinks
          href={lead.href}
          hrefLabel={lead.hrefLabel}
          links={"links" in lead ? (lead.links as readonly { label: string; href: string }[]) : undefined}
        />
      </article>

      <ul className="mt-16 grid gap-10 sm:grid-cols-2 sm:items-center lg:mt-20 lg:gap-x-12 lg:gap-y-14">
        {rest.map((item) => (
          <li key={item.id} className="work-card">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="font-display text-xl text-ink sm:text-2xl">
                {item.name}
              </h3>
              <span className="text-xs tracking-[0.06em] text-ink-faint uppercase">
                {item.status}
              </span>
            </div>
            {"icon" in item && item.icon === "f1-helmet" && (
              <F1Helmet className="my-8 sm:my-10" />
            )}
            {"icon" in item && item.icon === "geniy-mascot" && (
              <GeniyMascot className="my-8 sm:my-10" />
            )}
            <RevealWords
              text={item.blurb}
              className="mt-3 text-[0.95rem] leading-relaxed text-ink-muted"
            />
            <ProjectLinks
              href={item.href}
              hrefLabel={item.hrefLabel}
              links={
                "links" in item
                  ? (item.links as readonly { label: string; href: string }[])
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
