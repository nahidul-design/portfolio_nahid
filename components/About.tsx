import Reveal from "./Reveal";

/**
 * About — two columns (Figma 96:155): bio statement, hairline, tools line on
 * the left; portrait on the right.
 *
 * The bio is Instrument Serif but sentence case, so it can't be an h2 (the
 * base layer uppercases headings). Its tracking is -1% at 40px, not the -2%
 * the 96px hero headline uses — display tracking loosens as size drops.
 */
export default function About() {
  return (
    <section
      aria-label="About"
      className="px-gutter py-20 lg:px-gutter-lg lg:py-28"
    >
      <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-6">
        <div className="flex flex-1 flex-col items-start gap-6">
          <Reveal
            as="p"
            className="font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.1] tracking-[-0.01em]"
          >
            <span className="text-ink">
              Product designer in Dhaka with an{" "}
            </span>
            <span className="text-ink-muted">
              engineering degree. I design complex software that people
              understand on the first try, and hand off specs that actually get
              built.
            </span>
          </Reveal>

          <Reveal as="hr" className="w-full border-0 border-t border-line" />

          <Reveal
            as="p"
            className="text-base tracking-normal text-ink uppercase"
          >
            figma • Framer • vibe code
          </Reveal>
        </div>

        <Reveal
          image
          className="relative w-full flex-1 overflow-hidden lg:h-[680px]"
        >
          {/* No transform utility on the <img> — the reveal animates its
              scale, and a class-set scale would be overwritten mid-tween and
              snap back on clearProps. Crop via object-position instead. */}
          <img
            src="/about/portrait.png"
            alt="Nahidul Islam"
            className="h-full w-full object-cover object-top"
          />
        </Reveal>
      </div>
    </section>
  );
}
