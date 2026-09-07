"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * The quote panel's background photo — a slow, always-on ambient breathing
 * scale, the same "fluid" motion used on the hero/UI-Picker background
 * photos elsewhere on the site.
 *
 * Scale lives directly on the <img>, not a wrapper — a first pass put it on
 * a separate wrapping div instead, which broke the mix-blend-overlay
 * entirely: a `transform` on an ANCESTOR of a blended element creates a new
 * stacking context, and the blend mode then only composites within that new
 * context (which contained nothing else), never reaching the bg-ink behind
 * it. Animating the img itself doesn't have this problem — a transform on
 * the blending element itself doesn't isolate its own blend from what's
 * behind it, only from its own descendants (and this img has none). Safe to
 * animate the img directly here specifically because nothing else (no
 * scroll parallax, no reveal-image) also writes to this element's
 * transform — unlike Hero's background, which needs the wrapper split.
 */
// Matches UIPickerBackground's own tuning history: a first pass at a subtle
// delta (there, 1.03) read as "barely there"/not noticeable at a glance, so
// it went to 1.12. Starting there directly this time instead of repeating
// that same discovery.
const BREATHE_SCALE = 1.12;
const BREATHE_LEG = 4; // seconds one direction; yoyo+repeat ≈ 8s full cycle

export default function QuoteBackground({ src }: { src: string }) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const img = imgRef.current;
    if (!img) return;

    const breathe = gsap.to(img, {
      scale: BREATHE_SCALE,
      duration: BREATHE_LEG,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    return () => {
      breathe.kill();
    };
  }, []);

  return (
    <img
      ref={imgRef}
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover mix-blend-overlay will-change-transform"
    />
  );
}
