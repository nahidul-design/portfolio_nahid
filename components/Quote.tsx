import QuoteBackground from "./QuoteBackground";
import Reveal from "./Reveal";

/**
 * v3 Quote (Figma `32:258`) — was a plain full-width text block; now a
 * self-contained dark img-radius (32px) card with the Steve Jobs portrait
 * blended into the ink background via mix-blend-overlay, matching the same
 * big-radius "card" language as the project grid. Same quote text; the
 * "— Steve Jobs" attribution was dropped in a later pass — see the comment
 * further down for why. The background carries its own slow ambient
 * breathing scale — see QuoteBackground.tsx.
 *
 * Card aspect ratio is fixed but responsive — 358:220 at mobile, 1376:560
 * at desktop (Figma `32:258` desktop / `79:414` mobile; the mobile card is
 * NOT the same ratio scaled down, it's genuinely squarer) — content is
 * centered inside via flex rather than padding the card open, so trimming
 * the quote/attribution copy (as happened in an earlier pass) can no longer
 * shrink the card itself. Radius drops to 16px at mobile too (`79:414`'s
 * `rounded-[16px]`, not the sitewide 32px `img-radius`), same as
 * ProjectsGrid's cards — set directly rather than through that utility for
 * the same reason.
 *
 * No top/bottom padding of its own — like every other section, the gap to
 * its neighbours comes from `<main>`'s own gap-40 in app/page.tsx, not from
 * py-* here (this used to carry py-10/py-20, which made its gap to Contact
 * differ from the flat 160px used everywhere else).
 */
export default function Quote() {
  return (
    <section className="page-container px-gutter lg:px-gutter-lg">
      <div className="relative flex aspect-[358/220] items-center justify-center overflow-hidden rounded-2xl bg-ink lg:aspect-[1376/560] lg:rounded-[32px]">
        <QuoteBackground src="/quote/steve-jobs.png" />

        {/* No eyebrow tag here anymore — Figma dropped "quote I like"
            entirely, not just its icon like the other chips earlier. No
            attribution either now — the "— Steve Jobs" figcaption this used
            to carry is GONE per a fresh Figma pull (`32:258`'s attribution
            text node, `109:633`, is explicitly `hidden`), matching the
            screenshot this was requested from directly (just the quote,
            centered, nothing below it). Mobile's own frame (`79:416`)
            still technically has that text node un-hidden, but per this
            project's repeated pattern that mobile mockups lag behind
            desktop edits (see e.g. ProjectsGrid's "Show more" note), that
            reads as the mobile mockup not having caught up yet rather than
            a deliberate "show it on mobile only" choice — dropped on both
            breakpoints for consistency. Down to one reveal target, so a
            plain Reveal replaces the old Reveal-group pairing it with the
            eyebrow.

            Quote width is 600px at desktop now (was 720px) — Figma's own
            content frame (`109:631`) is a flat `w-[600px]`, not a scaled
            derivative of the old value. Quote text is 24px flat at mobile
            (`79:416`), not a scaled-down 40px — a real size step, not just
            a smaller viewport rendering the same clamp. Line-height splits
            by breakpoint for the same reason: the site-wide rule is 135%
            for any 20px/24px text, but that would over-loosen the desktop
            40px size, which keeps its own 1.2. */}
        <figure className="relative flex flex-col items-center gap-5 px-gutter text-center lg:gap-8">
          <Reveal>
            <blockquote className="max-w-[600px] text-2xl leading-[1.35] tracking-display text-white lg:text-[40px] lg:leading-[1.2]">
              <span className="text-white/60">
                &ldquo;Design is not just what it looks like and feels like.
              </span>{" "}
              <span>Design is how it works&rdquo;</span>
            </blockquote>
          </Reveal>
        </figure>
      </div>
    </section>
  );
}
