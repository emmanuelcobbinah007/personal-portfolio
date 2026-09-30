export type ProjectGroup = "products" | "system-design";

export const projectGroups: readonly {
  id: ProjectGroup;
  title: string;
  intro?: string;
}[] = [
  {
    id: "products",
    title: "Products",
  },
  {
    id: "system-design",
    title: "System design",
    intro:
      "A learning series. One piece of infrastructure at a time, built small enough to understand. More coming.",
  },
];

/** Single source for the home Work section and /projects. */
export const projects = [
  {
    id: "shopaurora",
    name: "ShopAurora",
    lead: true,
    status: "Live",
    blurb:
      "WhatsApp and Instagram merchants get a real store, not another link-in-bio. Catalog, checkout, Mobile Money. Built for Accra first.",
    href: "https://shopaurora.africa",
    hrefLabel: "shopaurora.africa",
    icon: null,
    group: "products",
  },
  {
    id: "pocket-f1",
    name: "Pocket-F1",
    lead: false,
    status: "Live · multiplayer",
    blurb:
      "F1 party game for up to eight phones: lights out, tire strategy, mid-race chaos that has to stay identical on every device. CloudFront + S3 for the app; Lightsail keeps the race state and sockets alive. UI still catching up; the systems lesson was the point.",
    href: "https://d2yrwsemu4iolt.cloudfront.net/",
    hrefLabel: "d2yrwsemu4iolt.cloudfront.net",
    icon: "f1-helmet",
    group: "products",
  },
  {
    id: "voteaurora",
    name: "VoteAurora",
    lead: false,
    status: "Shipped",
    blurb:
      "Campus e-voting that actually ran. Honest product: ballots cast, results counted, drama reduced. Not a pitch deck.",
    href: "https://vote-aurora.vercel.app",
    hrefLabel: "vote-aurora.vercel.app",
    icon: null,
    group: "products",
  },
  {
    id: "geniy",
    name: "Geniy",
    lead: false,
    status: "Early",
    blurb:
      "Founder research and BI agent. Accepted into the AWS startup program. Still early: learning in public, not claiming product-market fit.",
    href: "https://geniy-frontend.vercel.app",
    hrefLabel: "geniy-frontend.vercel.app",
    icon: null,
    group: "products",
  },
  {
    id: "artifact",
    name: "Artifact",
    lead: false,
    status: "In progress",
    blurb:
      "Idea → prompt → PR. The landing is still flaky. I'm shipping the loop, not the brochure.",
    href: null,
    hrefLabel: null,
    icon: null,
    group: "products",
  },
  {
    id: "load-balancer",
    name: "Load Balancer",
    lead: false,
    status: "System design · 01",
    blurb:
      "I built this to practice the system design I’ve been studying, and to feel something again. An HTTP load balancer in TypeScript on Node’s http module. Every request goes to the healthy server doing the least work right now, and ties take turns. Health checks run every five seconds, dead servers get no traffic until they recover, and when nothing’s healthy it fails politely with a 503. It won’t replace nginx. It might replace your weekend.",
    href: "https://github.com/emmanuelcobbinah007/project-load-balancer",
    hrefLabel: "github.com/emmanuelcobbinah007/project-load-balancer",
    icon: "load-balancer",
    group: "system-design",
  },
] as const;

export type Project = (typeof projects)[number];

/** Curated set for the home Work section (products only, in this order). */
export const work = projects.filter(
  (p): p is Extract<Project, { group: "products" }> => p.group === "products",
);

export const systemDesign = projects.filter(
  (p): p is Extract<Project, { group: "system-design" }> =>
    p.group === "system-design",
);
