"use client";

import type Lenis from "lenis";
import { lenisRef } from "@/components/SmoothScroll";

/** Standard expo-out — Lenis wants a plain (t) => number, not a CSS bezier. */
const EXPO_OUT = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Shared by scrollToHash/scrollToTop. Dispatches "nh-scroll-pulse" so
 * ScrollVignette can play its landing cue — skipped under reduced motion,
 * where the scroll itself also jumps instantly instead of easing.
 */
function smoothScroll(target: Parameters<Lenis["scrollTo"]>[0]) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = lenisRef.current;

  if (!lenis) {
    if (typeof target === "string") {
      document
        .querySelector(target)
        ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }
    return;
  }

  if (reduce) {
    lenis.scrollTo(target, { immediate: true });
    return;
  }

  lenis.scrollTo(target, { duration: 1.1, easing: EXPO_OUT });
  window.dispatchEvent(new Event("nh-scroll-pulse"));
}

/** Smooth-scrolls to any in-page anchor via the shared Lenis instance. */
export function scrollToHash(hash: string) {
  smoothScroll(hash);
}

/** Smooth-scrolls back to the top of the page. */
export function scrollToTop() {
  smoothScroll(0);
}
