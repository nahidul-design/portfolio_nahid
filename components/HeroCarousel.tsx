"use client";

import { useEffect, useRef, useState } from "react";
import { Draggable, gsap } from "@/lib/gsap";
import { withBasePath } from "@/lib/assets";

const IMAGES = Array.from({ length: 12 }, (_, index) => ({
  src: withBasePath(`/hero/gallery-${index + 1}.webp`),
  alt: `Hero carousel image ${index + 1}`,
}));

/** px/s the row drifts on its own. */
const DRIFT_SPEED = 50;
/** 1 sends the row right→left. Flip to -1 for left→right — nothing else changes. */
const DRIFT_SIGN = 1;
/** Seconds for the drift to ease in/out on hover. Spec: ~0.6s, never a hard stop. */
const SPEED_EASE = 0.6;

const MAX_SCALE_X = 0.04;
const VELOCITY_TO_SCALE = 1 / 34000;
/** Per-frame lerp weight at 60fps; corrected for real dt below. */
const SMOOTHING = 0.1;

export default function HeroCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  /** The single source of truth for position — drift and drag both write here. */
  const offsetRef = useRef(0);
  const prevOffsetRef = useRef(0);
  const setWidthRef = useRef(0);
  const scaleRef = useRef(1);

  const [copies, setCopies] = useState(3);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* Measure one set's width and duplicate until the row can cover the viewport
     with a spare set on each side — otherwise the wrap would expose a gap. */
  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    const measure = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      // total = C·N·w + (C·N−1)·g, so one set *including* its trailing gap is:
      const setWidth = (track.scrollWidth + gap) / copies;
      setWidthRef.current = setWidth;

      const needed = Math.ceil(section.offsetWidth / setWidth) + 2;
      if (needed > copies) setCopies(needed);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    return () => ro.disconnect();
  }, [copies]);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-card]"),
    );
    const setTrackX = gsap.quickSetter(track, "x", "px");
    const setScaleX = cards.map((c) => gsap.quickSetter(c, "scaleX"));

    /* Tweened rather than snapped, so hover decelerates instead of stopping. */
    const speed = { value: reduced ? 0 : DRIFT_SPEED };
    const easeSpeedTo = (value: number) =>
      gsap.to(speed, {
        value,
        duration: SPEED_EASE,
        ease: "power2.out",
        overwrite: true,
      });

    /* Detached proxy: Draggable tweens it (with inertia on release) and we fold
       its delta into the same offset the drift writes to, so the two blend
       instead of fighting. */
    const proxy = document.createElement("div");
    let lastProxyX = 0;

    const applyProxy = () => {
      const x = Number(gsap.getProperty(proxy, "x"));
      offsetRef.current -= x - lastProxyX;
      lastProxyX = x;
    };

    const draggables = Draggable.create(proxy, {
      type: "x",
      trigger: section,
      inertia: true,
      allowNativeTouchScrolling: true, // keep vertical page scroll on touch
      onPressInit() {
        gsap.set(proxy, { x: 0 });
        lastProxyX = 0;
        easeSpeedTo(0); // covers touch, where there's no hover event
      },
      onDrag: applyProxy,
      onThrowUpdate: applyProxy,
      onRelease() {
        // On touch the pointer leaves entirely; on mouse it may still hover.
        if (!reduced && !section.matches(":hover")) easeSpeedTo(DRIFT_SPEED);
      },
    });

    const onEnter = () => {
      easeSpeedTo(0);
    };

    const onLeave = () => {
      if (!reduced) easeSpeedTo(DRIFT_SPEED);
    };
    section.addEventListener("mouseenter", onEnter);
    section.addEventListener("mouseleave", onLeave);

    const tick = (_time: number, deltaMs: number) => {
      // Clamp so a backgrounded tab doesn't resume with one enormous jump.
      const dt = Math.min(deltaMs / 1000, 0.05);

      if (!reduced) offsetRef.current += DRIFT_SIGN * speed.value * dt;

      const setWidth = setWidthRef.current;
      if (setWidth > 0) {
        const wrapped =
          ((offsetRef.current % setWidth) + setWidth) % setWidth;
        setTrackX(-wrapped);
      }

      if (reduced) return;

      const velocity =
        dt > 0 ? (offsetRef.current - prevOffsetRef.current) / dt : 0;
      prevOffsetRef.current = offsetRef.current;

      const targetScaleX =
        1 + Math.min(Math.abs(velocity) * VELOCITY_TO_SCALE, MAX_SCALE_X);

      // dt-corrected lerp, so smoothing feels the same at 60 and 144Hz.
      const t = 1 - Math.pow(1 - SMOOTHING, dt * 60);
      scaleRef.current += (targetScaleX - scaleRef.current) * t;

      for (let i = 0; i < cards.length; i++) {
        setScaleX[i](scaleRef.current);
      }
    };

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      draggables.forEach((d) => d.kill());
      gsap.killTweensOf(speed);
      section.removeEventListener("mouseenter", onEnter);
      section.removeEventListener("mouseleave", onLeave);
      // Leave cards neutral if this remounts.
      cards.forEach((c) => gsap.set(c, { scaleX: 1 }));
    };
  }, [copies, reduced]);

  return (
    <section
      ref={sectionRef}
      aria-label="Selected work"
      data-reveal
      className="w-full overflow-hidden select-none"
    >
      <div ref={trackRef} className="flex w-max gap-6 will-change-transform">
        {Array.from({ length: copies }).flatMap((_, copy) =>
          IMAGES.map((image, i) => (
            <div
              key={`${copy}-${i}`}
              data-card
              className="group img-radius relative aspect-[588/440] w-[clamp(260px,42vw,588px)] shrink-0 overflow-hidden will-change-transform"
            >
              <div className="h-full w-full transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]">
                <img
                  src={image.src}
                  // Only the first set is announced; the rest are visual repeats.
                  alt={copy === 0 ? image.alt : ""}
                  aria-hidden={copy > 0}
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>
          )),
        )}
      </div>
    </section>
  );
}
