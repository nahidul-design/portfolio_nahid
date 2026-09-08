import Link from "next/link";
import Reveal from "../Reveal";
import { withBasePath } from "@/lib/assets";
import type { Project } from "@/lib/projects";

/** Same glyph as Nav/Resume's download arrow, rotated to point right — the
 *  sitewide convention for a directional CTA arrow. */
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

/** One project card — image + `title / scope — year` caption row. Shared
 *  between the mobile (1-col, `gap-2`) and desktop (2-col, `gap-6`) grids
 *  below so the card markup itself isn't duplicated, only the grid
 *  wrapping it. */
function Card({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      data-cursor="View"
      className="group flex flex-col gap-3"
    >
      <Reveal
        image
        className="aspect-[1600/1200] w-full overflow-hidden rounded-2xl lg:rounded-[32px]"
      >
        <img
          src={withBasePath(project.screens[0]?.image ?? "")}
          alt={`${project.title} — preview`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </Reveal>

      <div className="flex items-center justify-between font-mono text-[14px] leading-none text-ink-muted uppercase">
        <span>{project.title}</span>
        <span>
          {project.scope} — {project.year}
        </span>
      </div>
    </Link>
  );
}

/**
 * "More Projects" (Figma `77:2`/`77:126` desktop, `81:494` mobile) — a
 * full-width section BELOW the sidebar+screens row, not indented under the
 * sidebar; own page-container so its 1376px content width matches every
 * other section on the site.
 *
 * Two cards, not v2's single "next project" — lib/projects.ts's
 * getNextProjects(slug, 2) supplies them, wrapping past the last project
 * back to the first (same wraparound v2 had, just returning 2 now).
 *
 * Mobile card gap is 24px (`gap-6`), NOT Figma's own literal 8px
 * (`81:494`'s two cards sit 8px apart) — same situation, and same fix, as
 * ProjectsGrid.tsx's home-grid cards: the literal value only reads fine in
 * Figma's mockup because its placeholder covers are flat grey rectangles
 * with no visual weight; real photos at 8px read as congested, no
 * breathing room. Desktop's 24px (`gap-6`) is untouched — it already
 * matches Figma exactly (`77:97`'s two 676px-wide cards sit a genuine 24px
 * apart), and reads fine there since the cards themselves are so much
 * wider.
 *
 * Card caption reuses ProjectsGrid.tsx's home-page convention (title left,
 * `Scope — Year` right, muted) rather than Figma's own placeholder
 * "THINGS® / 07.25" — that text is a repeated dummy string in the Figma
 * file itself, not real content to reproduce.
 *
 * Mobile (`81:494`) is a genuinely different arrangement, not just a
 * narrower desktop one: the heading sits alone (no button beside it), the
 * grid is a single column, and the "all projects" button comes AFTER the
 * grid instead of next to the heading. Rendered as two separate blocks
 * (`lg:hidden` / `hidden lg:block`) rather than one markup tree reordered
 * with CSS — the button moving from "beside the heading" to "below the
 * grid" isn't a reorder within one flex row, it changes which row it's
 * even part of, so a single shared tree would need real restructuring
 * either way; two explicit blocks stay easier to read. Same pattern
 * Nav.tsx's mobile panel and Resume.tsx's mobile job rows already use.
 *
 * The "all projects" pill is a `btn-liquid` element, which owns its own
 * CSS `transition` on `transform` — it must NOT be a direct child of a
 * `data-reveal-group` (an earlier version put the desktop one there), or
 * GSAP's per-frame inline writes and that CSS transition fight over the
 * same property and the element gets stuck invisible instead of ever
 * settling (confirmed live: the h2 in that same group revealed fine, the
 * button next to it never did — exactly the contention CLAUDE.md warns
 * about elsewhere, e.g. Hero.tsx's own "get in touch" button). Fixed the
 * same way Hero.tsx does it: the heading and the button each get their
 * own independent `data-reveal` instead of sharing one group.
 */
export default function MoreProjects({ projects }: { projects: Project[] }) {
  return (
    <section className="page-container px-gutter py-20 lg:px-gutter-lg lg:py-28">
      {/* ---- Mobile (81:494) ------------------------------------------ */}
      <div className="flex flex-col gap-6 lg:hidden">
        <Reveal
          as="h2"
          className="text-[clamp(2rem,4vw,3rem)] leading-[1.2] tracking-display text-ink"
        >
          More Projects
        </Reveal>

        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <Card key={project.slug} project={project} />
          ))}
        </div>

        <Reveal className="w-fit">
          <Link
            href="/#works"
            className="btn-liquid inline-flex items-center gap-4 rounded-full bg-ink px-6 py-4 font-mono text-[14px] leading-none text-page uppercase"
          >
            all projects
            <div className="-rotate-90 flex-none">
              <ArrowDown />
            </div>
          </Link>
        </Reveal>
      </div>

      {/* ---- Desktop (77:97 / 77:214) ----------------------------------- */}
      <div className="hidden lg:block">
        <div className="mb-12 flex items-center justify-between">
          <Reveal
            as="h2"
            className="text-[clamp(2rem,4vw,3rem)] leading-[1.2] tracking-display text-ink"
          >
            More Projects
          </Reveal>

          <Reveal>
            <Link
              href="/#works"
              className="btn-liquid inline-flex items-center gap-4 rounded-full bg-ink px-6 py-4 font-mono text-[14px] leading-none text-page uppercase"
            >
              all projects
              <div className="-rotate-90 flex-none">
                <ArrowDown />
              </div>
            </Link>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
