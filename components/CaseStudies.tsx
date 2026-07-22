"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HOME_SCROLL_KEY } from "./ScrollRestoration";
import Reveal from "./Reveal";
import SquiggleArrow from "./SquiggleArrow";

/**
 * Case studies (Figma 173:125, "Frame 10") — re-pulled after the first pass
 * didn't match. Structure, verified against the node: a header row (label +
 * squiggle arrow), then three strips at `gap-[40px]`: one full-width cover,
 * a two-up row, and a hover-interactive three-up row (see ThreeUpRow below)
 * whose default state — first card wide, other two narrow — matches
 * Figma's 1+2 split, but is now a live accordion rather than a static
 * layout.
 *
 * Caption (Figma node `173:134` etc.): title left (Instrument Serif 24px,
 * full ink), category right (Barlow 16px, 60% ink, `capitalize` — not
 * uppercase). There is no year in the caption; an earlier pass invented one.
 *
 * Every strip links to /404 rather than /work/[slug] — the real case-study
 * pages aren't built yet, so this points at the site's "under construction"
 * page instead of a dead route (same call as the UI Picker CTA).
 *
 * "use client" for one reason: Strip's onClick saves the current scroll
 * position before navigating away, so RestoreHomeScroll can put the user
 * back where they were on return (browser back OR a "back home" link — see
 * ScrollRestoration.tsx for why the mechanism doesn't matter).
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
  image: string;
};

import { withBasePath } from "@/lib/assets";

const FULL: Showcase = {
  slug: "test-taker",
  name: "Test Taker",
  category: "Online exam tool",
  image: withBasePath("/showcase/test-taker.webp"),
};

const TWO_UP: Showcase[] = [
  {
    slug: "bag-flyer",
    name: "Bag Flyer",
    category: "P2P delivery platform",
    image: withBasePath("/showcase/bag-flyer.webp"),
  },
  {
    slug: "relivery",
    name: "Relivery",
    category: "Appliances rental service",
    image: withBasePath("/showcase/relivery.webp"),
  },
];

const THREE_UP: Showcase[] = [
  {
    slug: "kotha",
    name: "Kotha",
    category: "Social media app",
    image: withBasePath("/showcase/kotha.webp"),
  },
  {
    slug: "revup",
    name: "RevUp",
    category: "Landing Page",
    image: withBasePath("/showcase/revup.webp"),
  },
];

const HOVER_EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";

/** Title left (full ink), category right (60% ink, capitalize) — no year;
 *  Figma 173:134/141/148/154/161/168 all follow this same two-part row. */
function Caption({ item }: { item: Showcase }) {
  return (
    // Hover shift lives HERE: GSAP animates this container's children during
    // the reveal, never the container itself, so a transform transition on
    // it can't fight the reveal.
    <Reveal
      group
      className={`flex w-full items-center justify-between gap-4 leading-none transition-transform duration-500 ${HOVER_EASE} group-hover:-translate-y-0.5`}
    >
      <span className="font-display text-2xl tracking-[-0.01em] text-ink uppercase">
        {item.name}
      </span>
      <span className="shrink-0 truncate text-base text-ink-muted capitalize tracking-body transition-colors duration-500 group-hover:text-ink">
        {item.category}
      </span>
    </Reveal>
  );
}

/** Accordion state passed down from AccordionRow (mobile tap) or ThreeUpRow
 *  (desktop hover) — undefined outside an accordion row (the full-width
 *  strip), which never redistributes. `onHover` is only wired up by rows
 *  that want desktop hover-driven expansion (currently just ThreeUpRow) —
 *  the mobile tap-only AccordionRow leaves it unset. */
type Accordion = {
  isActive: boolean;
  growWeight: number;
  isMobile: boolean;
  onActivate: () => void;
  onHover?: () => void;
  /** Defaults to a springy overshoot bezier, right for a one-off tap. A
   *  hover-driven row re-triggers far more often as the cursor moves card
   *  to card, where that much bounce reads as jittery rather than lively —
   *  ThreeUpRow overrides this to the sitewide "reveal" ease instead
   *  (`cubic-bezier(0.16,1,0.3,1)`, no overshoot, still not linear-stiff). */
  easing?: string;
};

function Strip({
  item,
  aspect,
  heightClass,
  objectPosition = "object-cover",
  accordion,
}: {
  item: Showcase;
  /** Aspect-locked sizing (image height follows width) — used by rows
   *  where every card scales uniformly. Provide this XOR heightClass. */
  aspect?: string;
  /** Fixed-height sizing (width alone flexes, height stays constant across
   *  the row) — used by ThreeUpRow so an expanding/shrinking card doesn't
   *  also change height, matching the reference row's flat roofline. */
  heightClass?: string;
  objectPosition?: string;
  accordion?: Accordion;
}) {
  return (
    <Link
      href="/404"
      data-cursor="View"
      style={
        accordion
          ? {
              // flex-grow with a 0% basis (not a percentage basis) so the
              // row's gap is never double-counted against 100% — grow ratios
              // alone decide each item's share of the already-gap-reduced
              // free space.
              flex: `${accordion.growWeight} 0 0%`,
              transition: `flex-grow 450ms ${accordion.easing ?? "cubic-bezier(0.34, 1.56, 0.64, 1)"}`,
            }
          : undefined
      }
      onMouseEnter={() => accordion?.onHover?.()}
      onClick={(e) => {
        // On a narrow viewport, the first tap on an inactive item expands it
        // instead of navigating — a second tap (now active) goes through.
        if (accordion?.isMobile && !accordion.isActive) {
          e.preventDefault();
          accordion.onActivate();
          return;
        }
        try {
          sessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY));
        } catch {
          /* sessionStorage unavailable — return navigation just lands at top */
        }
      }}
      className={`group flex w-full flex-col gap-4 ${accordion ? "min-w-0 shrink-0" : ""}`}
    >
      <Reveal
        image
        className={`img-radius relative w-full overflow-hidden ${heightClass ?? aspect}`}
      >
        {/* Hover scale on this wrapper, NOT the <img> — the reveal animates
            the img's own scale (1.08→1) and would fight a transition there. */}
        <div
          className={`h-full w-full transition-transform duration-700 ${HOVER_EASE} group-hover:scale-[1.06]`}
        >
          <img
            src={item.image}
            alt={`${item.name} — ${item.category}`}
            className={`h-full w-full object-cover ${objectPosition}`}
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

/**
 * Redistributes width on tap below `lg`: the active item grows to ~half the
 * row while the rest shrink evenly to make room, springing back to an even
 * split when nothing's active. Each item is sized with flex-grow against a
 * 0% basis (not a percentage basis) so the row's gap is never double-counted
 * against 100%. At `lg` and above tapping is disabled (isMobile stays
 * false, active stays null), so every item keeps the same equal growWeight
 * and the row reads as a plain even split — which for a 2-item row is
 * exactly the 50/50 the desktop Figma layout calls for.
 */
function AccordionRow({
  items,
  aspect,
  gapClass,
  objectPosition,
}: {
  items: Showcase[];
  aspect: string;
  gapClass: string;
  objectPosition?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setActive(null);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className={`flex w-full ${gapClass}`}>
      {items.map((item) => {
        const isActive = active === item.slug;
        const growWeight =
          active === null ? 1 : isActive ? 50 : 50 / (items.length - 1);
        return (
          <Strip
            key={item.slug}
            item={item}
            aspect={aspect}
            objectPosition={objectPosition}
            accordion={{
              isActive,
              growWeight,
              isMobile,
              onActivate: () => setActive(item.slug),
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * The bottom strip (Figma node `173:150`) is interactive on `lg:`: hovering
 * any card expands it into the wide slot — matching the row's own default,
 * where the first card starts wide — while the other two shrink, always
 * exactly one active at a time. Moving the mouse off the row entirely
 * reverts to that default (first card wide) rather than staying on
 * whatever was last hovered; that's the one CLAUDE.md flags as a judgment
 * call, chosen so the row always resets to a known, designed-for state
 * instead of getting stuck wherever the cursor last was.
 *
 * All three cards share the same fixed height (`heightClass`, not `aspect`)
 * so redistributing width never also changes height — a card growing to
 * the wide slot gets wider, not taller. Weights reuse the exact 2:1:1 ratio
 * (→ 50/25/25) and the same flex-grow/0%-basis + spring-transition
 * mechanism as the mobile tap accordion (AccordionRow above); this used to
 * be a static 1+2 nested-frame split matching Figma's literal DOM structure
 * pixel-for-pixel, but that structure can't redistribute across a shared
 * flex context on hover, so it's now a single flat row — the tradeoff this
 * interactivity requires.
 *
 * Below `lg`, hover doesn't apply — this instead falls back to the mobile
 * tap-to-expand behavior already established elsewhere on the page
 * (default: even three-way split, first tap expands, second tap navigates).
 */
function ThreeUpRow({ items }: { items: Showcase[] }) {
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState<string | null>(items[0].slug);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      // Desktop always has a wide card (default: the first); mobile keeps
      // its own established default of an even split until tapped.
      setActive(mobile ? null : items[0].slug);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [items]);

  return (
    <div
      className="flex w-full gap-3 lg:gap-6"
      onMouseLeave={() => {
        if (!isMobile) setActive(items[0].slug);
      }}
    >
      {items.map((item) => {
        const isActive = active === item.slug;
        const growWeight = active === null ? 1 : isActive ? 2 : 1;
        return (
          <Strip
            key={item.slug}
            item={item}
            heightClass="h-[220px] sm:h-[320px] lg:h-[480px]"
            objectPosition="object-bottom"
            accordion={{
              isActive,
              growWeight,
              isMobile,
              onActivate: () => setActive(item.slug),
              onHover: () => {
                if (!isMobile) setActive(item.slug);
              },
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        );
      })}
    </div>
  );
}

export default function CaseStudies() {
  return (
    <section
      aria-label="Case studies"
      className="flex flex-col gap-10 px-gutter py-20 lg:px-gutter-lg lg:py-28"
    >
      <Reveal group className="flex items-center justify-between gap-6">
        <h2 className="flex-1 text-[48px] leading-[1.05] tracking-[-0.02em]">
          Case studies
        </h2>
        <SquiggleArrow className="hidden text-ink sm:block" />
      </Reveal>

      <Strip item={FULL} aspect="aspect-[1200/720]" />

      <AccordionRow
        items={TWO_UP}
        aspect="aspect-[588/440]"
        gapClass="gap-3 lg:gap-6"
      />

      <AccordionRow
        items={THREE_UP}
        aspect="aspect-[588/440]"
        gapClass="gap-3 lg:gap-6"
      />
    </section>
  );
}
