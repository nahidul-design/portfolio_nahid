"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { gsap } from "@/lib/gsap";
import { lenisRef } from "./SmoothScroll";

/**
 * Hero carousel zoom lightbox. Opened from HeroCarousel; a dark full-screen
 * scrim behind a single framed image, with a prev/next arrow floated at each
 * screen edge — no control panel.
 *
 * Interaction model (built to feel like a native image viewer):
 *   - WHEEL over the modal zooms, toward the cursor (not the frame centre),
 *     1×–4×.
 *   - DRAG pans the zoomed image, clamped so it can't leave the frame.
 *   - Escape / backdrop click closes; ← → navigate.
 *
 * **Portaled to document.body** — this used to render as a child of
 * HeroCarousel's own <section>, which is also GSAP Draggable's `trigger`
 * for the carousel's own drag-to-scrub behaviour. `position: fixed` makes
 * the modal cover the whole viewport visually, but it does NOT change its
 * place in the DOM tree — a pointerdown anywhere in the modal still bubbled
 * up through that section, so Draggable (listening on the section) picked
 * it up as a drag on the *carousel*, not the modal image. Portaling out to
 * body removes it from that ancestry entirely, which is the correct fix
 * (not just an event.stopPropagation patch — the modal has no business
 * being a DOM descendant of the carousel section at all).
 *
 * The wheel listener is also registered `capture: true` and calls
 * `stopPropagation`, not just `preventDefault` — Lenis (mounted much
 * higher, in the root layout) listens for wheel on window too, and without
 * capture+stopPropagation there's a real race over which handler resolves
 * the event first depending on registration order.
 *
 * The background scroll lock is `lenis.stop()`, NOT `overflow: hidden` — the
 * page is scrolled by Lenis through gsap.ticker (see SmoothScroll), so an
 * overflow style on <body> does nothing; Lenis keeps translating the page.
 * This was the "page scrolls behind the modal" bug.
 *
 * Two transform layers, kept separate so they never fight over one element's
 * transform (the CLAUDE.md contention rule, here GSAP-vs-GSAP):
 *   - the STAGE wrapper owns the open/close + prev/next slide-fade
 *     (directional, "reveal" ease) — a discrete, tweened transition.
 *   - the IMG owns zoom+pan, driven every frame by a dt-corrected lerp on
 *     the shared gsap.ticker (same mechanism as Cursor.tsx) so it eases
 *     toward the wheel/drag target instead of snapping.
 *
 * The prev/next swap uses `flushSync` around the `displayIndex` update
 * inside the GSAP timeline callback — without it, React's render (which
 * swaps the <img src>) can land a frame or two after the fade-in tween has
 * already started, so the new image visibly snaps in mid-fade instead of
 * fading in clean. flushSync forces that render to commit synchronously
 * before the entrance tween begins.
 */
const SCALE_MIN = 1;
const SCALE_MAX = 4;
/** Multiplicative zoom per wheel notch — exp() keeps each step feeling equal
 *  regardless of current scale. */
const WHEEL_SENSITIVITY = 0.0015;
/** Per-frame follow weight at 60fps; dt-corrected in the ticker. */
const LERP = 0.2;

function ChevronIcon({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`size-6 ${direction === "prev" ? "" : "-scale-x-100"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M14.5 5.5L8 12l6.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type LightboxImage = { src: string; alt: string };

export default function HeroLightbox({
  images,
  index,
  onClose,
  onChangeIndex,
}: {
  images: LightboxImage[];
  /** null = closed. */
  index: number | null;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}) {
  const [rendered, setRendered] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  /** What's actually on screen. Lags `index` during a prev/next transition so
   *  the outgoing image stays visible until the incoming one is ready. */
  const [displayIndex, setDisplayIndex] = useState(0);

  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const reducedRef = useRef(false);
  const debugRef = useRef(true);
  const [dbg, setDbg] = useState({ cx: 0, cy: 0, cs: 1, tx: 0, ty: 0, ts: 1 });
  const lastDeltaRef = useRef(0);
  const setZoomedFlag = (s: number) => setZoomed(s > 1.001);

  // Zoom/pan state — refs, not React state, so wheel/drag never re-render.
  const cur = useRef({ x: 0, y: 0, s: 1 });
  const target = useRef({ x: 0, y: 0, s: 1 });
  const transitioningRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  // Background scroll lock via Lenis (see file header for why not overflow).
  useEffect(() => {
    if (index === null) {
      lenisRef.current?.start();
      return;
    }
    lenisRef.current?.stop();
    return () => lenisRef.current?.start();
  }, [index]);

  // Mount before entering; unmount only after the exit tween finishes.
  useEffect(() => {
    if (index !== null) {
      setDisplayIndex(index);
      resetTransform(false);
      setRendered(true);
      return;
    }
    if (!rendered) return;
    const overlay = overlayRef.current;
    const stage = stageRef.current;
    if (!overlay || !stage || reducedRef.current) {
      setRendered(false);
      return;
    }
    gsap.to(stage, { autoAlpha: 0, y: 8, scale: 0.98, duration: 0.25, ease: "power2.in" });
    gsap.to(overlay, {
      autoAlpha: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => setRendered(false),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Entrance, once mounted.
  useEffect(() => {
    if (!rendered || index === null) return;
    const overlay = overlayRef.current;
    const stage = stageRef.current;
    if (!overlay || !stage) return;

    if (reducedRef.current) {
      gsap.set([overlay, stage], { autoAlpha: 1, scale: 1, xPercent: 0 });
      return;
    }
    gsap.set(overlay, { autoAlpha: 0 });
    gsap.set(stage, { autoAlpha: 0, scale: 0.96, xPercent: 0, y: -8 });
    gsap.to(overlay, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
    gsap.to(stage, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: "reveal" });
  }, [rendered, index]);

  // Zoom/pan interaction + the ticker lerp that renders it. Runs while open.
  useEffect(() => {
    if (!rendered) return;
    const overlay = overlayRef.current;
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!overlay || !frame || !img) return;

    const quickX = gsap.quickSetter(img, "x", "px");
    const quickY = gsap.quickSetter(img, "y", "px");
    const quickS = gsap.quickSetter(img, "scale");

    const applyNow = () => {
      quickX(cur.current.x);
      quickY(cur.current.y);
      quickS(cur.current.s);
    };
    applyNow();

    // Max pan offset at a given scale — keeps the enlarged image from being
    // dragged past the frame edges.
    const boundsFor = (s: number) => {
      const r = frame.getBoundingClientRect();
      return { x: Math.max(0, ((s - 1) * r.width) / 2), y: Math.max(0, ((s - 1) * r.height) / 2) };
    };
    const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v));

    const onWheel = (e: WheelEvent) => {
      if (debugRef.current) console.debug("HeroLightbox:onWheel", { deltaY: e.deltaY, deltaMode: e.deltaMode, ctrl: e.ctrlKey });
      // preventDefault blocks the page scroll; stopPropagation stops it
      // from ever reaching Lenis's own window-level wheel listener, which
      // is registered independently of this modal (see file header) — a
      // capture-phase + stopPropagation listener is the only way to
      // reliably win that race regardless of registration order.
      e.preventDefault();
      e.stopPropagation();
      if (transitioningRef.current) return;

      let delta = e.deltaY;
      // Normalize across deltaMode: 0=pixel,1=line,2=page
      if (e.deltaMode === 1) delta = delta * 16;
      else if (e.deltaMode === 2) delta = delta * 800;
      // If pinch-to-zoom reports with ctrlKey, amplify for better feel
      if (e.ctrlKey) delta *= 10;
      lastDeltaRef.current = delta;

      const s = target.current.s;
      // Compute a dynamic minimum scale so the image always at least fills
      // the frame (100% of container). Use natural dimensions when available.
      const r = frame.getBoundingClientRect();
      let fitScale = SCALE_MIN;
      try {
        const nw = img.naturalWidth || 0;
        const nh = img.naturalHeight || 0;
        if (nw && nh) {
          fitScale = Math.max(r.width / nw, r.height / nh);
        }
      } catch {
        fitScale = SCALE_MIN;
      }
      // Convert delta into discrete steps for predictable zoom across devices.
      // Smaller delta produces smaller step fraction.
      const step = -delta / 120; // 120 is a typical mouse-wheel unit
      const SCALE_PER_STEP = 1.12;
      const s2candidate = s * Math.pow(SCALE_PER_STEP, step);
      const s2 = gsap.utils.clamp(Math.max(fitScale, SCALE_MIN), SCALE_MAX, s2candidate);
      if (s2 === s) return;

      // Center-anchored zoom: keep image centered unless user has panned.
      let nx = 0;
      let ny = 0;
      if (Math.abs(target.current.x) > 2 || Math.abs(target.current.y) > 2) {
        nx = target.current.x * (s2 / s);
        ny = target.current.y * (s2 / s);
      }
      const b = boundsFor(s2);
      nx = clamp(nx, b.x);
      ny = clamp(ny, b.y);
      target.current = { x: nx, y: ny, s: s2 };
      if (debugRef.current) console.debug("HeroLightbox:target", target.current, { fitScale, step, s2candidate });
      setZoomedFlag(s2);
    };

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startOffX = 0;
    let startOffY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (debugRef.current) console.debug("HeroLightbox:onPointerDown", { x: e.clientX, y: e.clientY });
      if (transitioningRef.current || e.button !== 0) return;
      // Belt-and-braces alongside the portal move (see file header) — this
      // gesture is a pan on the modal image, never anything ancestor
      // elements should also react to.
      e.stopPropagation();
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startOffX = target.current.x;
      startOffY = target.current.y;
      frame.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const b = boundsFor(target.current.s);
      target.current.x = clamp(startOffX + (e.clientX - startX), b.x);
      target.current.y = clamp(startOffY + (e.clientY - startY), b.y);
    };
    const endDrag = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      try {
        frame.releasePointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
    };

    const tick = (_t: number, dtSec: number) => {
      const k = reducedRef.current ? 1 : 1 - Math.pow(1 - LERP, dtSec * 60);
      cur.current.x += (target.current.x - cur.current.x) * k;
      cur.current.y += (target.current.y - cur.current.y) * k;
      cur.current.s += (target.current.s - cur.current.s) * k;
      applyNow();
      // Update debug overlay at ~10fps
      if (debugRef.current) {
        ;(tick as any)._acc = ((tick as any)._acc || 0) + dtSec;
        if ((tick as any)._acc > 0.1) {
          (tick as any)._acc = 0;
          setDbg({ cx: Math.round(cur.current.x), cy: Math.round(cur.current.y), cs: Number(cur.current.s.toFixed(2)), tx: Math.round(target.current.x), ty: Math.round(target.current.y), ts: Number(target.current.s.toFixed(2)) });
        }
      }
    };

    // Attach wheel on window and overlay in capture so we reliably receive
    // wheel events even if Lenis or a descendant listener would otherwise
    // intercept them. We still stopPropagation inside the handler.
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    overlay.addEventListener("wheel", onWheel, { passive: false, capture: true });
    frame.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("wheel", onWheel, true);
      overlay.removeEventListener("wheel", onWheel, true);
      frame.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      gsap.ticker.remove(tick);
    };
  }, [rendered]);

  // Prev/next: a directional slide-fade on the STAGE wrapper, swapping the
  // rendered image at the trough (while it's invisible, so no flash).
  const shownRef = useRef(index);
  useEffect(() => {
    if (index === null) {
      shownRef.current = null;
      return;
    }
    const prevShown = shownRef.current;
    shownRef.current = index;
    if (prevShown === null || prevShown === index) return; // open, not a nav

    const dir = index === (prevShown + 1) % images.length ? "next" : "prev";
    const stage = stageRef.current;

    if (!stage || reducedRef.current) {
      setDisplayIndex(index);
      resetTransform(true);
      return;
    }

    transitioningRef.current = true;
    const tl = gsap.timeline({
      onComplete: () => {
        transitioningRef.current = false;
      },
    });
    // Use a cloned outgoing image so we can animate it independently
    // while the real <img> swaps its src. This avoids timing races.
    const frame = frameRef.current;
    const outgoing = imgRef.current;
    let clone: HTMLImageElement | null = null;
    if (frame && outgoing) {
      clone = outgoing.cloneNode(true) as HTMLImageElement;
      clone.style.position = "absolute";
      clone.style.inset = "0";
      clone.style.willChange = "opacity,transform";
      frame.appendChild(clone);
      tl.to(clone, {
        autoAlpha: 0,
        xPercent: dir === "next" ? -8 : 8,
        duration: 0.28,
        ease: "power2.in",
        onComplete: () => {
          try { clone?.remove(); } catch {}
        },
      });
    }

    tl.add(() => {
      flushSync(() => {
        setDisplayIndex(index);
      });
      resetTransform(true);
      const incomingImg = imgRef.current;
      if (debugRef.current) console.debug("HeroLightbox:swapImage", { index, incomingPresent: !!incomingImg, incomingComplete: incomingImg?.complete });
      if (incomingImg) {
        gsap.set(incomingImg, { autoAlpha: 0, xPercent: dir === "next" ? 8 : -8 });
        // Pause entrance until the image is decoded and ready to render
        tl.pause();
        const ensureDecoded = (incomingImg.decode ? incomingImg.decode() : Promise.resolve()).catch(() => null);
        ensureDecoded.then(() => {
          if (debugRef.current) console.debug("HeroLightbox:imageReady", { index });
          tl.resume();
        });
      }
    });
    // Fade/slide the incoming image into view.
    tl.to(imgRef.current, { autoAlpha: 1, xPercent: 0, duration: 0.45, ease: "reveal" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Reset zoom/pan. `instant` snaps cur to target (used on image swap, where
  // the stage is invisible); otherwise the ticker lerp eases it back.
  function resetTransform(instant: boolean) {
    target.current = { x: 0, y: 0, s: 1 };
    if (instant) cur.current = { x: 0, y: 0, s: 1 };
    setZoomed(false);
  }

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onChangeIndex((index - 1 + images.length) % images.length);
      else if (e.key === "ArrowRight") onChangeIndex((index + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, onClose, onChangeIndex]);

  if (!rendered || typeof document === "undefined") return null;

  const current = images[displayIndex];
  const nav = (delta: number) => {
    if (index === null || transitioningRef.current) return;
    onChangeIndex((index + delta + images.length) % images.length);
  };

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      data-cursor-theme="dark"
      className="invisible fixed inset-0 z-[150] flex items-center justify-center bg-ink/95 p-6 backdrop-blur-sm sm:p-10"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Prev / next — floated at the screen edges, over the scrim. */}
      <button
        type="button"
        data-cursor="Prev"
        aria-label="Previous image"
        onClick={() => nav(-1)}
        className="absolute top-1/2 left-3 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-white/70 backdrop-blur-sm transition-[color,background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-white/40 hover:bg-white/10 hover:text-white active:scale-90 sm:left-6"
      >
        <ChevronIcon direction="prev" />
      </button>
      <button
        type="button"
        data-cursor="Next"
        aria-label="Next image"
        onClick={() => nav(1)}
        className="absolute top-1/2 right-3 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-white/70 backdrop-blur-sm transition-[color,background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-white/40 hover:bg-white/10 hover:text-white active:scale-90 sm:right-6"
      >
        <ChevronIcon direction="next" />
      </button>

      <div
        ref={stageRef}
        className="invisible flex w-full max-w-[1100px] items-center justify-center will-change-transform"
      >
        <div
          ref={frameRef}
          className={`img-radius relative aspect-[588/440] max-h-[84vh] w-full touch-none overflow-hidden select-none ${
            zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-default"
          }`}
        >
          <img
            ref={imgRef}
            src={current.src}
            alt={current.alt}
            draggable={false}
            className="absolute inset-0 size-full object-contain will-change-transform"
          />
        </div>
      </div>

      {/* zoom controls removed */}

      {debugRef.current && (
        <div className="fixed bottom-6 right-6 z-50 rounded-md bg-black/60 px-3 py-2 text-xs text-white backdrop-blur-sm">
          <div>cur s: {dbg.cs} tx: {dbg.tx} ty: {dbg.ty}</div>
          <div>tar s: {dbg.ts} cx: {dbg.cx} cy: {dbg.cy}</div>
          <div>lastΔ: {Math.round(lastDeltaRef.current)}</div>
        </div>
      )}

      {/* Discoverability hint for the wheel-zoom — fades on first interaction. */}
      <p
        className={`pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-sm tracking-body text-white/45 transition-opacity duration-500 ${
          zoomed ? "opacity-0" : "opacity-100"
        }`}
      >
        Scroll to zoom &middot; Drag to pan
      </p>
    </div>,
    document.body,
  );
}
