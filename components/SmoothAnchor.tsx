"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { scrollToHash } from "@/lib/scroll";

type Props = ComponentPropsWithoutRef<typeof Link> & { href: `#${string}` };

/**
 * Generic in-page anchor that routes through the shared Lenis instance
 * instead of a native instant hash-jump — every scroll on the site (wheel,
 * drag, CTA) goes through the same smoothing, so an anchor link shouldn't be
 * the one interaction that snaps. Kept as a real anchor (not a <button>) so
 * the href still works for no-JS, middle-click, and "open in new tab"; the
 * smooth scroll is progressive enhancement layered on top.
 *
 * Generalises what was a Contact-only "ContactLink" in v2 — v3's nav needs
 * four of these (intro/about/works/experience), not just one.
 *
 * Only intercepts the click when the target actually exists on THIS page.
 * Contact.tsx (and therefore these links) is now also reused on
 * /work/[slug] — those ids only exist on the home page, so unconditionally
 * preventDefault-ing here turned every one of them into a dead click on any
 * other route. When the target's missing, this falls through to a plain
 * navigation — `href` is rooted at `/` (not left as a bare `#hash`, which
 * Link would resolve against the CURRENT path, e.g. `/work/kotha#intro`,
 * not home) so it does a real navigation to home and lets Next's own
 * router scroll to the hash once that page mounts. Not Lenis-smoothed in
 * that fallback case, but working beats a silently broken link.
 *
 * `onClick` is composed, not overwritten: `{...rest}` spreads AFTER this
 * component's own `onClick` in JSX, so a caller-supplied `onClick` (e.g.
 * Nav's mobile panel closing itself on tap) would otherwise silently
 * replace the scroll/fallback logic above instead of running alongside it
 * — this called both, always.
 */
export default function SmoothAnchor({ href, children, onClick, ...rest }: Props) {
  return (
    <Link
      href={`/${href}`}
      onClick={(e) => {
        onClick?.(e);
        if (!document.querySelector(href)) return;
        e.preventDefault();
        scrollToHash(href);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
