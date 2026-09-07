import EyebrowTag from "./EyebrowTag";
import Reveal from "./Reveal";

/**
 * v3 About (Figma `32:122` desktop / `79:267` mobile) — replaces the old
 * side-by-side bio/parallax-photo layout entirely (AboutParallax.tsx is
 * gone; its two photos moved into Hero instead). Shape: the same
 * label-left/content-right row already established by Résumé, a Manrope
 * bio paragraph with its opening sentence dimmed. The partner-logo
 * marquee this section carried before is gone too — Figma dropped it (the
 * "About col" frame now holds nothing but the bio text), not replaced by
 * anything else here.
 *
 * Mobile gap is 12px (Figma `79:267`'s own `gap-[12px]`), not the 32px
 * this used flat before switching to the side-by-side row at `sm` — the
 * stacked mobile state needed its own, much tighter value. Bio text floor
 * is 24px flat on mobile (`79:272`), so the responsive clamp's minimum
 * moved from 1.375rem (22px) up to 1.5rem to actually hit that.
 */
export default function About() {
  return (
    <section
      id="about"
      aria-label="About"
      className="page-container flex flex-col items-start gap-3 px-gutter sm:flex-row sm:gap-8 lg:px-gutter-lg"
    >
      <Reveal as="div" className="w-full shrink-0 sm:w-[180px] lg:w-[280px]">
        <EyebrowTag>About me</EyebrowTag>
      </Reveal>

      <Reveal
        as="p"
        className="min-w-0 flex-1 text-[clamp(1.5rem,3.2vw,2.25rem)] leading-[1.35] tracking-display text-justify text-ink"
      >
        <span className="text-ink-muted">
          New idea or existing product, I try to make things simpler than I
          found them.
        </span>{" "}
        {
          "I've spent more than 5 years designing dashboards, web, and mobile & to me the best part of the job is the moment something finally clicks for the person using it."
        }
      </Reveal>
    </section>
  );
}
