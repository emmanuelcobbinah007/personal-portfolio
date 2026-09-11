"use client";

import { resume } from "@/lib/content";
import { useEffect, useId, useState } from "react";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`chevron h-3.5 w-3.5 shrink-0 text-ink-faint ${open ? "is-open" : ""}`}
      viewBox="0 0 12 12"
      aria-hidden
    >
      <path
        d="M4.2 2.2 8.5 6 4.2 9.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccordionPanel({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [reduce, setReduce] = useState(false);
  const panelId = useId();
  const buttonId = useId();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className={`accordion${open ? " is-open" : ""}`}>
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        className="accordion-trigger flex w-full items-center justify-between gap-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-display text-xl text-ink sm:text-2xl">{title}</span>
        <Chevron open={open} />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`accordion-drawer${reduce ? " reduce-motion" : ""}`}
        data-open={open ? "true" : "false"}
      >
        <div className="accordion-drawer-inner">
          <div className="accordion-body mt-5 space-y-8 pb-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Resume() {
  return (
    <section
      id="resume"
      aria-labelledby="resume-heading"
      className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-12 lg:py-28"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2
          id="resume-heading"
          className="font-display text-3xl text-cocoa sm:text-4xl"
        >
          Resume
        </h2>
        <a
          href={resume.pdf}
          download
          className="text-sm text-ink underline decoration-rule underline-offset-4 transition-colors duration-200 hover:text-lagoon hover:decoration-lagoon"
        >
          {resume.pdfLabel}
        </a>
      </div>
      <p className="mt-3 text-sm text-ink-faint">{resume.intro}</p>
      <hr className="section-rule mt-6 mb-4" />

      <div className="divide-y divide-rule">
        {resume.sections.map((section) => (
          <AccordionPanel
            key={section.id}
            title={section.title}
            defaultOpen={"defaultOpen" in section ? section.defaultOpen : false}
          >
            {"groups" in section && section.groups ? (
              <dl className="grid gap-4 sm:grid-cols-2">
                {section.groups.map((g) => (
                  <div key={g.label}>
                    <dt className="text-xs tracking-[0.06em] text-clay uppercase">
                      {g.label}
                    </dt>
                    <dd className="mt-1 text-[0.95rem] leading-relaxed text-ink-muted">
                      {g.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              "items" in section &&
              section.items.map((item) => (
                <article key={item.heading}>
                  <h3 className="text-base font-medium text-ink sm:text-lg">
                    {"href" in item && item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors duration-200 hover:text-lagoon"
                      >
                        {item.heading}
                        <span className="sr-only"> (opens in new tab)</span>
                      </a>
                    ) : (
                      item.heading
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-ink-faint">{item.meta}</p>
                  {"points" in item && (
                    <ul className="mt-3 space-y-2 text-[0.95rem] leading-relaxed text-ink-muted">
                      {item.points.map((point) => (
                        <li key={point.slice(0, 40)} className="pl-0">
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))
            )}
          </AccordionPanel>
        ))}
      </div>
    </section>
  );
}
