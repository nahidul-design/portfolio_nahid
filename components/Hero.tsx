import ContactLink from "./ContactLink";
import HeroCarousel from "./HeroCarousel";

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

export default function Hero() {
  return (
    <>
      <section className="px-gutter py-12 lg:px-gutter-lg lg:py-20">
        <div className="flex flex-col gap-8 lg:gap-12">
          {/* Anchors the idea block to the headline's top-right on desktop. */}
          <div className="relative">
            {/* Two-tone: the middle line carries full ink, the outer two are
                dimmed, so the eye lands on "complicated things" first. */}
            {/* Per-word targets for the intro's liquid reveal (rise + blur +
                skew settle, [data-hero-word]). Words are visible by default —
                the loader hides them only while it runs, so reduced-motion
                visits render normally. No overflow masks here: the elastic
                overshoot and blur must not get clipped. */}
            <h1 className="text-[clamp(2.5rem,6.8vw,6rem)] leading-[1.05]">
              {(
                [
                  { words: ["Making"], dim: true },
                  { words: ["complicated", "things"], dim: false },
                  { words: ["feel", "obvious."], dim: true },
                ] as const
              ).map(({ words, dim }) => (
                <span
                  key={words.join(" ")}
                  className={`block ${dim ? "text-ink-dim" : "text-ink"}`}
                >
                  {words.map((word, i) => (
                    // The leading space text node keeps words separated —
                    // adjacent inline-blocks would otherwise run together.
                    <span key={word}>
                      {i > 0 && " "}
                      <span
                        data-hero-word
                        className="inline-block will-change-[transform,filter]"
                      >
                        {word}
                      </span>
                    </span>
                  ))}
                </span>
              ))}
            </h1>

            <div
              data-reveal-group
              className="mt-10 lg:absolute lg:top-0 lg:right-0 lg:mt-0 lg:w-[231px]"
            >
              <p className="text-2xl tracking-body text-ink-muted">
                Got something <span className="text-ink">complex</span>
                <br />
                to untangle?
              </p>

              {/* The reveal animates this plain wrapper, never the pill
                  itself: btn-liquid transitions opacity/transform for hover,
                  and GSAP writing the same properties inline on the same
                  element makes the CSS transition fight every frame — the
                  button rendered stuck in a washed-out mid-state. */}
              <div className="mt-4">
                <ContactLink className="btn-liquid inline-flex items-center gap-2 rounded-full bg-ink px-6 py-4 text-base tracking-normal text-page uppercase hover:opacity-85">
                  Let&rsquo;s Discuss
                  <div className="-rotate-90 flex-none">
                    <ArrowDown />
                  </div>
                </ContactLink>
              </div>
            </div>
          </div>

          {/* Uppercase UI labels: no negative tracking, Medium for the
              emphasised half of each pair. */}
          <div
            data-reveal-group
            className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <p className="text-base font-medium tracking-normal text-ink uppercase sm:flex-1">
              Product Designer
            </p>

            <p className="text-base tracking-normal text-ink-muted uppercase sm:flex-1 sm:text-center">
              <span className="font-medium text-ink">5+ years</span> of
              experience
            </p>

            <div className="flex items-center gap-2 sm:flex-1 sm:justify-end">
              <span className="size-2 shrink-0 rounded-full bg-available" />
              <p className="text-base tracking-normal whitespace-nowrap text-ink-muted uppercase">
                <span className="font-medium text-ink">Available</span> for work
              </p>
            </div>
          </div>
        </div>
      </section>

      <HeroCarousel />
    </>
  );
}
