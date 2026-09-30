import type { Metadata } from "next";
import { Footer } from "@/components/Contact";
import { LoadBalancerSketch } from "@/components/LoadBalancerSketch";
import { Nav } from "@/components/Nav";
import { ProductsShowcase } from "@/components/ProductsShowcase";
import { itemLinks, ProjectCopy } from "@/components/ProjectParts";
import { Reveal } from "@/components/Reveal";
import { SkipLink } from "@/components/SkipLink";
import { projectGroups, systemDesign } from "@/lib/projects";

const description =
  "Projects by Emmanuel Cobbinah: products like ShopAurora, Pocket-F1 and VoteAurora, plus a system design learning series starting with a load balancer.";

export const metadata: Metadata = {
  title: "Projects",
  description,
  alternates: { canonical: "/projects" },
  openGraph: {
    type: "website",
    url: "/projects",
    title: "Projects · Emmanuel Cobbinah",
    description,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects · Emmanuel Cobbinah",
    description,
    images: ["/og.png"],
  },
};

const sketches = {
  "load-balancer": LoadBalancerSketch,
} as const;

function GroupHeading({ id }: { id: (typeof projectGroups)[number]["id"] }) {
  const group = projectGroups.find((g) => g.id === id);
  if (!group) return null;
  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <h2
          id={`${id}-heading`}
          className="font-display text-3xl text-cocoa sm:text-4xl"
        >
          {group.title}
        </h2>
        {group.intro && (
          <p className="max-w-md text-sm leading-relaxed text-ink-faint sm:text-right">
            {group.intro}
          </p>
        )}
      </div>
      <hr className="section-rule mt-6 mb-12" />
    </>
  );
}

export default function ProjectsPage() {
  return (
    <>
      <SkipLink />
      <Nav section="projects" />
      <main id="main">
        <header className="fade-in mx-auto max-w-6xl px-6 pt-16 sm:px-10 sm:pt-20 lg:px-12">
          <h1 className="font-display text-4xl text-cocoa sm:text-5xl">
            Projects
          </h1>
          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-ink-muted">
            Products I&rsquo;ve shipped, and the systems I&rsquo;m building to
            learn.
          </p>
        </header>

        <Reveal>
          <section
            aria-labelledby="products-heading"
            className="mx-auto max-w-6xl px-6 pt-16 pb-8 sm:px-10 lg:px-12 lg:pt-20"
          >
            <GroupHeading id="products" />
            <ProductsShowcase />
          </section>
        </Reveal>

        <Reveal>
          <section
            id="system-design"
            aria-labelledby="system-design-heading"
            className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:px-10 lg:px-12 lg:pt-24 lg:pb-28"
          >
            <GroupHeading id="system-design" />
            {systemDesign.map((item, i) => {
              const Sketch = sketches[item.icon];
              return (
                <article
                  key={item.id}
                  className={`work-card${i > 0 ? " mt-16 lg:mt-20" : ""}`}
                >
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
                    <Sketch className="shrink-0 lg:w-[42%]" />
                    <ProjectCopy
                      name={item.name}
                      status={item.status}
                      blurb={item.blurb}
                      href={item.href}
                      hrefLabel={item.hrefLabel}
                      links={itemLinks(item)}
                      statusClassName="text-xs tracking-[0.06em] text-ink-faint uppercase"
                    />
                  </div>
                </article>
              );
            })}
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
