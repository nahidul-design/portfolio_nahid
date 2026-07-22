import Link from "next/link";

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

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-page/90 backdrop-blur-sm">
      <div
        data-reveal-group
        className="flex items-center justify-between px-gutter py-5 lg:px-gutter-lg"
      >
        {/* group-hover on a child span, not hover: on the <a> itself: this
            <a> is a direct child of the reveal-group above and GSAP writes
            its transform/opacity during entrance. A hover state living
            directly on the same element re-smooths those writes for as
            long as the cursor sits there — the Discuss-button bug.
            No link-underline here (unlike the Résumé link) — the wordmark
            reads as a logo/mark, not a text link, so it keeps the subtle
            lift nudge but not the underline draw. */}
        <Link
          href="/"
          className="group text-[32px] whitespace-nowrap text-ink"
        >
          <span className="font-script tracking-wordmark inline-block transition-transform duration-300 group-hover:-translate-y-px">
            Nahidul Islam.
          </span>
        </Link>

        {/* Hidden on mobile — it crowds the wordmark against the résumé link. */}
        <p className="hidden text-sm tracking-body whitespace-nowrap text-ink-muted md:block">
          Dhaka, Bangladesh — GMT+6
        </p>

        {/* Same PDF-viewer behaviour as the résumé section's download pill —
            opens the real file directly, no /résumé route to build. Already
            full ink per Figma (no muted state), so only the underline-draw
            and nudge apply; there's no color to shift. */}
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener"
          className="link-underline group flex items-center gap-1.5 whitespace-nowrap text-ink transition-transform duration-150 active:scale-95"
        >
          <span className="text-base tracking-normal uppercase transition-transform duration-300 group-hover:-translate-y-px">
            Résumé
          </span>
          <ArrowDown />
        </a>
      </div>
    </header>
  );
}
