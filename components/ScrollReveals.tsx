"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * The site-wide default reveal: every element fades in, rises ~18px, and
 * resolves from blur(8px) to sharp — felt more than seen. One treatment,
 * one ease ("reveal" = cubic-bezier(0.16,1,0.3,1), registered in lib/gsap),
 * applied through two attributes:
 *
 *   data-reveal        the element reveals as one unit
 *   data-reveal-group  the element's direct children reveal in sequence,
 *                      60ms apart (rows of stats, nav links, meta cells…)
 *
 * Triggers once at 15% into the viewport; above-the-fold elements fire on
 * load. When the intro loader is present, binding waits for its
 * "nh-intro-reveal" event (dispatched as the curtain starts lifting) so the
 * page settles in as it's uncovered instead of finishing invisibly behind
 * the overlay. A timeout backstops the event in case the loader dies.
 *
 * The hero headline is deliberately NOT part of this system — its liquid
 * word-by-word reveal is the intro's signature and lives in IntroLoader.
 * Reduced motion: bail entirely; everything appears instantly.
 */
const FROM = { y: 18, autoAlpha: 0, filter: "blur(8px)" };
const DUR = 0.8;
const STAGGER = 0.06;
const START = "top 85%";

function bind(): gsap.Context {
  return gsap.context(() => {
    const common = (el: Element) => ({
      duration: DUR,
      ease: "reveal",
      // Leave no residual filter/transform on settled elements — a lingering
      // blur(0px) still costs the compositor a layer.
      clearProps: "filter,transform",
      scrollTrigger: { trigger: el, start: START, once: true },
    });

    // [data-intro-owned] targets belong to the intro loader, which hides
    // them under its opaque overlay at t=0 and reveals them itself as the
    // curtain clears — binding them here re-hid already-uncovered content
    // mid-curtain (a visible glitch, and why the carousel appeared late).
    gsap.utils
      .toArray<HTMLElement>("[data-reveal]:not([data-intro-owned])")
      .forEach((el) => {
        gsap.from(el, { ...FROM, ...common(el) });
      });

    gsap.utils
      .toArray<HTMLElement>("[data-reveal-group]:not([data-intro-owned])")
      .forEach((el) => {
        gsap.from(el.children, { ...FROM, ...common(el), stagger: STAGGER });
      });
  });
}

export default function ScrollReveals() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: gsap.Context | undefined;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      ctx = bind();
      ScrollTrigger.refresh();
    };

    let timeout: number | undefined;
    if (document.getElementById("intro-loader")) {
      window.addEventListener("nh-intro-reveal", start, { once: true });
      timeout = window.setTimeout(start, 4000);
    } else {
      start();
    }

    return () => {
      window.removeEventListener("nh-intro-reveal", start);
      window.clearTimeout(timeout);
      ctx?.revert();
    };
  }, [pathname]);

  return null;
}
