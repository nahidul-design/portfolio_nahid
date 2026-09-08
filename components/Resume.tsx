import { Fragment } from "react";
import EyebrowTag from "./EyebrowTag";
import Reveal from "./Reveal";
import SmoothAnchor from "./SmoothAnchor";

/**
 * v3 Résumé (Figma `32:32` desktop / `79:376` mobile) — same job-row shape
 * as v2, restyled onto the new tokens: EyebrowTag replaces the plain
 * "Experience"/"Education" label, Manrope 24px job titles, Chivo Mono
 * dates/company at 60% opacity, hairlines at the new 5%-opacity line color.
 *
 * The trailing CTA row is now just a centered "get in touch" button, no
 * "Want to Learn More ?" label next to it — dropped per a fresh design
 * pass, matching what Figma's OWN mobile frame (`79:409`) already shows
 * (a lone centered button, no paired text) even though the desktop frame
 * (`32:66`) technically still has the old text/button pair on file; this
 * applies that same simplification to desktop too rather than leaving the
 * two breakpoints inconsistent.
 *
 * Mobile (`79:376`) is a genuinely different job-row layout, not a
 * squeezed desktop one — each Experience/Education block gets its own
 * eyebrow tag ABOVE it (not beside), and the jobs sit in a left-bordered
 * "timeline" rail (`border-ink/10`, `pl-6`) with title/dates/company
 * stacked on separate lines (gap-2) instead of title+dates sharing one
 * baseline. Different enough from the desktop label-left/content-right
 * row that sharing one markup tree would need more conditional branching
 * than just rendering both and hiding one per breakpoint (`lg:hidden` /
 * `hidden lg:flex`) — same approach Nav.tsx's mobile panel takes.
 *
 * Both job-title sizes (24px desktop `Row`, 20px mobile `MobileRow`) run
 * at `leading-[1.35]` per the site-wide rule that any 20px/24px text uses
 * 135% line-height, not the 120%/`leading-normal` each used before.
 *
 * Mobile's internal rhythm is 24px (`gap-6`) now, not the original flat
 * 16px (`gap-4`) — a later Figma pass increased it (confirmed via a
 * dev-mode gap annotation on the frame showing 24 between the job list and
 * the section after it), on the outer section-to-section gaps AND the
 * job-to-job gap inside the timeline rail. `MobileRow`'s own internal
 * title/dates/company stacking (`gap-2`, 8px) is untouched — that's a
 * different, tighter grouping the Figma pass didn't touch.
 */
const JOBS = [
  {
    title: "Product Designer",
    company: "Embedded Logic Operations",
    dates: "Mar 2022 / Present",
  },
  {
    title: "Jr. Product Designer",
    company: "TFP Solutions",
    dates: "Jul 2021 / Mar 2022",
  },
  {
    title: "Graphic Designer & Business Executive",
    company: "Adway Digital Ltd",
    dates: "Feb 2020 / Jul 2021",
  },
] as const;

const EDUCATION = {
  title: "BSc. in Software Engineering",
  institution: "Daffodil International University, Dhaka",
  dates: "jan 2016 / dec 2020",
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

/** Desktop row: title+dates share one baseline, company beneath. */
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
        <p className="min-w-0 text-2xl leading-[1.35] tracking-display text-ink">
          {title}
        </p>
        <p className="shrink-0 font-mono text-[14px] leading-none text-ink uppercase">
          {dates}
        </p>
      </div>
      <p className="font-mono text-[14px] leading-none text-ink/60 uppercase">
        {subtitle}
      </p>
    </div>
  );
}

/** Mobile row: title, dates, company each on their own line (Figma `79:385`). */
function MobileRow({
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
      <p className="text-xl leading-[1.35] tracking-display text-ink">
        {title}
      </p>
      <p className="font-mono text-[14px] leading-none text-ink uppercase">
        {dates}
      </p>
      <p className="font-mono text-[14px] leading-none text-ink/60 uppercase">
        {subtitle}
      </p>
    </div>
  );
}

export default function Resume() {
  return (
    <section
      id="experience"
      aria-label="Résumé"
      className="page-container flex flex-col items-end px-gutter lg:px-gutter-lg"
    >
      {/* This heading's bottom margin is kept OUTSIDE the gap wrapper below
          so the two don't stack into a wrong, too-large gap (an earlier
          version had both a parent gap AND this margin apply between the
          same two elements). 24px at mobile (Figma `79:376`'s own
          gap-[24px]), not the same 32px desktop used before switching to
          its 60px value. */}
      <Reveal
        as="h2"
        className="mb-6 w-full text-[clamp(2rem,4.5vw,3rem)] leading-[1.2] tracking-display text-ink lg:mb-[60px]"
      >
        A quick glance at my
        <br />
        experience ⁕ education
      </Reveal>

      {/* ---- Mobile (Figma 79:376) ------------------------------------ */}
      <div className="flex w-full flex-col gap-6 lg:hidden">
        <div className="flex w-full flex-col gap-6">
          <Reveal as="div" className="w-fit">
            <EyebrowTag>experience</EyebrowTag>
          </Reveal>

          <Reveal
            group
            className="flex w-full flex-col gap-6 border-l border-ink/10 pl-6"
          >
            {JOBS.map((job, i) => (
              <Fragment key={job.title}>
                {i > 0 && <span className="h-px w-full bg-line" />}
                <MobileRow
                  title={job.title}
                  dates={job.dates}
                  subtitle={job.company}
                />
              </Fragment>
            ))}
          </Reveal>
        </div>

        <Reveal as="span" className="h-px w-full bg-line" />

        <div className="flex w-full flex-col gap-6">
          <Reveal as="div" className="w-fit">
            <EyebrowTag>education</EyebrowTag>
          </Reveal>

          <Reveal as="div" className="border-l border-ink/10 pl-6">
            <MobileRow
              title={EDUCATION.title}
              dates={EDUCATION.dates}
              subtitle={EDUCATION.institution}
            />
          </Reveal>
        </div>

        <Reveal as="span" className="h-px w-full bg-line" />

        {/* Left-aligned at mobile (per a later note) — deliberately
            different from desktop's centered version below, not a missed
            responsive class. */}
        <Reveal className="flex w-full justify-start">
          <SmoothAnchor
            href="#contact"
            className="btn-liquid inline-flex items-center gap-4 rounded-full bg-ink px-6 py-4 font-mono text-[14px] leading-none text-page uppercase"
          >
            get in touch
            <div className="-rotate-90 flex-none">
              <ArrowDown />
            </div>
          </SmoothAnchor>
        </Reveal>
      </div>

      {/* ---- Desktop (Figma 32:32) ------------------------------------- */}
      <div className="hidden w-full flex-col items-end gap-6 lg:flex">
        <div className="flex w-full flex-col items-start gap-6 sm:flex-row sm:gap-6">
          <Reveal as="div" className="w-[180px] shrink-0">
            <EyebrowTag>experience</EyebrowTag>
          </Reveal>

          <Reveal group className="flex w-full min-w-0 flex-1 flex-col gap-6">
            {JOBS.map((job, i) => (
              <Fragment key={job.title}>
                {i > 0 && <span className="h-px w-full bg-line" />}
                <Row
                  title={job.title}
                  dates={job.dates}
                  subtitle={job.company}
                />
              </Fragment>
            ))}
          </Reveal>
        </div>

        <Reveal as="span" className="h-px w-full bg-line" />

        <div className="flex w-full flex-col items-start gap-6 sm:flex-row sm:gap-6">
          <Reveal as="div" className="w-[180px] shrink-0">
            <EyebrowTag>education</EyebrowTag>
          </Reveal>

          <Reveal as="div" className="w-full min-w-0 flex-1">
            <Row
              title={EDUCATION.title}
              dates={EDUCATION.dates}
              subtitle={EDUCATION.institution}
            />
          </Reveal>
        </div>

        <Reveal as="span" className="h-px w-full bg-line" />

        <Reveal className="flex w-full justify-center">
          <SmoothAnchor
            href="#contact"
            className="btn-liquid inline-flex items-center gap-4 rounded-full bg-ink px-6 py-4 font-mono text-[14px] leading-none text-page uppercase"
          >
            get in touch
            <div className="-rotate-90 flex-none">
              <ArrowDown />
            </div>
          </SmoothAnchor>
        </Reveal>
      </div>
    </section>
  );
}
