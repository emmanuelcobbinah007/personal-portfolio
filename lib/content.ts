export const site = {
  name: "Emmanuel Cobbinah",
  shortName: "MrCob.binah",
  location: "Accra, Ghana",
  heroLine: "I build because it gives me hope.",
  status: "Software Engineer · AWS Cloud Practitioner",
  title: "Emmanuel Cobbinah · Full-stack & Cloud",
  description:
    "Full-stack developer and aspiring cloud engineer in Accra. AWS Certified Cloud Practitioner. Founder of Aurora Software Labs. Building ShopAurora.",
};

export const nav = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Resume", href: "#resume" },
  { label: "Notes", href: "#notes" },
  { label: "Contact", href: "#contact" },
] as const;

export const work = [
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
  },
] as const;

export const about = {
  salutation: "Hey,",
  signoff: "Emmanuel",
  paragraphs: [
    "I write software from Accra. Most days that means ShopAurora: helping merchants who already live on WhatsApp get a real store, with Mobile Money, without the lecture.",
    "I'm an AWS Certified Cloud Practitioner (CLF-C02), and I'm moving toward cloud and DevOps on purpose. Pocket-F1 started as a break from SaaS, then became the lab: Terraform, CloudFront, S3, and a Lightsail multiplayer race where every phone has to roll the same dice.",
    "I used to say yes to everything. Products died. I deleted a client's database once (Neon saved me). The Medium essays are the diary. The resume is the tidy version. I build because it still gives me hope.",
  ],
};

export const notes = [
  {
    title: "Nothing hurts more than watching your dreams die",
    excerpt:
      "In the past six months, I've built multiple products. Some survived. Most didn't.",
    href: "https://medium.com/@ecobbinahbuz/nothing-hurts-more-than-watching-your-dreams-die-c256256268ee",
  },
  {
    title: "I've spent 5 weeks building a SaaS and made -$1.81 MRR",
    excerpt: "Wait, let me explain.",
    href: "https://medium.com/@ecobbinahbuz/ive-spent-5-weeks-building-a-saas-and-made-1-81-mrr-3a323ecc6918",
  },
  {
    title: "So I deleted my client's database. What now?",
    excerpt: "Yep, you read that right.",
    href: "https://medium.com/@ecobbinahbuz/so-i-deleted-my-clients-database-what-now-a9de921fed2b",
  },
] as const;


export const resume = {
  pdf: "/emmanuel-cobbinah-resume.pdf",
  pdfLabel: "Download PDF",
  intro: "The paper version, if you like things in order.",
  sections: [
    {
      id: "experience",
      title: "Experience",
      defaultOpen: true,
      items: [
        {
          heading: "Aurora Software Labs",
          meta: "Lead Software Engineer · Accra · Apr 2025 – Present",
          points: [
            "Led a cross-functional engineering team of 8: secure coding, agile delivery, CI/CD, production stability.",
            "Architected a production e-voting platform under tight timelines: integrity, access control, fault tolerance first.",
            "Automated the delivery loop so concurrent projects shipped with less manual toil.",
          ],
        },
        {
          heading: "Turntabl",
          meta: "Software Engineering Intern · Accra · Jul 2025 – Sep 2025",
          points: [
            "Built and optimised Whisperbox’s frontend in React and TypeScript, wired to REST, shipped to production.",
            "Led a sub-team of 3 interns through features and code reviews in a fast agile shop.",
          ],
        },
      ],
    },
    {
      id: "projects",
      title: "Projects",
      defaultOpen: false,
      items: [
        {
          heading: "ShopAurora",
          meta: "Africa-first social commerce · shopaurora.africa · 2024 – Present",
          href: "https://shopaurora.africa",
          points: [
            "Live platform for 82 merchants across Ghana: Paystack payments, SQL-backed transactions, graceful failure recovery.",
            "Rolled back a commission-split feature when payment trust broke. Judgment over ego.",
          ],
        },
        {
          heading: "Geniy",
          meta: "AI research platform · geniy-frontend.vercel.app · 2024 – Present",
          href: "https://geniy-frontend.vercel.app",
          points: [
            "Multi-tenant Node/Express API on AWS RDS PostgreSQL with AES-256 and PII stripping as architecture, not a patch.",
            "Cut AI inference latency ~60%, sub-200ms API responses across 30+ workspaces.",
          ],
        },
        {
          heading: "VoteAurora",
          meta: "Campus e-voting · vote-aurora.vercel.app",
          href: "https://vote-aurora.vercel.app",
          points: [
            "Production e-voting under tight timelines: integrity, access control, fault tolerance first.",
          ],
        },
        {
          heading: "Pocket-F1",
          meta: "F1 party game · CloudFront + Lightsail · multiplayer",
          href: "https://d2yrwsemu4iolt.cloudfront.net/",
          points: [
            "Up to 8 players, three tracks, tire strategy, synchronized mid-race events; races ~5–7 minutes.",
            "Static app on S3/CloudFront via Terraform; multiplayer race state and sockets on Lightsail (Lambda’s short-lived model didn’t fit).",
            "UI still evolving; built to put CLF-C02 skills into practice after getting tired of only shipping SaaS.",
          ],
        },
        {
          heading: "Artifact",
          meta: "AI code-to-PR · in development · 2025 – Present",
          points: [
            "TypeScript pipeline: prompt → multi-file diff → commit → PR, GitHub APIs and LLM orchestration.",
          ],
        },
      ],
    },
    {
      id: "education",
      title: "Education",
      defaultOpen: false,
      items: [
        {
          heading: "University of Ghana",
          meta: "BSc Information Technology · Second-Class Upper (3.44/4.00) · Jan 2024 – Sep 2027",
          points: [
            "Data Structures & Algorithms I & II (A), Software Engineering (A), Intro to AI, Cloud Computing, Information Security, Mobile App Development, Computer Networks.",
          ],
        },
      ],
    },
    {
      id: "certifications",
      title: "Certifications",
      defaultOpen: true,
      items: [
        {
          heading: "AWS Certified Cloud Practitioner (CLF-C02)",
          meta: "Amazon Web Services · 2026",
          points: [
            "Cloud infrastructure, security, and pricing models. Putting it to work on Terraform, S3, CloudFront, and multiplayer game infra.",
          ],
        },
      ],
    },
    {
      id: "awards",
      title: "Awards",
      defaultOpen: false,
      items: [
        {
          heading: "2nd Place, COMPSSA × Alle-AI Hackathon",
          meta: "2025",
          points: [
            "Built Orbit, an AI campus networking app (GPT-4o matchmaking and icebreakers), competing against teams across Ghana.",
          ],
        },
      ],
    },
    {
      id: "skills",
      title: "Skills",
      defaultOpen: false,
      groups: [
        { label: "Languages", value: "TypeScript, Python, JavaScript, Java" },
        { label: "Backend & data", value: "Node.js, Express, PostgreSQL, SQL, MongoDB, Prisma, AWS RDS, REST" },
        { label: "Frontend & mobile", value: "React, React Native, Expo, HTML, CSS" },
        { label: "Cloud & DevOps", value: "AWS (CloudFront, S3, RDS, EC2, Lambda), Terraform, CI/CD, AES-256, PII handling" },
        { label: "AI", value: "LLM integration (OpenAI, OpenRouter), responsible AI, AI-assisted development" },
        { label: "Practice", value: "Git, GitHub, Agile/Scrum, code reviews, multiplayer systems" },
      ],
    },
  ],
} as const;

export const contact = {
  intro: "Say hello. No pitch required.",
  links: [
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/emmanuelcobbinah",
    },
    {
      label: "GitHub",
      href: "https://github.com/emmanuelcobbinah007",
    },
    {
      label: "Medium",
      href: "https://medium.com/@ecobbinahbuz",
    },
  ],
} as const;
