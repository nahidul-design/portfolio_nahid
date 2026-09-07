import Link from "next/link";
import NotFoundIllustration from "@/components/NotFoundIllustration";

/**
 * Custom 404 — rebuilt onto v3 against Figma's own "404 Page" frame
 * (`64:220`), replacing the stale v2 build this page carried (a plain
 * "404." heading + copy, styled with `font-display`/`tracking-body` —
 * neither utility exists in v3's globals.css, so it rendered unstyled; and
 * it reused HomeFooter.tsx, which is *also* still v2-token-based, for the
 * same reason).
 *
 * No local nav here: the root layout already renders the global <Nav/> on
 * every route, so a page-local wordmark+links header would double up.
 *
 * This whole page is a single, non-scrolling viewport — Figma's frame is
 * exactly 1024px tall, i.e. designed to BE one screen (nav + illustration +
 * message/button, centered, plus a bottom info row), not a page you scroll
 * through. `<main>` is sized to `100dvh` minus the global nav's own real
 * height (measured live at 78.8px, not just trusted from Figma's node), so
 * nothing here ever needs a scrollbar regardless of viewport height —
 * content vertically centers in the space between the nav and the bottom
 * row via `flex-1` + `justify-center`, and the illustration itself scales
 * against `vh` (not just `vw`) so short viewports shrink it before they'd
 * ever force a scroll.
 *
 * Content/positions below are the latest Figma pull. This page has churned
 * a few times as Figma itself changed — earlier passes had different copy
 * ("Hang tight! We're still building this page."), a top-right "since
 * 2021" label, and a rotated "(UI/UX) design" side label (mirroring Hero's
 * own decorative pair). Figma has since moved "since 2021" into the bottom
 * info row below (paired with a copyright line that didn't exist before),
 * reworded the message, and dropped the "(UI/UX) design" label entirely —
 * don't reintroduce any of that if this page comes up again; pull fresh
 * rather than trusting this comment or an old screenshot.
 *
 * Content width matches every home section: `page-container` (1440 cap) +
 * `px-gutter`/`lg:px-gutter-lg` pins this at the same 1376px content box
 * used everywhere else.
 *
 * Nothing on this page uses the shared <Reveal> fade-blur-up at all — a
 * deliberate, documented exception to the site-wide standing convention.
 * Two independent problems ruled it out, not just one:
 *
 *   1. This page never scrolls, so a scroll-gated reveal is structurally
 *      wrong for it — the bottom info row sits past REVEAL_START's "top
 *      85%" line already on load, with no scroll ever available to bring
 *      it back into range, so its "once" ScrollTrigger could never fire at
 *      all (fixed for a while with a `data-reveal-immediate` opt-out, which
 *      still exists in Reveal.tsx/ScrollReveals.tsx for other pages that
 *      might need it).
 *   2. Even with that fixed, the message/button still visibly faded in
 *      over REVEAL_DUR (1.2s) on every load — reported as "sometimes grey,
 *      sometimes dark" depending purely on whether it was looked at during
 *      that window or after. For a normal scrolling section a slow fade is
 *      the intended feel; for a 404's ONLY escape hatch, spending over a
 *      second half-legible before the visitor can act on it is a real UX
 *      cost with no offsetting benefit, since this page is never scrolled
 *      into view gradually — it's just there, fully, the instant it loads.
 *
 * So everything here renders at full opacity immediately, same as the
 * illustration next to it (which was already exempted for its own, separate
 * reason — see NotFoundIllustration's own comment below).
 *
 * Illustration container is 600px at desktop — bumped up from an earlier
 * 420px (Figma's own frame size) because the source .lottie file itself
 * bakes in a lot of internal padding around the actual door-hanger artwork,
 * so the visible drawing read too small at its "real" frame size; 600px is
 * a deliberate compensation for that padding, not a Figma measurement.
 * `41.7vw` keeps the same proportional-to-viewport-width behavior as
 * before (600/1440), clamped at 600px so it never grows past the intended
 * size on an ultrawide monitor. The `min(41.7vw,54vh)` height term is a
 * safety net for short viewports ONLY; tune the vh multiplier by testing
 * actual rendered size + overflow at both a normal desktop height (~900px)
 * and a short one (~650px) — a value chosen from pure math without
 * checking both ends is exactly how this got mis-tuned three times before
 * (too small at 24vh; a real overflow at 58vh once the pb-12 below was
 * added; landed on 54vh, which gives 583px — not the full 600 — at 1080p,
 * and zero overflow at 650px tall).
 *
 * Mobile (Figma `81:559`) does NOT follow that same vw/vh formula — it's a
 * flat 350px there (not a smaller point on the same curve), which happens
 * to equal that frame's own content width. `w-full max-w-[350px]` at
 * mobile reproduces that (fluid down on anything narrower than 350px, so
 * it never overflows on a small phone, but caps at exactly 350 otherwise)
 * before switching to the desktop clamp formula at `lg:`.
 *
 * Gap from the illustration down to the message/button is 0 at both
 * breakpoints, per Figma — the centered block (image + text) is one flex
 * column with no gap between the image and the text group at all; the
 * visual breathing room there comes entirely from the artwork's own
 * bottom whitespace inside its box, not a CSS gap. An earlier pass added
 * an explicit 32px gap here to compensate for the same padding-in-the-
 * asset problem from the *other* direction (before the image was sized up
 * to 600/350px) — with the image at its correct size now, stacking
 * another gap on top double-compensated and pushed the text too far down.
 *
 * Message is a flat 20px at BOTH breakpoints (`text-xl`, confirmed against
 * both the desktop and mobile frames independently — not a case of one
 * being a scaled point on the other) — an earlier pass used a
 * `clamp(1rem,3.5vw,1.25rem)` here assuming it needed fluid scaling, which
 * actually under-shot to 16px at mobile widths instead of Figma's real
 * flat 20px.
 *
 * Message→button gap is genuinely different per breakpoint though: 20px
 * mobile (`81:697`) vs. 24px desktop (`gap-5 lg:gap-6`) — the one place
 * this page's text/spacing DOESN'T just collapse to one shared value.
 *
 * The centered block's own trailing space (pushing the visible content
 * above dead-center, matching Figma's `top: calc(50% - Npx)` positioning)
 * is `pb-12` (48px) at desktop and `pb-[108px]` at mobile — derived from
 * Figma's mobile block sitting 54px above true center: for a
 * `justify-center` flex parent, the trailing padding needed to shift the
 * VISIBLE content (excluding that padding) N px above center is `2×N`,
 * since the padding only pulls the centered midpoint up by half of
 * itself. Verify this the same way if it ever needs re-deriving — it's
 * not a value you can eyeball correctly.
 *
 * Bottom padding on `<main>` is 80px (`pb-20`) — this is the space after
 * the bottom info row, before the actual viewport edge.
 *
 * The bottom info row drops "since ○ 2021" below `sm` — Figma's mobile
 * frame (`81:559`) only has the copyright line, centered, no "since 2021"
 * at all. `sm:` and up keep both (unchanged from before).
 *
 * The illustration is deliberately NOT a <Reveal> target — every other
 * reveal target on the site is static until GSAP's tween touches it, but
 * this one wraps a continuously-autoplaying Lottie canvas (its own render
 * loop starts the moment it mounts). Wrapping it in the shared reveal
 * reproducibly left it stuck at its hidden "from" state forever (confirmed
 * across many fresh loads: every OTHER reveal on this page resolved fine,
 * only this one never did) — the same class of bug SmoothScroll.tsx's "one
 * shared ticker" rule already guards against elsewhere: two independently
 * driven animation loops (GSAP's ticker and the Lottie player's own)
 * fighting over frame budget on one element. Since the canvas is already
 * animating on its own, a fade-in on top of it is redundant anyway — this
 * isn't a shortcut, it's the correct call for an element that supplies its
 * own motion.
 */
function ArrowDown() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M8 3v8.5M4.5 8.5L8 12l3.5-3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NotFound() {
  return (
    <main className="page-container relative flex h-[calc(100dvh-79px)] flex-col px-gutter pt-8 pb-20 lg:px-gutter-lg">
      <div className="flex flex-1 flex-col items-center justify-center pb-[108px] text-center lg:pb-12">
        <div className="aspect-square w-full max-w-[350px] lg:max-w-none lg:w-[clamp(140px,min(41.7vw,54vh),600px)]">
          <NotFoundIllustration />
        </div>

        <div className="flex flex-col items-center gap-5 lg:gap-6">
          <p className="max-w-[720px] text-xl leading-[1.4] tracking-display text-ink">
            Ugh! This page is currently unavailable.
          </p>

          <Link
            href="/"
            className="btn-liquid inline-flex items-center gap-4 rounded-full border border-ink px-6 py-4 font-mono text-[14px] leading-none text-ink uppercase hover:bg-ink hover:text-page"
          >
            <div className="-rotate-90 -scale-y-100 flex-none">
              <ArrowDown />
            </div>
            back to home
          </Link>
        </div>
      </div>

      {/* Bottom info row — new in this Figma pass: "since 2021" moved down
          here from its old top-right spot, paired with a copyright line
          that wasn't there before. Figma has both on one baseline, one at
          each gutter edge — that only has room on wider screens, so mobile
          stacks them centered instead of squeezing two 14px lines against
          each edge of a narrow viewport. */}
      <div className="flex shrink-0 flex-col items-center justify-center gap-2 font-mono text-[14px] leading-none text-ink uppercase sm:flex-row sm:justify-between sm:gap-4">
        <p className="hidden sm:block">since ○ 2021</p>
        <p>Copyright © nahidul islam 2026</p>
      </div>
    </main>
  );
}
