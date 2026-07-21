"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import Reveal from "./Reveal";

/**
 * About (Figma node `173:276`, "Frame 26") — re-pulled after the Figma file
 * changed to a full-bleed layout: a rounded 1200-wide card with the
 * Background photo filling it (oversized for parallax travel, plus a
 * white-to-transparent scrim so the overlaid text stays legible against the
 * sky) and the Object (subject cutout) bottom-anchored and horizontally
 * centered within it, both scrubbed at different rates on scroll so the
 * subject reads as floating above the background. The "About me" eyebrow +
 * two-tone bio sit centered on top, pinned to the card's top edge. This
 * replaced an earlier side-by-side bio-left/portrait-right layout that no
 * longer matches the file.
 *
 * The card is intentionally NOT a `data-reveal-image` target — like
 * UIPickerBackground, it's atmospheric chrome behind centered copy, not
 * content of its own; only the text gets the standard reveal. Two GSAP
 * tweens run on the background layer (scroll-scrub translate + an always-on
 * ambient breathe) — they target different elements (the <img> vs its
 * wrapper) specifically so they never fight over the same `transform`
 * property, the same contention class of bug that briefly broke this
 * component's first version of the breathing effect.
 *
 * The overlaid eyebrow+bio text only renders here at `lg:` and up
 * (`hidden lg:flex`) — the Figma spec is a fixed 1440×800 canvas with the
 * subject's head sitting well clear of the text; scaling that same overlay
 * down to mobile widths does not scale proportionally (the ~150-character
 * bio wraps to far more lines at narrow widths than the shrunken top
 * clear-zone has room for), so it collides with the subject's face. Below
 * `lg`, About.tsx renders the same copy as a plain stacked block above this
 * card instead — no overlay, no collision risk, since the two are no
 * longer sharing the same space.
 */
const BG_RANGE = 6; // yPercent travel, background layer (slower)
// Smaller than the background's range on purpose: the object is a tightly
// fit cutout box sitting just below the overlaid text (only ~45px of
// natural clearance in the Figma spec), so its full scroll-parallax
// excursion has to stay inside that gap rather than reusing a generic value.
const OBJ_RANGE = 2;
const BREATHE_SCALE = 1.06;
const BREATHE_LEG = 5; // seconds one direction; yoyo+repeat ≈ 10s full cycle

export default function AboutParallax({
  background,
  object,
  eyebrow,
  bio,
  bioMuted,
}: {
  background: string;
  object: string;
  eyebrow: string;
  bio: string;
  bioMuted: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const bgWrapRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const objRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const card = cardRef.current;
    const bgWrap = bgWrapRef.current;
    const bg = bgRef.current;
    const obj = objRef.current;
    if (!card || !bgWrap || !bg || !obj) return;

    const bgTween = gsap.fromTo(
      bg,
      { yPercent: -BG_RANGE },
      {
        yPercent: BG_RANGE,
        ease: "none",
        scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
      },
    );

    const breathe = gsap.to(bgWrap, {
      scale: BREATHE_SCALE,
      duration: BREATHE_LEG,
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
        scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
      },
    );

    return () => {
      bgTween.scrollTrigger?.kill();
      bgTween.kill();
      breathe.kill();
      objTween.scrollTrigger?.kill();
      objTween.kill();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="img-radius relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[9/5]"
    >
      <div ref={bgWrapRef} className="absolute inset-0 h-full w-full">
        <img
          ref={bgRef}
          src={background}
          alt=""
          aria-hidden
          className="absolute left-0 h-[120%] w-full object-cover will-change-transform"
          style={{ top: "-10%" }}
        />
        {/* Scrim: near-opaque white at the top fading out toward the
            bottom, so the lg: overlaid heading stays legible against sky
            without a flat panel behind it. Kept at every breakpoint (not
            just lg:) since it also reads fine as plain atmospheric fade. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-page to-page/20"
        />
      </div>

      <img
        ref={objRef}
        src={object}
        alt=""
        aria-hidden
        className="absolute bottom-0 left-1/2 h-[85%] w-[55%] -translate-x-1/2 object-bottom object-contain will-change-transform sm:h-[78%] sm:w-[44%] lg:h-[72%] lg:w-[36%]"
      />

      <Reveal
        group
        className="absolute top-0 left-1/2 hidden w-full max-w-[800px] -translate-x-1/2 flex-col items-center gap-4 pt-4 text-center lg:flex"
      >
        <p className="text-base tracking-normal text-ink uppercase">{eyebrow}</p>
        <p className="font-display text-[clamp(1.5rem,3.4vw,2.5rem)] leading-[1.1] tracking-[-0.01em]">
          <span className="text-ink">{bio}</span>
          <span className="text-ink-muted">{bioMuted}</span>
        </p>
      </Reveal>
    </div>
  );
}
