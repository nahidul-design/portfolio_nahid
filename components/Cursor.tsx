"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Site-wide custom cursor: a ~12px circle that trails the pointer with a
 * lerp-smoothed lag, morphing by what's underneath —
 *
 *   default            12px hollow circle
 *   data-cursor="view" grows to a filled "View" pill (fade-blur-up entrance)
 *   text / button      shrinks to a 5px dot
 *
 * Driven from the shared gsap.ticker, never a second rAF loop, so it stays in
 * lockstep with Lenis/ScrollTrigger (see SmoothScroll). Pointer-fine only:
 * touch and coarse pointers keep the native cursor and this never mounts.
 */
type Variant = "default" | "view" | "shrink";

const LERP = 0.18; // per-frame follow weight at 60fps; dt-corrected below

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // Detect first — only fine pointers get the custom cursor. This just flips
  // `enabled`, which renders the dot; the wiring effect below runs after that
  // render so the refs are populated (attaching in this same effect would read
  // a null dotRef, since the dot isn't in the DOM until enabled is true).
  useLayoutEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dot = dotRef.current;
    const label = labelRef.current;
    if (!dot) return;

    // Target (raw pointer) vs. rendered (smoothed) position.
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const pos = { ...target };
    let variant: Variant = "default";
    let visible = false;

    // Centre the dot on the pointer via GSAP's own transform model, NOT a
    // Tailwind -translate-1/2: quickSetter "x"/"y" writes the whole transform
    // each frame and would wipe a CSS translate, leaving the dot's top-left
    // (not its centre) on the pointer. xPercent/yPercent compose with x/y.
    gsap.set(dot, { xPercent: -50, yPercent: -50 });
    const quickX = gsap.quickSetter(dot, "x", "px");
    const quickY = gsap.quickSetter(dot, "y", "px");

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        gsap.to(dot, { autoAlpha: 1, duration: 0.3 });
      }

      // Resolve the morph from whatever sits under the pointer.
      const el = (e.target as Element | null)?.closest?.(
        "[data-cursor], a, button, input, textarea, select, label",
      );
      const next: Variant = !el
        ? "default"
        : el.getAttribute("data-cursor") === "view"
          ? "view"
          : "shrink";

      if (next !== variant) {
        variant = next;
        applyVariant(next);
      }
    };

    const applyVariant = (v: Variant) => {
      const isView = v === "view";
      gsap.to(dot, {
        width: isView ? 72 : v === "shrink" ? 5 : 12,
        height: isView ? 72 : v === "shrink" ? 5 : 12,
        backgroundColor:
          isView || v === "shrink" ? "var(--color-ink)" : "transparent",
        borderColor: isView ? "transparent" : "var(--color-ink)",
        duration: 0.35,
        ease: "reveal",
      });
      if (label) {
        // The "View" label uses the same fade-blur-up as the reveal system.
        gsap.killTweensOf(label);
        if (isView) {
          gsap.fromTo(
            label,
            { autoAlpha: 0, y: 6, filter: "blur(6px)" },
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.35,
              ease: "reveal",
            },
          );
        } else {
          gsap.to(label, { autoAlpha: 0, duration: 0.15 });
        }
      }
    };

    const onLeave = () => {
      visible = false;
      gsap.to(dot, { autoAlpha: 0, duration: 0.3 });
    };

    const tick = (_t: number, dtMs: number) => {
      // dt-corrected lerp — identical feel at 60 and 144Hz. Skip smoothing
      // entirely under reduced motion (snap straight to the pointer).
      const k = reduce ? 1 : 1 - Math.pow(1 - LERP, (dtMs / 1000) * 60);
      pos.x += (target.x - pos.x) * k;
      pos.y += (target.y - pos.y) * k;
      quickX(pos.x);
      quickY(pos.y);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      gsap.ticker.remove(tick);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none invisible fixed top-0 left-0 z-[200] flex items-center justify-center rounded-full border will-change-transform"
      style={{ width: 12, height: 12, borderColor: "var(--color-ink)" }}
    >
      <span
        ref={labelRef}
        className="invisible text-[11px] font-medium tracking-normal text-page uppercase"
      >
        View
      </span>
    </div>
  );
}
