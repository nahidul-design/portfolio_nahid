"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Drives Lenis manually through gsap.ticker instead of Lenis's own rAF loop
 * (autoRaf: false) — this is the standard Lenis+GSAP integration: one shared
 * ticker keeps ScrollTrigger's measurements in sync with Lenis's smoothed
 * scroll position every frame, rather than two independent rAF loops
 * drifting apart.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: false });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
