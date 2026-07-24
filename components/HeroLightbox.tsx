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
 *   - WHEEL over the modal zooms, centred (re-centres unless the user has
 *     already panned), 1×–4×, with a dynamic minimum so the image never
 *     zooms out smaller than the frame.
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
 * body removes it from that ancestry entirely.
 *
 * The wheel listener is registered on `window` with `capture: true` and
 * calls `stopPropagation` — Lenis (mounted much higher, in the root layout)
 * listens for wheel on window too, and capture+stopPropagation is what
 * reliably wins that race regardless of registration order.
 *
 * The background scroll lock is `lenis.stop()`, NOT `overflow: hidden` — the
 * page is scrolled by Lenis through gsap.ticker (see SmoothScroll), so an
 * overflow style on <body> does nothing; Lenis keeps translating the page.
 *
 * Two transform layers, kept separate so they never fight over one element's
 * transform (the CLAUDE.md contention rule, here GSAP-vs-GSAP):
 *   - the STAGE wrapper owns the open/close tween.
 *   - the IMG owns zoom+pan, driven every frame by a dt-corrected lerp on
 *     the shared gsap.ticker (same mechanism as Cursor.tsx) so it eases
 *     toward the wheel/drag target instead of snapping.
 *
 * Prev/next clones the OUTGOING image into a temporary absolutely-positioned
 * layer that animates out on its own, while the real <img> swaps `src` (via
 * `flushSync`, so that commits before the fade-in starts) and animates in
 * underneath — two independent layers crossfading, rather than one element
 * trying to be both at once. This replaced an earlier version that paused
 * the timeline on `img.decode()` and resumed in a `.then()`: decode timing
 * is sensitive to caching/CORS/compression and behaved differently between
 * local dev and the Vercel-served build, occasionally leaving the timeline
 * paused indefinitely — this version has no async dependency in the tween
 * chain at all.
 */
const SCALE_MIN = 1;
const SCALE_MAX = 4;
const SCALE_PER_WHEEL_STEP = 1.12;
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
    gsap.to(stage, { autoAlpha: 0, y: 10, scale: 0.96, duration: 0.28, ease: "power2.in" });
    gsap.to(overlay, {
      autoAlpha: 0,
      duration: 0.32,
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
      gsap.set([overlay, stage], { autoAlpha: 1, scale: 1, y: 0 });
      return;
    }
    gsap.set(overlay, { autoAlpha: 0 });
    gsap.set(stage, { autoAlpha: 0, y: 18, scale: 0.94 });
    gsap.to(overlay, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
    gsap.to(stage, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "reveal" });
  }, [rendered, index]);

  // Zoom/pan interaction + the ticker lerp that renders it. Runs while open.
  useEffect(() => {
    if (!rendered) return;
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;

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
    const setZoomedFlag = (s: number) => setZoomed(s > 1.001);

    const onWheel = (e: WheelEvent) => {
      // preventDefault blocks the page scroll; stopPropagation stops it
      // from ever reaching Lenis's own window-level wheel listener (see
      // file header) — capture-phase + stopPropagation is what reliably
      // wins that race regardless of registration order.
      e.preventDefault();
      e.stopPropagation();
      if (transitioningRef.current) return;

      // Normalize across deltaMode so trackpad/wheel/precision devices
      // step by roughly the same felt amount.
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 16; // line
      else if (e.deltaMode === 2) delta *= 800; // page
      // Trackpad pinch-to-zoom is reported as a wheel event with ctrlKey
      // set and a very small deltaY — without amplifying it, a pinch
      // barely moves the scale at all.
      if (e.ctrlKey) delta *= 8;

      const s = target.current.s;
      const steps = -delta / 120; // 120 ≈ one physical wheel notch
      const s2 = gsap.utils.clamp(
        SCALE_MIN,
        SCALE_MAX,
        s * Math.pow(SCALE_PER_WHEEL_STEP, steps),
      );
      if (s2 === s) return;

      // Re-centres unless the user has already panned away from centre.
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
      setZoomedFlag(s2);
    };

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startOffX = 0;
    let startOffY = 0;

    const onPointerDown = (e: PointerEvent) => {
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

    const tick = (_t: number, dtMs: number) => {
      const k = reducedRef.current ? 1 : 1 - Math.pow(1 - LERP, (dtMs / 1000) * 60);
      cur.current.x += (target.current.x - cur.current.x) * k;
      cur.current.y += (target.current.y - cur.current.y) * k;
      cur.current.s += (target.current.s - cur.current.s) * k;
      applyNow();
    };

    // Single listener, on window, capture phase — see file header for why
    // this needs to win the race against Lenis's own wheel listener.
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    frame.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("wheel", onWheel, true);
      frame.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      gsap.ticker.remove(tick);
    };
  }, [rendered]);

  // Prev/next: clone the outgoing image into its own layer that fades+slides
  // out independently, while the real <img> swaps src (flushSync, so the
  // DOM commits before the tween starts) and fades+slides in underneath.
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
    const frame = frameRef.current;
    const outgoing = imgRef.current;

    if (!frame || !outgoing || reducedRef.current) {
      setDisplayIndex(index);
      resetTransform(true);
      return;
    }

    transitioningRef.current = true;
    const clone = outgoing.cloneNode(true) as HTMLImageElement;
    clone.style.position = "absolute";
    clone.style.inset = "0";
    clone.style.pointerEvents = "none";
    frame.appendChild(clone);

    // The clone carries whatever zoom/pan the outgoing image had; the real
    // img resets to 1×/centred for the incoming picture.
    gsap.set(clone, { x: cur.current.x, y: cur.current.y, scale: cur.current.s });

    // flushSync CANNOT run synchronously here — this whole callback is
    // still inside a useEffect, i.e. still inside React's commit phase, and
    // React throws ("cannot flush while already rendering") if flushSync is
    // called from that context. Deferring to the next frame moves it
    // outside React's commit entirely; one frame (~16ms) is imperceptible
    // and the clone is already painted in its start state by then, so
    // there's no visible gap.
    requestAnimationFrame(() => {
      flushSync(() => setDisplayIndex(index));
      resetTransform(true);

      // A mathematically exact crossfade: SAME ease, SAME duration, SAME
      // start time on both layers, so outgoing-alpha + incoming-alpha sums
      // to exactly 1 at every instant, whatever the ease's shape is. The
      // previous version used a different ease/duration/delay per layer
      // (power2.in vs reveal, staggered 0.08s) — since those curves aren't
      // complementary, there was a window where both were significantly
      // opaque (a flash) followed by the outgoing layer cratering abruptly
      // at the end (a pop). That mismatch was the "glitch on changing
      // images."
      const DUR = 0.42;
      const EASE = "reveal";
      gsap.set(outgoing, { autoAlpha: 0, xPercent: dir === "next" ? 6 : -6 });

      const tl = gsap.timeline({
        onComplete: () => {
          clone.remove();
          transitioningRef.current = false;
        },
      });
      tl.to(
        clone,
        { autoAlpha: 0, xPercent: dir === "next" ? -6 : 6, duration: DUR, ease: EASE },
        0,
      );
      tl.to(outgoing, { autoAlpha: 1, xPercent: 0, duration: DUR, ease: EASE }, 0);
    });
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
