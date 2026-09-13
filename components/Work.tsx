import { F1Helmet } from "@/components/F1Helmet";
import { ShopStorefront } from "@/components/ShopStorefront";
import { VoteBallotBox } from "@/components/VoteBallotBox";
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

function ProjectCopy({
  name,
  status,
  blurb,
  href,
  hrefLabel,
  links,
  statusClassName = "text-xs tracking-[0.06em] text-clay uppercase",
  titleClassName = "font-display text-2xl text-ink sm:text-3xl",
  blurbClassName = "mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg",
}: {
  name: string;
  status: string;
  blurb: string;
  href: string | null;
  hrefLabel: string | null;
  links?: readonly { label: string; href: string }[];
  statusClassName?: string;
  titleClassName?: string;
  blurbClassName?: string;
}) {
  return (
    <div className="min-w-0 flex-1 lg:max-w-xl">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className={titleClassName}>{name}</h3>
        <span className={statusClassName}>{status}</span>
      </div>
      <RevealWords text={blurb} className={blurbClassName} />
      <ProjectLinks href={href} hrefLabel={hrefLabel} links={links} />
    </div>
  );
}

function itemLinks(item: (typeof work)[number]) {
  return "links" in item
    ? (item.links as readonly { label: string; href: string }[])
    : undefined;
}

export function Work() {
  const [lead, ...rest] = work;
  const pocket = rest.find((item) => item.id === "pocket-f1");
  const vote = rest.find((item) => item.id === "voteaurora");
  const grid = rest.filter(
    (item) => item.id !== "pocket-f1" && item.id !== "voteaurora",
  );

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

      <article className="work-card">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
          <ShopStorefront className="shrink-0 lg:w-[42%]" />
          <ProjectCopy
            name={lead.name}
            status={lead.status}
            blurb={lead.blurb}
            href={lead.href}
            hrefLabel={lead.hrefLabel}
            links={itemLinks(lead)}
          />
        </div>
      </article>

      {pocket && (
        <article className="work-card mt-16 lg:mt-20">
          <div className="flex flex-col-reverse gap-8 lg:flex-row lg:items-center lg:gap-12">
            <ProjectCopy
              name={pocket.name}
              status={pocket.status}
              blurb={pocket.blurb}
              href={pocket.href}
              hrefLabel={pocket.hrefLabel}
              links={itemLinks(pocket)}
              statusClassName="text-xs tracking-[0.06em] text-ink-faint uppercase"
            />
            <F1Helmet className="shrink-0 lg:w-[42%]" />
          </div>
        </article>
      )}

      {/* Pattern interrupt: text-only pair before the closing sketched row */}
      <ul className="mt-16 grid gap-10 sm:grid-cols-2 lg:mt-20 lg:gap-x-12 lg:gap-y-14">
        {grid.map((item) => (
          <li key={item.id} className="work-card">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="font-display text-xl text-ink sm:text-2xl">
                {item.name}
              </h3>
              <span className="text-xs tracking-[0.06em] text-ink-faint uppercase">
                {item.status}
              </span>
            </div>
            <RevealWords
              text={item.blurb}
              className="mt-3 text-[0.95rem] leading-relaxed text-ink-muted"
            />
            <ProjectLinks
              href={item.href}
              hrefLabel={item.hrefLabel}
              links={itemLinks(item)}
            />
          </li>
        ))}
      </ul>

      {vote && (
        <article className="work-card mt-16 lg:mt-20">
          {/* Mobile: sketch on top via col-reverse; desktop: copy left, ballot right */}
          <div className="flex flex-col-reverse gap-8 lg:flex-row lg:items-center lg:gap-12">
            <ProjectCopy
              name={vote.name}
              status={vote.status}
              blurb={vote.blurb}
              href={vote.href}
              hrefLabel={vote.hrefLabel}
              links={itemLinks(vote)}
              statusClassName="text-xs tracking-[0.06em] text-ink-faint uppercase"
            />
            <VoteBallotBox className="shrink-0 lg:w-[42%]" />
          </div>
        </article>
      )}
    </section>
  );
}
