import EyebrowTag from "./EyebrowTag";
import HeroParallax from "./HeroParallax";
import Reveal from "./Reveal";
import SmoothAnchor from "./SmoothAnchor";

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

/**
 * v3 hero (Figma `32:111` + `32:5`) — replaces the old left-aligned two-tone
 * serif headline + draggable image carousel with a centered Manrope
 * headline and a single static photo band.
 *
 * The photo band is a genuine full-bleed element (Figma's own "Background"
 * layer is 1516px wide — wider than the 1440 canvas, i.e. it bleeds past
 * both edges) so it sits OUTSIDE the section's gutter padding, same
 * treatment as the case-study cover image. It reuses the exact photos from
 * the old About parallax (public/about/parallax-*.png) — same background +
 * cutout pairing, just relocated from About into the hero — and its scroll
 * parallax + ambient breathing move with it, in HeroParallax.tsx.
 *
 * HeroParallax is deliberately NOT a `data-reveal-image` target: it runs its
 * own scroll-scrubbed `transform` (yPercent) on the same <img> the reveal
 * system would animate `scale` on — two GSAP tweens fighting over one
 * element's `transform` is the exact contention bug CLAUDE.md warns about
 * (the old About parallax card had the same rule, for the same reason).
 */
export default function Hero() {
  return (
    // A real wrapping element, not a bare fragment: this whole component
    // must count as ONE flex child of <main>'s section-spacing gap (see
    // app/page.tsx) — its section and its photo band are two internal
    // siblings with their own intentional negative-margin overlap, and a
    // fragment would expose both as separate gap-40 targets instead.
    <div>
      {/* No bottom padding here — Figma's intro frame ends exactly at the
          button's own bottom edge (frame height matches its content height
          precisely), and the two labels below are anchored to THIS
          section's bottom edge via top-full. A prior pass had pb-4/pb-6
          here, which pushed that anchor point past the button and was
          exactly why "(UI/UX) design" stayed misaligned even after its
          position math was fixed — the math was right, the anchor wasn't.
          Gaps are 24px (text-block → button) and 12px (eyebrow → heading)
          at mobile — Figma `79:258`/`79:259` — vs. 32/16 at desktop; the
          heading's own clamp already bottoms out at exactly Figma mobile's
          flat 32px, so only the gaps needed a responsive split. */}
      <section
        id="intro"
        className="page-container relative z-10 flex flex-col items-center gap-6 px-gutter pt-16 text-center lg:gap-8 lg:px-gutter-lg lg:pt-20"
      >
        <Reveal group className="flex flex-col items-center gap-3 lg:gap-4">
          <EyebrowTag>intro</EyebrowTag>
          <h1 className="max-w-[720px] text-[clamp(2rem,5vw,3rem)] leading-[1.2] text-ink">
            Hi, I am Nahidul Islam - I design products that make complicated
            things feel obvious.
          </h1>
        </Reveal>

        <Reveal>
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

        {/* Both labels' `top` values are measured from THIS section's
            bottom edge (top: 100% below, i.e. offset 0 = the button's
            bottom edge; negative = up into the text column, positive =
            down into the photo).
              - "since 2021": Figma has it sitting 38px ABOVE that boundary
                (`top: "-38px"`) — matches the design as pulled, barely
                grazing the photo's top edge, and reads fine there.
              - "(UI / UX) design": Figma's own number instead places its
                160px-tall rotated bbox starting AT the boundary and running
                DOWN into the photo (center 80px below it) — reproduced
                faithfully in an earlier pass, then reported as reading too
                low, buried in the image instead of next to the actual
                content. This is a deliberate, sighted departure from that
                literal value: `top: "-146px"` instead centers the label
                against the full intro column's own height (headline block +
                button, 292px tall per Figma's `32:111` "Frame 29" — half of
                that is 146px above the boundary), so it now runs alongside
                the headline/button instead of down into the photo.
            Each <p> is placed with `top` at its own center offset, then
            `-translate-y-1/2` centers it there (shifting up by half of its
            OWN — small, ~14px — line height, not the rotated element's
            160px footprint, since translate% is computed pre-rotation
            against the element's own box). z-index is inherited from the
            section itself (z-10 above), not set here — that's what actually
            fixes both these labels AND the button rendering behind the
            photo; putting z-index only on this overlay div, as an earlier
            pass did, left the button itself still uncovered underneath. */}
        <div className="pointer-events-none absolute top-full left-0 hidden w-full lg:block">
          <div className="page-container relative px-gutter lg:px-gutter-lg">
            <p
              style={{ top: "-146px" }}
              className="absolute left-0 -translate-y-1/2 -rotate-90 font-mono text-[14px] leading-none whitespace-nowrap text-ink uppercase"
            >
              (UI / UX) design
            </p>
            <p
              style={{ top: "-38px" }}
              className="absolute right-0 -translate-y-1/2 font-mono text-[14px] leading-none text-ink uppercase"
            >
              since ○ 2021
            </p>
          </div>
        </div>
      </section>

      {/* Figma's photo genuinely overlaps UP into the intro section by 48px
          at the 1440 canvas scale (the button's bottom edge and the photo's
          top edge are only 48px apart, not stacked flush) — this isn't a
          gap to close, it's an intentional overlap. -mt-12 (48px) at lg
          reproduces it. Mobile (`79:245`/`79:258`, freshly re-pulled) is
          NOT the same treatment scaled down — the button's bottom and the
          photo's top are a genuine +32px GAP there, not an overlap at all.
          An earlier pass used a smaller negative margin on mobile too
          (assuming the same overlap, just softened), which read as things
          crowding together instead of the breathing room Figma actually
          wants at that breakpoint. */}
      <div className="relative z-0 mt-8 lg:-mt-12">
        <HeroParallax
          background="/about/parallax-bg.png"
          object="/about/parallax-obj.png"
        />
      </div>
    </div>
  );
}
