import { RevealWords } from "@/components/RevealWords";
import type { Project } from "@/lib/projects";

export function ProjectLinks({
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

export function ProjectCopy({
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

export function itemLinks(item: Project) {
  return "links" in item
    ? (item.links as readonly { label: string; href: string }[])
    : undefined;
}

