import AboutParallax from "./AboutParallax";
import Reveal from "./Reveal";

/**
 * About (Figma node `173:276`) — full-bleed parallax card; see
 * AboutParallax for the layer/animation breakdown. The section carries no
 * horizontal padding — the background image bleeds nearly edge-to-edge in
 * Figma, so this is full-bleed like UIPicker, not gutter-padded like the
 * text-only sections. Only vertical page rhythm lives here.
 *
 * Below `lg`, the eyebrow+bio render as a plain stacked block above the
 * card (own px-gutter) instead of overlaid on it — see AboutParallax's
 * comment for why the overlay treatment is lg:-only.
 */
export default function About() {
  return (
    <section aria-label="About" className="flex flex-col gap-8 py-20 lg:py-28">
      <Reveal
        group
        className="flex flex-col items-center gap-6 px-gutter text-center lg:hidden"
      >
        <p className="text-base tracking-normal text-ink uppercase">About me</p>
        <p className="font-display text-[clamp(1.5rem,5vw,2rem)] leading-[1.15] tracking-[-0.01em]">
          <span className="text-ink">Product designer based in Dhaka</span>
          <span className="text-ink-muted">
            . I design complex software that people understand on the first
            try, and hand off specs that actually get built.
          </span>
        </p>
      </Reveal>

      <AboutParallax
        background="/about/parallax-bg.png"
        object="/about/parallax-obj.png"
        eyebrow="About me"
        bio="Product designer based in Bangladesh"
        bioMuted=". I design complex software that people understand on the first try, and hand off specs that actually get built."
      />
    </section>
  );
}
