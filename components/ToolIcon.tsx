"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

/**
 * One icon tile in the Tools row-table (Figma 175:2, "Frame 27" groups) — a
 * fixed 32px-tall slot, but not always 32px wide: two of the sixteen source
 * assets are trimmed narrower (22px, 28px) because their exported artwork
 * has no side padding, so `className` carries the per-icon size instead of
 * a hardcoded size-8. Icons render at full opacity/full brand colour — the
 * "60% opacity, muted" treatment from an earlier pass was never actually in
 * the Figma file; these are real, full-colour brand marks.
 *
 * Hover is GSAP-driven, not CSS — a soft spring scale (1→1.12) plus a slight
 * vertical bob, matching the site's liquid hover language elsewhere (see
 * AboutPortrait's breathing tilt for the same "GSAP-on-hover" pattern). This
 * is safe on the same element the reveal system also targets: the reveal
 * runs once on entrance and clears its own inline props, so a later hover
 * tween never fights it — only a live CSS *transition* on the same
 * properties would (see CLAUDE.md's contention rule), and this uses neither.
 */
export default function ToolIcon({
  label,
  className = "size-8",
  children,
}: {
  /** Accessible name. Omit for icons whose exact brand identity isn't
   *  confidently known — the mark renders decoratively (aria-hidden) rather
   *  than asserting a guessed name. */
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const onEnter = () => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.killTweensOf(el);
    gsap.to(el, {
      scale: 1.12,
      y: -4,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.to(el, {
      scale: 1,
      y: 0,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  return (
    <span
      ref={ref}
      role="img"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      title={label}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`flex shrink-0 items-center justify-center ${className}`}
    >
      {children}
    </span>
  );
}
