import { F1Helmet } from "@/components/F1Helmet";
import { itemLinks, ProjectCopy, ProjectLinks } from "@/components/ProjectParts";
import { RevealWords } from "@/components/RevealWords";
import { ShopStorefront } from "@/components/ShopStorefront";
import { VoteBallotBox } from "@/components/VoteBallotBox";
import { work } from "@/lib/projects";

/**
 * The products layout: ShopAurora lead, Pocket-F1, the text-only pair, then
 * VoteAurora. Shared by the home Work section and /projects.
 */
export function ProductsShowcase() {
  const [lead, ...rest] = work;
  const pocket = rest.find((item) => item.id === "pocket-f1");
  const vote = rest.find((item) => item.id === "voteaurora");
  const grid = rest.filter(
    (item) => item.id !== "pocket-f1" && item.id !== "voteaurora",
  );

  return (
    <>
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
          {/* Mobile: sketch on top; desktop: ballot left, copy right (like ShopAurora) */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
            <VoteBallotBox className="shrink-0 lg:w-[42%]" />
            <ProjectCopy
              name={vote.name}
              status={vote.status}
              blurb={vote.blurb}
              href={vote.href}
              hrefLabel={vote.hrefLabel}
              links={itemLinks(vote)}
              statusClassName="text-xs tracking-[0.06em] text-ink-faint uppercase"
            />
          </div>
        </article>
      )}
    </>
  );
}
