"use client";

import Link from "next/link";
import { useState } from "react";
import { HOME_SCROLL_KEY } from "./ScrollRestoration";
import Reveal from "./Reveal";

/**
 * v3 "my works" grid (Figma `32:166`, currently `121:726` — the node id
 * shifts whenever cards are added/removed in Figma, so don't trust an old
 * id in this comment without re-pulling metadata first) — replaces the old
 * "Case studies" three-strip layout entirely. Heading + a category filter —
 * All / SAAS & Web Apps / Landing / Mobile (Figma added the "All" tab in a
 * later pass; it's the default) — then a uniform 2-col grid of big-radius
 * (32px) cards.
 *
 * 19 real projects live in one tagged list now, not separate arrays swapped
 * by tab — "All" needs to show every project together, and a tag click
 * filters that same list rather than swapping data sets. Figma's own grid
 * carries a real per-card title + year instead of the old repeated
 * "THINGS® / _07.25" placeholder, so PROJECTS below carries that real copy
 * too.
 *
 * A project can carry MORE THAN ONE tag (`tags: Tag[]`, not a single
 * `tag`) — kotha uses this: it's one real project available as both a web
 * AND an app version (confirmed directly, not assumed from the name
 * match), and gets ONE card carrying both `saas` and `mobile` rather than
 * two separate cards, so it surfaces under either filter without "All"
 * ever rendering it twice.
 *
 * Probash kormi is the opposite case, on purpose: it also has a web AND an
 * app version, but — unlike kotha — BOTH get their own separate card here
 * (`probash-kormi` under Landing, `probash-kormi-app` under Mobile), each
 * with its own distinct cover art and its own case-study slug/content, not
 * a shared one. This went through two shapes before landing here: Figma's
 * grid briefly dropped to 18 cards by removing ONE of each pair's
 * duplicate (kotha's SAAS card AND probash kormi's Mobile card), which is
 * when `tags` was first added — multi-tagging kotha's single remaining
 * card so it wouldn't silently drop out of the SAAS filter. Probash kormi
 * was ALSO multi-tagged onto its one remaining (Landing) card at that
 * point, matching kotha's treatment. That's since been reverted: the App
 * version has its own real screenshots and its own case-study content now
 * (`public/projects/probash-kormi-app/`), so it gets its own visible card
 * again instead of being folded into the Landing card's tags. If kotha
 * ever gets a second, genuinely different set of app-specific screens too,
 * the same split (two real cards/slugs, not one multi-tagged one) is the
 * pattern to follow — multi-tagging is for "the same one thing shown under
 * two filters," not a substitute for two things that both deserve their
 * own case study.
 *
 * Every card gets its OWN canonical slug, slugified from its real title
 * (`akg-delivery`, `klimaregnskap`, …) — not borrowed/cycled from an
 * unrelated project the way an earlier pass did. No project details have
 * been uploaded yet for a few of these, so a few slugs have no matching
 * content/projects/*.mdx file. That's fine and intentional: `/work/[slug]`
 * (app/work/[slug]/page.tsx) already calls `notFound()` when `getProject`
 * returns null, which renders the real custom 404 (app/not-found.tsx) via
 * Next's not-found boundary — a soft, client-side transition since
 * `/work/[slug]` is a real dynamic route Link can navigate to, not a dead
 * link needing the `/404` redirect trick UI-Picker-style promos use. So a
 * card with no content yet just naturally 404s on click, and the exact
 * same Link starts resolving to the real case study the moment a matching
 * .mdx is added at that slug — no code change needed here when that
 * happens.
 *
 * `cover` is an explicit per-project field now, NOT derived from the
 * project's index within its category array (`cover-${i+1}.webp`, as an
 * earlier version did) — removing kotha from the middle of SAAS_PROJECTS
 * and probash kormi from the middle of MOBILE_PROJECTS would otherwise
 * have silently shifted every LATER entry in that array onto the wrong
 * cover file, since the actual files in `public/works/<category>/` kept
 * their original numbering. An explicit field can't drift out of sync with
 * the files on disk just because an entry was removed elsewhere in the
 * list.
 *
 * Every project's cover-image slot lives at `public/projects/<slug>/`
 * (created ahead of time, empty, for all of them) even before its .mdx
 * exists — see content/projects/_template.mdx for the cover/screen-N
 * naming convention new content should follow once it's ready:
 * `cover.webp` + `screen-N.avif` for everything after it. (One now-orphaned
 * folder from the 20-card version, `public/projects/probash-kormi-app/`,
 * was left in place rather than deleted — it's unreferenced now that
 * probash kormi is a single multi-tagged project sharing `probash-kormi`,
 * but removing it wasn't requested.)
 *
 * Caption is real per-card copy now: title left (uppercase), `_YEAR` right
 * — no month, unlike the old placeholder's `_07.25`. Kept as one uniform
 * `font-mono` span per side (matching the rest of the site's caption rows,
 * e.g. MoreProjects.tsx) rather than reproducing Figma's own two-tone
 * split (a separate grey "_" + dark year) — that split reads as an
 * over-literal reproduction of what's really just one label.
 *
 * The scroll-save-before-navigate behaviour carries over unchanged from the
 * old CaseStudies.tsx so the back button still lands where the user left
 * off.
 *
 * Mobile values below all come from Figma `79:273`: heading→tabs→grid run
 * on a flat 24px rhythm (not the old flat 32/56px), tab pills shrink to
 * `px-16 py-12` with an 8px gap between them, and card image radius drops
 * to 16px (not the sitewide 32px `img-radius` — this is the one place
 * that utility doesn't apply uniformly, so the radius is set directly
 * here instead of reusing it). The Figma mobile mockup wasn't updated in
 * this pass (per direct instruction) — it still only mocks up a subset of
 * cards, but that's not a cue to gate anything; every card renders on every
 * breakpoint automatically since this section reads from the same PROJECTS
 * list regardless of viewport (see the "Show more" note below).
 *
 * Card-to-card gap is 24px (`gap-y-6`), NOT Figma's own literal 8px
 * (`79:285`'s `gap-[8px]`) — that number is real, but only reads fine in
 * the mockup because its placeholder covers are flat grey rectangles with
 * no visual weight. Real photos at an 8px gap visually bled into each
 * other (confirmed against an actual mobile screenshot — captions sat
 * almost flush against the next card's image, no breathing room at all).
 * This is a deliberate, sighted departure from the literal spec value.
 *
 * All cards show on mobile, same as desktop — a "Show more" toggle was
 * tried here (Figma's own mobile mockup only mocks up a subset of the
 * cards, which read as a cue to paginate), but that toggle looked too
 * prominent in practice and was dropped per direct feedback: every card
 * just renders up front on every breakpoint now, no gating.
 */
type Tag = "saas" | "web" | "mobile";
type FilterKey = "all" | Tag;

const TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "saas", label: "SAAS & Web Apps" },
  { key: "web", label: "Landing" },
  { key: "mobile", label: "Mobile" },
];

type ProjectInput = {
  title: string;
  year: number;
  slug: string;
  cover: string;
  /** Extra tags beyond the category this entry is declared under — e.g.
   *  kotha (declared under SAAS) also carries `mobile` since it's the same
   *  project available as both a web and an app version. */
  extraTags?: Tag[];
};

type Project = { cover: string; tags: Tag[]; title: string; year: number; slug: string };

const SAAS_PROJECTS: ProjectInput[] = [
  { title: "AKG Delivery", year: 2026, slug: "akg-delivery", cover: "/works/saas/cover-1.webp" },
  { title: "klimaregnskap", year: 2025, slug: "klimaregnskap", cover: "/works/saas/cover-2.webp" },
  { title: "test taker", year: 2026, slug: "test-taker", cover: "/works/saas/cover-3.webp" },
  { title: "elobooks", year: 2024, slug: "elobooks", cover: "/works/saas/cover-4.webp" },
  { title: "Legal Ai", year: 2025, slug: "legal-ai", cover: "/works/saas/cover-6.webp" },
  { title: "bag flyers", year: 2026, slug: "bag-flyer", cover: "/works/saas/cover-7.webp" },
  { title: "relivery", year: 2025, slug: "relivery", cover: "/works/saas/cover-8.webp" },
];

const LANDING_PROJECTS: ProjectInput[] = [
  { title: "one circle", year: 2026, slug: "one-circle", cover: "/works/landing/cover-1.webp" },
  { title: "Rev up", year: 2026, slug: "revup", cover: "/works/landing/cover-2.webp" },
  { title: "dmv resfin", year: 2025, slug: "dmv-resfin", cover: "/works/landing/cover-3.webp" },
  { title: "probash kormi", year: 2024, slug: "probash-kormi", cover: "/works/landing/cover-4.webp" },
  { title: "accelosys", year: 2025, slug: "accelosys", cover: "/works/landing/cover-5.webp" },
  { title: "axiom reach", year: 2024, slug: "axiom-reach", cover: "/works/landing/cover-6.webp" },
  { title: "synergy", year: 2025, slug: "synergy", cover: "/works/landing/cover-7.webp" },
  { title: "noor study", year: 2025, slug: "noor-study", cover: "/works/landing/cover-8.webp" },
  { title: "serene space", year: 2024, slug: "serene-space", cover: "/works/landing/cover-9.webp" },
];

const MOBILE_PROJECTS: ProjectInput[] = [
  {
    title: "kotha",
    year: 2025,
    slug: "kotha",
    cover: "/works/mobile/cover-1.webp",
    extraTags: ["saas"],
  },
  { title: "jamahook", year: 2024, slug: "jamahook", cover: "/works/mobile/cover-2.webp" },
  { title: "probash kormi", year: 2024, slug: "probash-kormi-app", cover: "/works/mobile/cover-3.webp" },
];

function withTag(inputs: ProjectInput[], tag: Tag): Project[] {
  return inputs.map(({ title, year, slug, cover, extraTags }) => ({
    cover,
    tags: [tag, ...(extraTags ?? [])],
    title,
    year,
    slug,
  }));
}

const PROJECTS: Project[] = [
  ...withTag(SAAS_PROJECTS, "saas"),
  ...withTag(LANDING_PROJECTS, "web"),
  ...withTag(MOBILE_PROJECTS, "mobile"),
];

function saveScrollAndGo() {
  try {
    sessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY));
  } catch {
    /* sessionStorage unavailable — return navigation just lands at top */
  }
}

/** `loading="lazy"` + `decoding="async"` on the cover: this grid alone is 19
 *  images, always below the fold, and none of them use next/image (plain
 *  static export, no optimization pipeline) — without these, the browser
 *  fetches and synchronously decodes all of them the moment the page
 *  loads, which was a real, measurable contributor to scroll jank
 *  site-wide. */
function Card({ cover, slug, title, year }: { cover: string; slug: string; title: string; year: number }) {
  return (
    <Link
      href={`/work/${slug}`}
      data-cursor="View"
      onClick={saveScrollAndGo}
      className="group flex w-full flex-col gap-3"
    >
      <Reveal
        image
        className="relative aspect-[1600/1200] w-full overflow-hidden rounded-2xl lg:rounded-[32px]"
      >
        <div className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]">
          <img
            src={cover}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      </Reveal>

      <div className="flex items-center justify-between gap-4 px-1 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 lg:px-2">
        <span className="font-mono text-[14px] leading-none text-ink uppercase">
          {title}
        </span>
        <span className="font-mono text-[14px] leading-none text-ink uppercase">
          _{year}
        </span>
      </div>
    </Link>
  );
}

export default function ProjectsGrid() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const projects =
    filter === "all"
      ? PROJECTS
      : PROJECTS.filter((p) => p.tags.includes(filter));

  return (
    <section
      id="works"
      aria-label="Projects"
      className="page-container flex flex-col gap-6 px-gutter lg:gap-14 lg:px-gutter-lg"
    >
      <Reveal
        group
        className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end lg:gap-8"
      >
        <h2 className="text-[clamp(2rem,4.5vw,3rem)] leading-[1.2] tracking-display text-ink">
          Check out my
          <br />
          design projects!
        </h2>

        <div className="flex flex-wrap items-center gap-2 lg:gap-4">
          {TABS.map((tab) => {
            const active = tab.key === filter;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`btn-liquid rounded-full border border-ink px-4 py-3 text-base transition-colors duration-300 lg:px-6 lg:py-4 ${
                  active
                    ? "bg-ink text-page"
                    : "bg-transparent text-ink hover:bg-ink/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </Reveal>

      <div
        key={filter}
        className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:gap-y-10"
      >
        {projects.map((project) => (
          <Card
            key={`${project.slug}-${project.cover}`}
            cover={project.cover}
            slug={project.slug}
            title={project.title}
            year={project.year}
          />
        ))}
      </div>
    </section>
  );
}
