import Link from "next/link";
import Reveal from "./Reveal";

/**
 * Case studies (Figma 96:25) — the section label, then three showcase strips
 * in descending scale: one full-width screen, a two-up row, a three-up row.
 * Each strip is a link to its /work/[slug] page.
 *
 * Hover choreography honours the reveal-contention rule (CLAUDE.md): the
 * reveal animates the <img> itself and the clip container, so the hover
 * scale lives on a wrapper div between them, the gradient is a sibling
 * overlay, and the caption shift sits on the group container — GSAP never
 * touches any element that carries a CSS transition on transform/opacity.
 *
 * Placeholder data lives here on purpose. CLAUDE.md flags the MDX frontmatter
 * schema as unsettled against the richer case-study template, so wiring these
 * strips to lib/projects now would just have to be redone. Swap this array
 * for the content layer once that schema lands.
 */
type Showcase = {
  slug: string;
  name: string;
  category: string;
  year: string;
  image: string;
};

const FULL: Showcase = {
  slug: "ledger",
  name: "Ledger",
  category: "Financing dashboard",
  year: "2024",
  image: "/showcase/screen-1.png",
};

const TWO_UP: Showcase[] = [
  {
    slug: "atlas",
    name: "Atlas",
    category: "Ops control room",
    year: "2025",
    image: "/hero/gallery-2.png",
  },
  {
    slug: "meridian",
    name: "Meridian",
    category: "Fleet dashboard",
    year: "2025",
    image: "/hero/gallery-3.png",
  },
];

const THREE_UP: Showcase[] = [
  {
    slug: "pulse",
    name: "Pulse",
    category: "Analytics overview",
    year: "2023",
    image: "/hero/gallery-1.png",
  },
  {
    slug: "tidal",
    name: "Tidal",
    category: "Banking app",
    year: "2023",
    image: "/hero/gallery-4.png",
  },
  {
    slug: "vitals",
    name: "Vitals",
    category: "Health console",
    year: "2022",
    image: "/showcase/screen-1.png",
  },
];

const HOVER_EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";

/** Title + year on one row, category tight beneath — Figma 96:32. */
function Caption({ item }: { item: Showcase }) {
  return (
    // Hover shift lives HERE: GSAP animates this container's children during
    // the reveal, never the container itself, so a transform transition on
    // it can't fight the reveal.
    <Reveal
      group
      className={`flex w-full flex-col gap-1 transition-transform duration-500 ${HOVER_EASE} group-hover:-translate-y-0.5`}
    >
      <span className="flex items-baseline justify-between leading-none">
        <span className="font-display text-2xl tracking-[-0.01em] text-ink uppercase">
          {item.name}
        </span>
        <span className="text-base leading-none tracking-body text-ink-muted transition-colors duration-500 group-hover:text-ink">
          {item.year}
        </span>
      </span>
      <span className="text-base leading-none tracking-body text-ink-muted transition-colors duration-500 group-hover:text-ink">
        {item.category}
      </span>
    </Reveal>
  );
}

function Strip({ item, aspect }: { item: Showcase; aspect: string }) {
  return (
    <Link
      href={`/work/${item.slug}`}
      data-cursor="view"
      className="group flex w-full flex-col gap-6"
    >
      <Reveal image className={`relative w-full overflow-hidden ${aspect}`}>
        {/* Hover scale on this wrapper, NOT the <img> — the reveal animates
            the img's own scale (1.08→1) and would fight a transition there. */}
        <div
          className={`h-full w-full transition-transform duration-700 ${HOVER_EASE} group-hover:scale-[1.06]`}
        >
          <img
            src={item.image}
            alt={`${item.name} — ${item.category}`}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Soft dark gradient rising from the bottom on hover. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      </Reveal>

      <Caption item={item} />
    </Link>
  );
}

export default function CaseStudies() {
  return (
    <section
      aria-label="Case studies"
      className="flex flex-col gap-16 px-gutter py-20 lg:gap-24 lg:px-gutter-lg lg:py-28"
    >
      <Reveal
        as="h2"
        className="text-[clamp(2rem,4.2vw,3rem)] leading-[1.05] tracking-[-0.02em]"
      >
        Case studies
      </Reveal>

      <Strip item={FULL} aspect="aspect-[1200/680]" />

      <div className="flex flex-col gap-16 lg:flex-row lg:gap-6">
        {TWO_UP.map((item) => (
          <div key={item.slug} className="flex-1">
            <Strip item={item} aspect="aspect-[588/440]" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-16 sm:flex-row sm:gap-6">
        {THREE_UP.map((item) => (
          <div key={item.slug} className="flex-1">
            <Strip item={item} aspect="aspect-[384/480]" />
          </div>
        ))}
      </div>
    </section>
  );
}
