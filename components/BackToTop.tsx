"use client";

import { scrollToTop } from "@/lib/scroll";

function ArrowUp() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M8 12.5V4M4.5 7.5L8 4l3.5 3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Not part of the Figma footer — a pure implementation addition. Styled to
 * match the site's one established button language instead of inventing a
 * new one: every other CTA (Hero's Discuss, Résumé's Download, UI Picker's
 * Play) is a solid bg-ink pill with btn-liquid — this is that same treatment,
 * just icon-only and round instead of pill-shaped with a label. The earlier
 * version (transparent, hairline border) matched none of those and read as
 * a different, unrelated widget bolted onto the footer.
 */
export default function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => scrollToTop()}
      aria-label="Back to top"
      className="btn-liquid group flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-page"
    >
      <ArrowUp />
    </button>
  );
}
