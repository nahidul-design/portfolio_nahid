"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * The hero photo band's scroll parallax + ambient breathing — restored from
 * the old AboutParallax.tsx (deleted in the v3 redesign, which moved these
 * two photos from About into Hero but dropped the motion along with it).
 * Same mechanism, just retuned for the hero's wider/shorter band instead of
 * About's near-square card — with one deliberate difference from the old
 * version: only the BACKGROUND scroll-scrubs (±6% yPercent) now. The
 * subject cutout used to scrub too (±3%, reading as "floating above" the
 * background) but that's gone — see the subject-motion history below for
 * why. The background also gets a slow always-on breathing scale on its
 * own wrapper — never the <img> itself, so it can't fight the scroll-scrub
 * tween over the same `transform` property (the exact bug CLAUDE.md warns
 * about).
 *
 * The subject cutout ALSO gets an entrance (fade+scale in, once) plus its
 * own always-on idle breathing scale afterward (`objWrapRef`) — this went
 * through FOUR iterations before landing here:
 *
 *   1. No motion at all beyond the scroll-scrub → read as "dead"/static
 *      before any scrolling happened.
 *   2. Added a `y`-translate float + a `y`-rise entrance → still reported
 *      as "pre-loaded" (see #3) AND introduced a real visual bug: the
 *      subject is bottom-anchored (`bottom-0` + `object-bottom`, its feet/
 *      base meant to sit flush with the band's bottom edge), but ANY
 *      negative `y` on the wrapper lifts the whole image off that anchor,
 *      opening a gap of bare background between the subject and the band's
 *      bottom edge. "Should always stay fixed in bottom" ruled out any
 *      vertical translate on the WRAPPER.
 *   3. Switched idle motion to a `scale` breathe with `transformOrigin:
 *      "50% 100%"` (bottom-center) on the wrapper — scaling from the
 *      bottom edge means growing/shrinking only ever moves the TOP of the
 *      subject, so the wrapper's own bottom edge never leaves the band's
 *      bottom edge. Confirmed via computed geometry this closed the gap
 *      the WRAPPER could open — but the gap kept being reported anyway.
 *   4. The actual remaining cause: `objTween` below — the pre-existing
 *      scroll-scrub `yPercent` — runs on the `<img>` ITSELF, not the
 *      wrapper, so step 3's wrapper-level fix never touched it. That scrub
 *      isn't zero at rest: confirmed live, at `scrollY: 0` (page just
 *      loaded, before any scrolling) the img already carried a non-zero
 *      `translateY` from this tween, because the band sits high enough in
 *      the page that its ScrollTrigger's start/end boundaries don't put
 *      scroll-position-0 at exactly 0% progress. That's a real, independent
 *      way for the rendered pixels to drift off the wrapper's true bottom
 *      edge — at rest, not just mid-scroll — regardless of how solid the
 *      wrapper's own bottom-anchoring is. Given the explicit requirement
 *      that the subject "should always stay stuck to the bottom edge," the
 *      only way to actually guarantee that is to not put any vertical
 *      scroll motion on the subject `<img>` at all — so `objTween` and
 *      `OBJ_RANGE` are gone. The subject now sits perfectly still relative
 *      to its own wrapper at every scroll position; only the BACKGROUND
 *      still parallaxes underneath it. This trades away the "subject reads
 *      as floating above the background" depth effect an earlier pass
 *      intentionally added — that's the correct trade given the explicit
 *      "always stuck" requirement voiced twice now.
 *
 * The entrance itself was also silently finishing before it could ever be
 * SEEN: it used to fire immediately on mount, ran ~1.1s, and settled long
 * before the intro curtain (which covers the whole hero for ~2.6s) ever
 * lifted — so by the time it was uncovered it had already been sitting at
 * its resting state for over a second, reading as "pre-loaded"/no
 * animation at all even though one had genuinely played, unseen, behind
 * the curtain. Now the hidden ("from") state is applied IMMEDIATELY on
 * mount via `gsap.set`, and only the animation TO its resting state is
 * deferred to IntroLoader's own "nh-intro-reveal" event (dispatched as the
 * curtain starts lifting, ~2.4s in) — same `setXFrom` + `addXTo` split
 * lib/reveal.ts already uses for every intro-owned reveal target, and for
 * the same reason: the curtain uncovers bottom-up (floor first, per
 * Hero.tsx's own comment), and this photo band sits low enough in the
 * fold that it can be physically uncovered well before 2.4s. Setting the
 * hidden state only when the entrance itself starts (a `fromTo`, as an
 * earlier version of this fix did) would leave the subject sitting fully
 * visible under the lifting curtain, then have the entrance suddenly snap
 * it invisible and fade it back in the moment it starts — a flash, not a
 * clean arrival. Applying the "from" state at mount instead — before the
 * curtain has moved at all — means there's nothing to snap: it's already
 * hidden by the time any of the curtain could possibly expose it. Same
 * "nh-intro-reveal" coordination pattern ScrollReveals.tsx uses for every
 * other below-fold reveal, with a 4s timeout backstop in case that event
 * is ever missed, and an immediate start on routes where the intro loader
 * isn't mounted at all (i.e. `#intro-loader` isn't in the DOM).
 *
 * Both the entrance and the breathe live on a wrapper <div> around the
 * <img>, not the <img> itself, so neither can fight `objTween`'s
 * scroll-scrubbed `yPercent` over the same element's `transform` (same
 * fix pattern as the background's breathe vs. its own scroll-scrub). The
 * wrapper's `-translate-x-1/2` centering utility is also safe alongside
 * both — per Cursor.tsx's established convention, Tailwind's `translate-*`
 * utilities write the separate CSS `translate` property, while GSAP here
 * writes `transform`, so they compose instead of one overwriting the
 * other. The breathe's duration is deliberately different from the
 * background's own breathe (8s vs 5s leg) so the two motions don't fall
 * into lockstep and read as one mechanical pulse.
 */
const BG_RANGE = 6; // yPercent travel, background layer (slower)
const BG_BREATHE_SCALE = 1.06;
const BG_BREATHE_LEG = 5; // seconds one direction; yoyo+repeat ≈ 10s full cycle
const OBJ_BREATHE_SCALE = 1.045; // subtler than the background's — it's a person, not a landscape
const OBJ_BREATHE_LEG = 8; // seconds one direction; yoyo+repeat ≈ 16s full cycle

export default function HeroParallax({
  background,
  object,
}: {
  background: string;
  object: string;
}) {
  const bandRef = useRef<HTMLDivElement>(null);
  const bgWrapRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const objWrapRef = useRef<HTMLDivElement>(null);
  const objRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const band = bandRef.current;
    const bgWrap = bgWrapRef.current;
    const bg = bgRef.current;
    const objWrap = objWrapRef.current;
    const obj = objRef.current;
    if (!band || !bgWrap || !bg || !objWrap || !obj) return;

    gsap.set(objWrap, { transformOrigin: "50% 100%", opacity: 0, scale: 0.92 });

    const bgTween = gsap.fromTo(
      bg,
      { yPercent: -BG_RANGE },
      {
        yPercent: BG_RANGE,
        ease: "none",
        scrollTrigger: {
          trigger: band,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );

    const breathe = gsap.to(bgWrap, {
      scale: BG_BREATHE_SCALE,
      duration: BG_BREATHE_LEG,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    let objBreathe: gsap.core.Tween | undefined;
    let entrance: gsap.core.Tween | undefined;
    let timeout: number | undefined;

    const playEntrance = () => {
      entrance = gsap.to(objWrap, {
        opacity: 1,
        scale: 1,
        duration: 1.1,
        ease: "reveal",
        onComplete: () => {
          objBreathe = gsap.to(objWrap, {
            scale: OBJ_BREATHE_SCALE,
            duration: OBJ_BREATHE_LEG,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        },
      });
    };

    if (document.getElementById("intro-loader")) {
      window.addEventListener("nh-intro-reveal", playEntrance, { once: true });
      timeout = window.setTimeout(playEntrance, 4000);
    } else {
      playEntrance();
    }

    return () => {
      bgTween.scrollTrigger?.kill();
      bgTween.kill();
      breathe.kill();
      window.removeEventListener("nh-intro-reveal", playEntrance);
      window.clearTimeout(timeout);
      entrance?.kill();
      objBreathe?.kill();
    };
  }, []);

  return (
    // Figma's actual clipping frame ("Frame 26") is 1440×720 (2:1) at
    // desktop but 390×300 (1.3:1, noticeably SQUARER) at mobile (`79:245`)
    // — not the same ratio scaled down. An earlier pass used the flat
    // desktop 2:1 ratio at every breakpoint, which rendered the mobile band
    // at only 195px tall instead of Figma's actual 300px — exactly the
    // "height/spacing looks too low" this was reported as.
    //
    // The 1516×842 numbers on the desktop Background layer inside this are
    // an oversized bleed for scroll-parallax headroom, not this element's
    // own aspect; matching 1516:842 here (an earlier pass's mistake) skewed
    // every percentage-based position inside the band, including the two
    // labels Hero.tsx overlays on top of it.
    <div
      ref={bandRef}
      className="relative aspect-[390/300] w-full overflow-hidden lg:aspect-[1440/720]"
    >
      {/* `-inset-px` (1px overscan past the band's own edge on all four
          sides), not the plain `inset-0` an earlier pass used — reported
          as a ~2px sliver of bare page background visible at the very
          bottom of the band on some mobile widths. The band's own
          `aspect-[390/300]` computes a FRACTIONAL pixel height at real
          device widths (390 is Figma's canvas width, not every phone's
          actual viewport width), and this wrapper also carries its own
          `scale` breathing transform — a transformed child inside an
          `overflow-hidden` parent can round its edges to a different
          sub-pixel than the parent's own clip rect, which is exactly the
          kind of hairline seam this produces. There's no way to compute a
          "correct" fractional value that fixes it for every possible
          width, so this just guarantees a permanent small overscan buffer
          instead — cheap insurance, invisible at any zoom level anyone
          would actually use. */}
      <div ref={bgWrapRef} className="absolute -inset-px">
        <img
          ref={bgRef}
          src={background}
          alt=""
          aria-hidden
          className="absolute left-[-2.64%] h-[116.9%] w-[105.3%] max-w-none object-cover will-change-transform"
          style={{ top: "-11.4%" }}
        />
        {/* Figma's own gradient on this layer is literally "from white to
            20%-white, top to bottom" (verified via get_design_context) — an
            earlier pass had this backwards (transparent top fading to white
            at the bottom), which is exactly why the top edge, where this
            band meets the nav/hero text, never blended into the page's white
            background. This percentage is identical at mobile and desktop
            (verified against both frames independently), unlike the band's
            own aspect ratio above — don't assume the two always move
            together. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-page to-page/20"
        />
      </div>

      {/* Object (subject cutout)'s BASE proportions are 92% of the band's
          height at mobile (`79:248`: 276/300) vs. 80.3% at desktop — a
          real proportion difference, not a rendering side-effect of the
          band's own aspect change above. Sizing/positioning lives on this
          wrapper now (the entrance/breathe target, transform-origin
          pinned to its own bottom edge — see the file-level comment above
          for why); the <img> inside just fills it and keeps the
          scroll-scrubbed yPercent tween.

          Both breakpoints get nudged 2px further down — `bottom-[-2px]`
          instead of `bottom-0`, i.e. 2px BELOW the band's true bottom
          edge, not 2px of extra gap above it. That overflow is caught for
          free by `overflow-hidden` on the band (`bandRef` below), which
          was already there for the background/parallax layers.

          The 10% size-up (92 → 101.2%) is MOBILE ONLY, per direct
          correction — an earlier pass applied it to desktop too (assuming
          the same "reads lifted" complaint meant the same fix), but
          desktop only ever needed the 2px nudge; its base 80.3% proportion
          was correct as-is and stays untouched. */}
      <div
        ref={objWrapRef}
        className="absolute bottom-[-2px] left-1/2 h-[101.2%] w-auto -translate-x-1/2 lg:h-[80.3%]"
      >
        <img
          ref={objRef}
          src={object}
          alt="Nahidul Islam"
          className="h-full w-auto object-contain object-bottom will-change-transform"
        />
      </div>
    </div>
  );
}
