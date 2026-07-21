"use client";

import { useLayoutEffect } from "react";

export const HOME_SCROLL_KEY = "nh-home-scroll-y";

/**
 * Mounted once in the root layout. The root layout only mounts on a true
 * full page load (initial visit or reload) — client-side <Link> navigation
 * between routes doesn't remount it — so this effect is naturally scoped to
 * exactly the cases where "was this a reload?" is the right question.
 *
 * Forcing scroll-restoration to manual is what stops the browser's own
 * automatic restore-on-reload, which is what let a mid-scroll refresh
 * reopen wherever the user last was instead of the top. This used to be set
 * via an inline `<script>` (both a raw JSX tag and `next/script` with
 * `beforeInteractive` were tried) so the assignment would win a theoretical
 * race against Next's own router init before hydration — but in this
 * project's React/Next versions, ANY inline script rendered through React
 * (Server Component or Client Component, next/script or raw JSX) triggers
 * "Encountered a script tag while rendering React component" as a console
 * error. A `useLayoutEffect` here runs before paint, which in practice is
 * early enough, and a real console error on every load is a worse cost than
 * the small theoretical risk of losing that race.
 *
 * On an actual reload we then force scroll-to-top ourselves and clear any
 * saved home-scroll position — a stale one shouldn't leak into an unrelated
 * later visit.
 *
 * The home<->case-study round trip is handled separately, in
 * RestoreHomeScroll (mounted on the home page) + the save-on-click in
 * CaseStudies.tsx — that's a route-level concern, not a page-load one.
 */
export default function ScrollRestoration() {
  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const nav = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;

    if (nav?.type === "reload") {
      window.scrollTo(0, 0);
      try {
        sessionStorage.removeItem(HOME_SCROLL_KEY);
      } catch {
        /* sessionStorage unavailable — nothing to clear */
      }
    }
  }, []);

  return null;
}
