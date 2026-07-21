import Link from "next/link";
import Reveal from "./Reveal";
import UIPickerBackground from "./UIPickerBackground";

/**
 * UI Picker promo (Figma 96:115) — first dark band on the page (bg-ink).
 * Centered copy, centered CTA below — re-pulled from Figma, which moved off
 * an earlier left-copy/right-arrow-button layout to this fully centered one
 * and dropped the squiggle arrow next to the button entirely. Links to
 * /404 — the actual /ui-picker game doesn't exist yet, so the CTA points at
 * the site's "under construction" page instead of a dead route.
 *
 * `data-cursor-theme="dark"` on the section tells the custom cursor
 * (Cursor.tsx) to swap to white here — its default ink colouring is
 * invisible against this background otherwise.
 *
 * The background photo (UIPickerBackground) sits at low opacity purely as
 * atmospheric texture behind the copy — it's chrome, not content, so it's
 * excluded from the reveal system (same call as the hover-only gradient
 * overlay on case study cards): unmask-and-settle on a full-bleed decorative
 * layer would fight the copy's own reveal instead of reading as one
 * entrance. It does get its own always-on ambient breathing + scroll
 * parallax, independent of the reveal system — see that component.
 */
function Gamepad() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="5.5" cy="8" r="1" fill="currentColor" stroke="none" />
      <path d="M5.5 6.5v3M4 8h3" strokeLinecap="round" />
      <circle cx="11" cy="7" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="9" r="0.75" fill="currentColor" stroke="none" />
      <path
        d="M3.5 5h9a2.5 2.5 0 0 1 2.45 3l-.6 2.9a1.8 1.8 0 0 1-3.16.75L10 10.25a1.5 1.5 0 0 0-1.13-.5H7.13a1.5 1.5 0 0 0-1.13.5l-1.19 1.4a1.8 1.8 0 0 1-3.16-.75L1.05 8A2.5 2.5 0 0 1 3.5 5Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function UIPicker() {
  return (
    <section
      aria-label="UI Picker"
      data-cursor-theme="dark"
      className="relative flex flex-col items-center gap-[40px] overflow-hidden bg-ink px-gutter py-20 text-center lg:px-gutter-lg lg:py-[160px]"
    >
      <UIPickerBackground src="/ui-picker/bg.png" />

      <Reveal
        group
        className="relative flex w-full flex-col items-center gap-3"
      >
        <p className="text-base tracking-normal text-white uppercase">
          Gameplay
        </p>
        <p className="font-display text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.15] tracking-[-0.01em] uppercase">
          <span className="text-white/60">Think you </span>
          <span className="text-white">have a good eye?</span>
        </p>
        <p className="max-w-[520px] text-base leading-[1.4] tracking-body text-white/60">
          UI Picker — five quick rounds of design judgment, with the
          reasoning revealed after each pick. About a minute.
        </p>
      </Reveal>

      {/* Plain wrapper, not the pill itself — see the contention rule in
          CLAUDE.md (also applied to the Hero and Résumé CTAs). */}
      <Reveal className="relative">
        <Link
          href="/404"
          data-cursor="Play"
          className="btn-liquid inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-base tracking-normal text-ink uppercase hover:opacity-85"
        >
          Play now
          <Gamepad />
        </Link>
      </Reveal>
    </section>
  );
}
