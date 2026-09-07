"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import type { DotLottie } from "@lottiefiles/dotlottie-web";
import { useRef, useState } from "react";

/**
 * The 404 page's door-hanger illustration (Figma `65:512`, "Clip path
 * group") — Figma's own code export for this node is a pile of absolutely
 * positioned, individually-masked SVG fragments (its animation lives in
 * per-fragment keyframes, not a single asset); we use the real exported
 * Lottie file for it instead of hand-rebuilding that mask stack, since the
 * actual animation asset is more faithful than re-deriving it from static
 * frame positions.
 *
 * `size-full` on the wrapper (not the DotLottieReact canvas itself) — the
 * canvas fills whatever box its parent gives it, so the actual dimensions
 * live on the call site (not-found.tsx) via a single className, same as
 * every other image-shaped element on the site.
 *
 * Playback: plays once on load (`loop={false}`), then restarts from frame 0
 * on hover — including a hover that lands mid-playback (e.g. while it's
 * still easing out toward the end): that must cut the current play-through
 * off and restart immediately, not wait for it to finish. So `onMouseEnter`
 * unconditionally calls `stop()` (rewinds to frame 0, halting whatever was
 * still playing) then `play()` — there's no "wait for complete" branch here.
 *
 * `complete` is handled separately: it also rewinds to frame 0 (parking the
 * animation there once a play-through — the initial autoplay included —
 * finishes on its own, rather than sitting on its last frame). That keeps
 * a hover that lands AFTER natural completion from producing a visible
 * jump: the rewind already happened invisibly the moment it finished, so
 * `stop()` at that point is a same-frame no-op and `play()` just starts
 * cleanly. The interrupt case above is the one hover this can't make
 * invisible — restarting mid-motion is necessarily a hard cut, and that's
 * the point: the user asked for an instant restart there, not a wait.
 *
 * Reduced motion: the lazy useState initializer reads matchMedia
 * synchronously on first render (client-only component, so `window` is
 * always defined by the time this renders) rather than flipping it on
 * after a useEffect — an effect-based check would autoplay for one frame
 * before pausing, same class of bug QuoteBackground/Cursor avoid by only
 * ever starting their GSAP tweens inside an effect in the first place. The
 * same flag gates the hover-replay too, so a reduced-motion visitor never
 * gets motion from either path.
 */
export default function NotFoundIllustration() {
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const dotLottieRef = useRef<DotLottie | null>(null);

  const replay = () => {
    if (reducedMotion) return;
    const dotLottie = dotLottieRef.current;
    if (!dotLottie) return;
    dotLottie.stop();
    dotLottie.play();
  };

  return (
    <DotLottieReact
      src="/lottie/404.lottie"
      loop={false}
      autoplay={!reducedMotion}
      dotLottieRefCallback={(instance) => {
        dotLottieRef.current = instance;
        instance?.addEventListener("complete", () => instance.stop());
      }}
      onMouseEnter={replay}
      className="size-full"
    />
  );
}
