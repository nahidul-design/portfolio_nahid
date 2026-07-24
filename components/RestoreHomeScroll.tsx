"use client";

import { useLayoutEffect } from "react";
import { HOME_SCROLL_KEY } from "./ScrollRestoration";

/**
 * Mounted on the home page only — this mounts every time the route becomes
 * "/", whether that's a true browser back-button pop, clicking a "back
 * home" link on a case-study page, or a fresh forward navigation. All three
 * are indistinguishable from here and don't need to be: CaseStudies.tsx
 * saves scroll position only when leaving Home for a case study, so finding
 * a saved value on mount always means "the user is coming back," regardless
 * of mechanism.
 *
 * No reload check needed here — ScrollRestoration (root layout) already
 * clears the saved key on an actual reload, before this ever runs.
 */
export default function RestoreHomeScroll() {
  useLayoutEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(HOME_SCROLL_KEY);
    } catch {
      return;
    }

    if (saved !== null) {
      window.scrollTo(0, Number(saved));
      try {
        sessionStorage.removeItem(HOME_SCROLL_KEY);
      } catch {
        /* already restored — a leftover key just means a harmless re-read */
      }
    }
  }, []);

  return null;
}
