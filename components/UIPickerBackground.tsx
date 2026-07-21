"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Always-on ambient breathing (scale) + scroll parallax (yPercent) on the
 * UI Picker section's full-bleed background photo. This is atmospheric
 * chrome, not hover-triggered content, so both effects run continuously
 * rather than on interaction.
 *
 * The wrapper div is the untouched inset-0 box (and the ScrollTrigger
 * `trigger` reference — its bounds must match the section, not the
 * oversized image). The <img> itself is sized to 120% height / -10% top so
 * the ±7% yPercent parallax travel never reveals empty space at the edges.
 */
const BREATHE_SCALE = 1.12;
const BREATHE_LEG = 3; // seconds one direction; yoyo+repeat ≈ 6s full cycle
const PARALLAX_RANGE = 14; // yPercent, relative to the image's own 120% height

export default function UIPickerBackground({ src }: { src: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wrapper = wrapperRef.current;
    const img = imgRef.current;
    if (!wrapper || !img) return;

    const breathe = gsap.to(img, {
      scale: BREATHE_SCALE,
      duration: BREATHE_LEG,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    const parallax = gsap.fromTo(
      img,
      { yPercent: -PARALLAX_RANGE },
      {
        yPercent: PARALLAX_RANGE,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );

    return () => {
      breathe.kill();
      parallax.scrollTrigger?.kill();
      parallax.kill();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="pointer-events-none absolute inset-0">
      <img
        ref={imgRef}
        src={src}
        alt=""
        aria-hidden
        className="absolute left-0 w-full object-cover opacity-10 will-change-transform"
        style={{ top: "-10%", height: "120%" }}
      />
    </div>
  );
}
