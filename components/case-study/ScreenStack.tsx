import { Fragment } from "react";
import Reveal from "../Reveal";
import { withBasePath } from "@/lib/assets";
import type { ProjectScreen } from "@/lib/projects";

/**
 * The project's screen images, rendered as one flowing column (Figma
 * `77:2` node `77:89` / `77:126` node `77:213`).
 *
 * Figma frames this as two different "types" — a single tall website
 * screenshot vs. several stacked app screens — but they're really the same
 * shape underneath: N images, each optionally captioned. This component
 * doesn't take a layout/type prop at all; it infers which look a project
 * gets purely from `screens.length` (see lib/projects.ts's comment on why
 * there's no separate field for it). 1 image reads as the "website"
 * variant automatically; 2+ reads as "multiple image", with identical
 * markup either way — the only thing that actually changes is how many
 * times this list has an entry.
 *
 * Every image is `h-auto` at its own natural aspect ratio — NOT Figma's
 * fixed 682px (multiple) / 2289px (website) mockup heights. Real
 * screenshots vary in proportions and forcing either fixed number would
 * crop or distort whichever ones don't match it. This is also what makes
 * the page's total height genuinely responsive to content rather than
 * just to viewport width — a project with one short screenshot and one
 * with five long ones produce entirely different page heights, on purpose.
 *
 * Gap is 24px at mobile (`81:489`'s `gap-[24px]`) vs. 48px at desktop
 * (`77:89`) — a real per-breakpoint difference, not a smaller viewport
 * rendering the same value. Image radius is 16px at mobile vs. the
 * sitewide 32px `img-radius` at desktop — set directly here (like
 * ProjectsGrid's and Quote's cards) rather than through that utility,
 * since it isn't uniform across breakpoints. Caption text is 20px mobile /
 * 24px desktop, both at 135% line-height per the site-wide rule for
 * 20px/24px text (replacing the old fluid clamp, which under-shot to 16px
 * at mobile widths instead of Figma's flat 20px).
 *
 * Only the first (`i === 0`, the lead/cover image, sitting right at the top
 * of this page) loads eager; every screen after it is `loading="lazy"` —
 * same reasoning as ProjectsGrid's cards: no next/image pipeline here, so
 * an eager, synchronously-decoded multi-megabyte screenshot the visitor
 * hasn't scrolled to yet is pure wasted main-thread work up front.
 */
export default function ScreenStack({
  screens,
  title,
}: {
  screens: ProjectScreen[];
  title: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 lg:gap-12">
      {screens.map((screen, i) => (
        <Fragment key={screen.image}>
          <Reveal
            image
            className="w-full overflow-hidden rounded-2xl lg:rounded-[32px]"
          >
            <img
              src={withBasePath(screen.image)}
              alt={
                screen.caption
                  ? `${title} — ${screen.caption}`
                  : `${title} — screen ${i + 1}`
              }
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className="h-auto w-full object-cover"
            />
          </Reveal>

          {screen.caption && (
            <Reveal
              as="p"
              className="text-xl leading-[1.35] tracking-display text-ink text-justify lg:text-2xl"
            >
              {screen.caption}
            </Reveal>
          )}
        </Fragment>
      ))}
    </div>
  );
}
