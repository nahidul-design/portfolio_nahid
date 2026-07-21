"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * A very soft radial darkening at the screen edges that pulses once when a
 * CTA triggers a smooth-scroll (see lib/scroll.ts) — a screen-level cue that
 * the jump is choreographed, not a hard cut. Only ever dispatched under full
 * motion, so no reduced-motion check is needed here.
 */
export default function ScrollVignette() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pulse = () => {
      gsap.fromTo(
        ref.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "reveal", yoyo: true, repeat: 1 },
      );
    };
    window.addEventListener("nh-scroll-pulse", pulse);
    return () => window.removeEventListener("nh-scroll-pulse", pulse);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] opacity-0"
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 55%, rgba(27,30,31,0.12) 100%)",
      }}
    />
  );
}
