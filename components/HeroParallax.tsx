"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * The hero photo band's scroll parallax + ambient breathing — restored from
 * the old AboutParallax.tsx (deleted in the v3 redesign, which moved these
 * two photos from About into Hero but dropped the motion along with it).
 * Same mechanism, just retuned for the hero's wider/shorter band instead of
 * About's near-square card: background scrubs slower (±6% yPercent) than
 * the subject cutout (±3%), so the subject reads as floating above it, plus
 * a slow always-on breathing scale on the background's own wrapper — never
 * the <img> itself, so it can't fight the scroll-scrub tween over the same
 * `transform` property (the exact bug CLAUDE.md warns about).
 *
 * The subject cutout ALSO gets an entrance (fade+scale in, once) plus its
 * own always-on idle breathing scale afterward (`objWrapRef`) — this went
 * through three iterations before landing here:
 *
 *   1. No motion at all beyond the scroll-scrub → read as "dead"/static
 *      before any scrolling happened.
 *   2. Added a `y`-translate float + a `y`-rise entrance → still reported
 *      as "pre-loaded" (see #3) AND introduced a real visual bug: the
 *      subject is bottom-anchored (`bottom-0` + `object-bottom`, its feet/
 *      base meant to sit flush with the band's bottom edge), but ANY
 *      negative `y` on the wrapper lifts the whole image off that anchor,
 *      opening a gap of bare background between the subject and the band's
 *      bottom edge — worse, the float never rests at `y:0`, so the subject
 *      almost never actually sat flush with the ground it's supposed to
 *      stand on. "Should always stay fixed in bottom" ruled out any
 *      vertical translate entirely.
 *   3. This version: idle motion is a `scale` breathe instead of a `y`
 *      float, with `transformOrigin: "50% 100%"` (bottom-center) — scaling
 *      from the BOTTOM edge means growing/shrinking only ever moves the
 *      TOP of the subject; the bottom edge never leaves the band's bottom
 *      edge, so there's no gap to open, ever. The entrance uses the same
 *      bottom-anchored scale (0.92→1) + opacity, no `y` component either.
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
const OBJ_RANGE = 3; // faster — reads as floating above the background
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

    const objTween = gsap.fromTo(
      obj,
      { yPercent: -OBJ_RANGE },
      {
        yPercent: OBJ_RANGE,
        ease: "none",
        scrollTrigger: {
          trigger: band,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );

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
      objTween.scrollTrigger?.kill();
      objTween.kill();
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
      <div ref={bgWrapRef} className="absolute inset-0 h-full w-full">
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

      {/* Object (subject cutout) is 92% of the band's height at mobile
          (`79:248`: 276/300) vs. 80.3% at desktop — a real proportion
          difference, not a rendering side-effect of the band's own aspect
          change above. Both stay bottom-anchored via `object-bottom` +
          `bottom-0`, so only the height percentage needs the split.
          Sizing/positioning lives on this wrapper now (the entrance/breathe
          target, transform-origin pinned to its own bottom edge — see the
          file-level comment above for why); the <img> inside just fills it
          and keeps the scroll-scrubbed yPercent tween. */}
      <div
        ref={objWrapRef}
        className="absolute bottom-0 left-1/2 h-[92%] w-auto -translate-x-1/2 lg:h-[80.3%]"
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
