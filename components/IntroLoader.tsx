"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import {
  addImageRevealTo,
  REVEAL_CLEAR,
  REVEAL_DUR,
  REVEAL_EASE,
  REVEAL_FROM,
  REVEAL_STAGGER,
  REVEAL_TO,
  setImageRevealFrom,
} from "@/lib/reveal";

/**
 * Intro per the Figma Intro Animation frames (96:164 → 96:167), played on
 * every page load. Pacing (~2.6s total, unhurried):
 *
 *   0.0–1.2  wordmark pill holds on #1b1e1f
 *   1.2–1.7  text fades, pill collapses to the empty 56×56 mark
 *   1.7–2.6  clip-path curtain lifts; the mark rides up with it
 *   2.35→    hero headline words start their liquid reveal, and ALL other
 *            above-the-fold content (meta, idea block, nav, carousel)
 *            settles in together at 2.4 — one entrance, not a trickle
 *
 * The intro OWNS every reveal target in the initial viewport: it hides them
 * at t=0 while the overlay is still opaque and reveals them itself, marking
 * them [data-intro-owned] so ScrollReveals skips them. Binding them to
 * ScrollTrigger instead caused a real glitch: the curtain uncovers
 * bottom-up, so the carousel/meta were exposed in their natural state and
 * then snapped to hidden when the scroll system armed mid-curtain.
 *
 * Click accelerates the timeline (4×) rather than jump-cutting.
 * prefers-reduced-motion skips straight to the hero.
 */
export default function IntroLoader() {
  const [done, setDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    // Gate the intro on the client-side pathname to avoid server/client
    // rendering mismatches. If not on the root path, skip the intro.
    if (typeof window !== "undefined") {
      try {
        const fullPath = window.location.pathname || "/";
        const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
        const relative = base && fullPath.startsWith(base)
          ? fullPath.slice(base.length) || "/"
          : fullPath;
        if (relative !== "/") {
          setDone(true);
          return;
        }
      } catch (e) {
        // If anything goes wrong, fall back to showing the intro.
      }
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }

    const words = document.querySelectorAll<HTMLElement>("[data-hero-word]");

    // Claim every reveal target the curtain will uncover (anything whose top
    // edge starts inside the initial viewport). Marking happens synchronously
    // in this effect, before ScrollReveals binds, so ownership is race-free.
    const inView = (el: Element) =>
      el.getBoundingClientRect().top < window.innerHeight;
    const singles = gsap.utils
      .toArray<HTMLElement>("[data-reveal]")
      .filter(inView);
    const groups = gsap.utils
      .toArray<HTMLElement>("[data-reveal-group]")
      .filter(inView);
    const images = gsap.utils
      .toArray<HTMLElement>("[data-reveal-image]")
      .filter(inView);
    for (const el of [...singles, ...groups, ...images]) {
      el.setAttribute("data-intro-owned", "");
    }
    const groupChildren = groups.map(
      (g) => Array.from(g.children) as HTMLElement[],
    );
    const owned = [...singles, ...groupChildren.flat()];

    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    tlRef.current = tl;

    // Everything is visible in SSR; hidden only while the intro runs — and
    // only at t=0, while the opaque overlay covers the page, so nothing can
    // ever be seen snapping to its hidden state.
    tl.set(words, { y: 30, autoAlpha: 0, skewY: 5, filter: "blur(8px)" }, 0);
    tl.set(owned, REVEAL_FROM, 0);
    tl.call(() => images.forEach(setImageRevealFrom), [], 0);

    // Give the logo frame a more natural breath right before the collapse:
    // a quick 100% -> 120% pulse that lands directly into the square-shrink.
    tl.to(
      pillRef.current,
      {
        scale: 1.12,
        duration: 0.22,
        ease: "power1.inOut",
        transformOrigin: "center center",
      },
      0.95,
    );
    tl.to(
      pillRef.current,
      {
        scale: 1,
        duration: 0.18,
        ease: "power1.inOut",
        transformOrigin: "center center",
      },
      1.17,
    );

    // Hold ~1.2s, then collapse: text out first, box down to the bare mark.
    tl.to(textRef.current, { opacity: 0, duration: 0.2 }, 1.2);
    tl.to(
      pillRef.current,
      {
        width: 56,
        height: 56,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.5,
      },
      1.2,
    );

    // Curtain lifts from the bottom up over 0.9s; the mark rides with it.
    tl.to(pillRef.current, { y: -56, opacity: 0.35, duration: 0.9 }, 1.7);
    tl.to(
      overlayRef.current,
      { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9 },
      1.7,
    );

    // Liquid word reveal, starting 250ms before the curtain clears (2.6s).
    // Two tweens over the same targets/stagger: transforms settle with a
    // back-eased overshoot; blur/opacity resolve on a plain ease — GSAP can't
    // split easing per property inside one tween.
    tl.to(
      words,
      { y: 0, skewY: 0, duration: 0.9, ease: "back.out(1.7)", stagger: 0.05 },
      2.35,
    );
    tl.to(
      words,
      {
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.55,
        ease: "power2.out",
        stagger: 0.05,
      },
      2.35,
    );

    // All owned content enters together at 2.4 — singles as units, groups
    // with their usual 60ms child stagger. Same values/ease as ScrollReveals
    // so above- and below-fold reveals are indistinguishable.
    const revealVars = {
      ...REVEAL_TO,
      duration: REVEAL_DUR,
      ease: REVEAL_EASE,
      clearProps: REVEAL_CLEAR,
    };
    if (singles.length) tl.to(singles, { ...revealVars }, 2.4);
    for (const children of groupChildren) {
      tl.to(children, { ...revealVars, stagger: REVEAL_STAGGER }, 2.4);
    }
    for (const img of images) addImageRevealTo(tl, img, 2.4);

    // Below-fold content stays with ScrollReveals; let it bind now.
    tl.call(() => window.dispatchEvent(new Event("nh-intro-reveal")), [], 2.4);

    // Curtain is fully clipped at 2.6s — drop the overlay from the DOM while
    // the reveal tails finish on their own tweens.
    tl.call(() => setDone(true), [], 2.62);

    return () => {
      tl.kill();
      gsap.set(words, { clearProps: "all" });
      gsap.set(owned, { clearProps: "all" });
      for (const el of images) {
        gsap.set(el, { clearProps: "all" });
        const img = el.querySelector("img");
        if (img) gsap.set(img, { clearProps: "all" });
      }
      for (const el of [...singles, ...groups, ...images]) {
        el.removeAttribute("data-intro-owned");
      }
    };
  }, []);

  if (done) return null;

  return (
    <div
      id="intro-loader"
      ref={overlayRef}
      onClick={() => tlRef.current?.timeScale(4)}
      aria-hidden="true"
      data-cursor-theme="dark"
      className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-ink"
    >
      <div
        ref={pillRef}
        className="flex items-center justify-center overflow-hidden border border-white px-5 py-4"
      >
        <p
          ref={textRef}
          className="font-script text-[32px] leading-none tracking-wordmark whitespace-nowrap text-white"
        >
          Nahidul Islam.
        </p>
      </div>

      {/* Without JS the overlay could never exit — don't show it at all. */}
      <noscript>
        <style>{`#intro-loader{display:none}`}</style>
      </noscript>
    </div>
  );
}
