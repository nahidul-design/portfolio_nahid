"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Module-level singleton — lib/scroll.ts reads this to call lenis.scrollTo()
 *  from anywhere (Nav, Hero, …) without prop-drilling the instance. */
export const lenisRef: { current: Lenis | null } = { current: null };

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
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    // If a saved home scroll position exists (set when navigating away),
    // restore it immediately on Lenis init so the smooth scroller starts
    // at the user's last location. ScrollRestoration clears this key on a
    // full reload, so reloads still land at the top.
    try {
      const saved = sessionStorage.getItem("nh-home-scroll-y");
      if (saved !== null) {
        // immediate: true so Lenis jumps straight to the position without
        // an easing that could be visually jarring on route entry.
        lenis.scrollTo(Number(saved), { immediate: true });
        try {
          sessionStorage.removeItem("nh-home-scroll-y");
        } catch {}
      }
    } catch {
      /* sessionStorage unavailable — nothing to restore */
    }

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
