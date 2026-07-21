"use client";

import { gsap } from "@/lib/gsap";

/**
 * The one shared definition of the site's reveal treatments. Both consumers
 * import from here so a target can never animate two different ways
 * depending on whether the intro loader or ScrollReveals happens to own it:
 *
 *   - [components/ScrollReveals.tsx] — below-the-fold, scroll-triggered
 *   - [components/IntroLoader.tsx]   — the first viewport, played on its
 *     timeline as the intro curtain clears
 */

/**
 * Default treatment: fade-blur-up. Tuned to read as a slow, soft focus-pull
 * rather than a flicker — the previous values (0.8s, 8px blur, 6px stagger)
 * resolved fast enough, especially on a full group, that it read as a
 * glitch instead of an intentional settle. Image reveals (below) key off
 * REVEAL_DUR directly, so they stay proportionally in sync automatically.
 */
export const REVEAL_FROM = { y: 22, autoAlpha: 0, filter: "blur(15px)" };
export const REVEAL_TO = { y: 0, autoAlpha: 1, filter: "blur(0px)" };
export const REVEAL_DUR = 1.2;
export const REVEAL_STAGGER = 0.09;
export const REVEAL_EASE = "reveal"; // cubic-bezier(0.16,1,0.3,1)
/** Fires once the element's top edge is 15% into the viewport. */
export const REVEAL_START = "top 85%";

/** Leave no residual filter/transform — a lingering blur(0px) still costs
 *  the compositor a layer for the life of the page. */
export const REVEAL_CLEAR = "filter,transform";

/** Image treatment: the clipped frame unmasks bottom-up while the picture
 *  inside settles from 1.08 → 1. */
const IMAGE_CLIP_FROM = "inset(0% 0% 100% 0%)";
const IMAGE_SCALE_FROM = 1.08;

/**
 * Adds the image reveal to `tl` at `at`. The container is expected to be
 * overflow-hidden with an <img> inside; the picture runs slightly longer
 * than the mask so it's still easing as the frame finishes opening.
 */
export function addImageReveal(
  tl: gsap.core.Timeline,
  container: HTMLElement,
  at: number,
) {
  tl.from(
    container,
    {
      clipPath: IMAGE_CLIP_FROM,
      duration: REVEAL_DUR,
      ease: REVEAL_EASE,
      clearProps: "clipPath",
    },
    at,
  );

  const img = container.querySelector("img");
  if (img) {
    tl.from(
      img,
      {
        scale: IMAGE_SCALE_FROM,
        duration: REVEAL_DUR + 0.2,
        ease: REVEAL_EASE,
        clearProps: "transform",
      },
      at,
    );
  }
  return tl;
}

/**
 * Sets the image reveal's start state without animating — used by the intro
 * loader, which must hide its targets at t=0 under the opaque overlay and
 * only release them later.
 */
export function setImageRevealFrom(container: HTMLElement) {
  gsap.set(container, { clipPath: IMAGE_CLIP_FROM });
  const img = container.querySelector("img");
  if (img) gsap.set(img, { scale: IMAGE_SCALE_FROM });
}

/** The matching release for {@link setImageRevealFrom}. */
export function addImageRevealTo(
  tl: gsap.core.Timeline,
  container: HTMLElement,
  at: number,
) {
  tl.to(
    container,
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: REVEAL_DUR,
      ease: REVEAL_EASE,
      clearProps: "clipPath",
    },
    at,
  );

  const img = container.querySelector("img");
  if (img) {
    tl.to(
      img,
      {
        scale: 1,
        duration: REVEAL_DUR + 0.2,
        ease: REVEAL_EASE,
        clearProps: "transform",
      },
      at,
    );
  }
  return tl;
}
