"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import type { ProjectCard } from "@/lib/projects";
import { withBasePath } from "@/lib/assets";

export interface GalleryBatch {
  label: string;
  projects: ProjectCard[];
}

/**
 * Arc geometry — an upward hump (∩ / rainbow), per the design reference: the
 * centre card peaks and the cards step down symmetrically toward both edges.
 *
 * Offsets are explicit rather than derived. The reference curve is flatter
 * through the middle than a parabola: a true t² would drop the inner pair to
 * ~22px, but the reference sits them at 40px. So these come from the design,
 * not a formula.
 *
 * Tilt follows the tangent of that hump — left-of-centre cards lean
 * counter-clockwise (top toward the left edge), right-of-centre lean clockwise,
 * centre upright. Offsets and tilt MUST describe the same curve: hump offsets
 * under a valley's tangent (or the reverse) is exactly what makes the row read
 * as the wrong shape, even when each half is individually correct.
 *
 * The vertical stagger is applied as margin-top rather than transform for two
 * reasons: three animations already own `y` on this card (entrance, idle float,
 * hover lift), and margin lets the row's box grow to fit, so the dropped outer
 * cards can't be clipped by the mobile scroll container.
 */
const OFFSET = [90, 40, 0, 40, 90]; // px below the peak — larger sits lower
const TILT = [-8, -4, 0, 4, 8]; // deg — negative = counter-clockwise

// Desynchronised so the row never drifts in lockstep.
const FLOAT_AMP = [10, 13, 11, 14, 12];
const FLOAT_DURATION = [7.2, 8.4, 6.8, 9, 7.8];
const FLOAT_DELAY = [0, 0.6, 1.2, 0.3, 0.9];

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

/** Soft and damped — settles without overshooting into bounce. */
const SPRING = { type: "spring", stiffness: 200, damping: 28, mass: 0.8 } as const;
const PARALLAX_SPRING = { stiffness: 150, damping: 20, mass: 0.6 };
const PARALLAX_DEG = 7; // mild — the card leans toward the cursor, no more

const REST_SHADOW = "0 14px 34px -20px rgba(20, 20, 15, 0.35)";
const HOVER_SHADOW = "0 50px 90px -28px rgba(20, 20, 15, 0.42)";

const rowVariants = (reduce: boolean): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: reduce ? 0 : 0.09,
      delayChildren: reduce ? 0 : 0.04,
    },
  },
  // Exit is a flat, fast fade on the row itself — no stagger, no movement.
  // The incoming batch runs its staggered intro over the top of this.
  exit: { opacity: 0, transition: { duration: 0.15, ease: EASE } },
});

/** No `exit` key by design: the row fades as one, children don't animate out. */
const cardVariants = (reduce: boolean): Variants =>
  reduce
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.2 } },
      }
    : {
        hidden: { opacity: 0, y: 32, scale: 0.95 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 130, damping: 18, mass: 0.9 },
        },
      };

function GalleryCard({
  project,
  index,
  isHovered,
  isDimmed,
  reduce,
  onEnter,
}: {
  project: ProjectCard;
  index: number;
  isHovered: boolean;
  isDimmed: boolean;
  reduce: boolean;
  onEnter: () => void;
}) {
  // Cursor position within the card, -0.5 → 0.5 on each axis.
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // Card leans toward the cursor: the edge under the pointer comes forward.
  const rotateX = useSpring(
    useTransform(py, [-0.5, 0.5], [-PARALLAX_DEG, PARALLAX_DEG]),
    PARALLAX_SPRING,
  );
  const rotateY = useSpring(
    useTransform(px, [-0.5, 0.5], [PARALLAX_DEG, -PARALLAX_DEG]),
    PARALLAX_SPRING,
  );

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const resetParallax = () => {
    px.set(0);
    py.set(0);
  };

  return (
    // Owns entrance only.
    <motion.div
      variants={cardVariants(reduce)}
      className="w-[240px] shrink-0 snap-center sm:w-[260px] lg:w-auto lg:max-w-[212px] lg:flex-1 lg:shrink"
      style={{ marginTop: OFFSET[index] }}
    >
      {/* Owns the idle float only. Pauses while hovered so the lift reads clean. */}
      <motion.div
        animate={reduce || isHovered ? { y: 0 } : { y: [0, -FLOAT_AMP[index], 0] }}
        transition={
          reduce
            ? { duration: 0 }
            : isHovered
              ? SPRING
              : {
                  duration: FLOAT_DURATION[index],
                  delay: FLOAT_DELAY[index],
                  repeat: Infinity,
                  ease: "easeInOut",
                }
        }
      >
        <Link
          href={`/work/${project.slug}`}
          className="block no-underline"
          onMouseEnter={onEnter}
          onMouseMove={handleMove}
          onMouseLeave={resetParallax}
          onFocus={onEnter}
          onBlur={resetParallax}
        >
          {/* Owns cursor parallax only. */}
          <motion.div
            style={
              reduce ? undefined : { transformPerspective: 900, rotateX, rotateY }
            }
          >
            {/* Owns hover lift, straighten, recede, shadow. */}
            <motion.div
              animate={{
                rotate: reduce ? 0 : isHovered ? 0 : TILT[index],
                y: reduce ? 0 : isHovered ? -14 : 0,
                scale: reduce ? 1 : isHovered ? 1.06 : isDimmed ? 0.97 : 1,
                opacity: isDimmed ? 0.5 : 1,
                boxShadow: isHovered ? HOVER_SHADOW : REST_SHADOW,
              }}
              transition={reduce ? { duration: 0.2 } : SPRING}
              className="overflow-hidden rounded-lg border border-line bg-surface"
            >
              {/* Title/subtitle live inside the artwork, bottom-left. */}
              <img
                src={withBasePath(project.coverImage)}
                alt={project.title}
                className="aspect-[3/4] w-full object-cover"
              />
            </motion.div>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function WorkGallery({ batches }: { batches: GalleryBatch[] }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const reduce = useReducedMotion() ?? false;

  const cards = batches[active]?.projects ?? [];

  return (
    <div>
      {/* `relative` anchors the outgoing row once popLayout lifts it out of flow. */}
      <div className="relative -mx-gutter snap-x snap-mandatory overflow-x-auto px-gutter pt-4 pb-14 [scrollbar-width:none] sm:-mx-gutter-lg sm:px-gutter-lg lg:mx-0 lg:overflow-x-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
        {/* popLayout pops the exiting row out of layout, so the incoming batch
            takes its place immediately and the two overlap instead of queueing. */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={active}
            data-gallery-row
            variants={rowVariants(reduce)}
            initial="hidden"
            animate="show"
            exit="exit"
            onMouseLeave={() => setHovered(null)}
            className="flex items-start gap-5 lg:justify-center"
          >
            {cards.map((project, i) => (
              <GalleryCard
                key={project.slug}
                project={project}
                index={i}
                isHovered={hovered === i}
                isDimmed={hovered !== null && hovered !== i}
                reduce={reduce}
                onEnter={() => setHovered(i)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex flex-col gap-10 sm:mt-2 sm:flex-row sm:items-end sm:justify-between sm:gap-16">
        {/* Batch pager */}
        <div className="flex shrink-0 items-start gap-4 sm:gap-6">
          {batches.map((batch, i) => {
            const isActive = i === active;
            return (
              <button
                key={batch.label}
                type="button"
                onClick={() => {
                  setActive(i);
                  setHovered(null);
                }}
                aria-current={isActive ? "true" : undefined}
                className="group w-28 text-center sm:w-32"
              >
                {/* Numeral and label are one unit: same size, same style. */}
                <span
                  className={`block text-sm tracking-ui transition-colors duration-[var(--motion-slow)] ease-editorial ${
                    isActive ? "text-ink" : "text-faint group-hover:text-muted"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")} {batch.label}
                </span>

                <span
                  className={`mt-3 block h-px w-full transition-colors duration-[var(--motion-slow)] ease-editorial ${
                    isActive ? "bg-ink" : "bg-line group-hover:bg-faint"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Intro copy — tighter leading than body default by design. */}
        <p className="max-w-sm text-base leading-[1.22] tracking-ui text-ink-soft text-pretty">
          Selected work across dashboards, landing pages, and mobile products —
          each one built to make a complicated thing feel obvious. Page through
          the sets below, or open a project to read how it came together.
        </p>
      </div>
    </div>
  );
}
