import { Fragment } from "react";
import Reveal from "./Reveal";

/**
 * Résumé (Figma 96:82) — label-left/content-right rows for Experience and
 * Education, hairlines between entries, download pill.
 *
 * Stagger is between ROWS, not within one: each Job/Degree block is a single
 * reveal unit (name, dates, and institution move together), and the Jobs
 * column staggers those units 60ms apart — matching "résumé jobs" in the
 * brief. Exploding further (e.g. animating the degree name separately from
 * its dates) would be over-tagging for content that always reads as one row.
 */

const JOBS = [
  {
    title: "Product Designer",
    company: "Embedded Logic Operations",
    dates: "Mar 2022 – Present",
  },
  {
    title: "Jr. Product Designer",
    company: "TFP Solutions",
    dates: "Jul 2021 – Mar 2022",
  },
  {
    title: "Graphic Designer & Business Executive",
    company: "Adway Digital Ltd",
    dates: "Feb 2020 – Jul 2021",
  },
] as const;

const EDUCATION = {
  title: "BSc in Software Engineering",
  institution: "Daffodil International University, Dhaka, Bangladesh",
  dates: "Jan 2016 – Dec 2019",
};

function ArrowDown() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M8 3v8.5M4.5 8.5L8 12l3.5-3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** One row: name+dates on top, the secondary line beneath. Always one unit. */
function Row({
  title,
  dates,
  subtitle,
}: {
  title: string;
  dates: string;
  subtitle: string;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-2xl leading-[1.2] tracking-[-0.01em] text-ink uppercase">
          {title}
        </p>
        <p className="shrink-0 text-base tracking-body text-ink-muted">
          {dates}
        </p>
      </div>
      <p className="text-base tracking-body text-ink-muted">{subtitle}</p>
    </div>
  );
}

export default function Resume() {
  return (
    <section
      aria-label="Résumé"
      className="flex flex-col items-end gap-10 bg-ink/[0.03] px-gutter py-20 lg:gap-12 lg:px-gutter-lg lg:py-28"
    >
      <div className="flex w-full flex-col items-start gap-6 sm:flex-row sm:gap-6">
        <Reveal
          as="p"
          className="w-[180px] shrink-0 font-display text-2xl leading-[1.2] tracking-[-0.01em] text-ink-muted uppercase"
        >
          Experience
        </Reveal>

        <Reveal group className="flex w-full flex-1 flex-col gap-6">
          {JOBS.map((job, i) => (
            <Fragment key={job.title}>
              {i > 0 && <span className="h-px w-full bg-ink/10" />}
              <Row title={job.title} dates={job.dates} subtitle={job.company} />
            </Fragment>
          ))}
        </Reveal>
      </div>

      <Reveal as="span" className="h-px w-full bg-ink/10" />

      <div className="flex w-full flex-col items-start gap-6 sm:flex-row sm:gap-6">
        <Reveal
          as="p"
          className="w-[180px] shrink-0 font-display text-2xl leading-[1.2] tracking-[-0.01em] text-ink-muted uppercase"
        >
          Education
        </Reveal>

        <Reveal as="div" className="w-full flex-1">
          <Row
            title={EDUCATION.title}
            dates={EDUCATION.dates}
            subtitle={EDUCATION.institution}
          />
        </Reveal>
      </div>

      {/* Plain wrapper, not the pill itself — btn-liquid owns a CSS
          transition on transform/opacity that GSAP's reveal would fight. */}
      <Reveal>
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener"
          data-cursor="view"
          className="btn-liquid inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-base tracking-normal text-page uppercase hover:opacity-85"
        >
          Download Résumé
          <ArrowDown />
        </a>
      </Reveal>
    </section>
  );
}
