import Link from "next/link";
import Reveal from "./Reveal";

/**
 * v2 home-page footer (Figma 96:151) — wordmark left, copyright right.
 *
 * Named HomeFooter, not Footer: components/Footer.tsx is the v1 component
 * still used by the stale /about, /work/[slug], and not-found routes (see
 * CLAUDE.md — those await their own v2 rebuild). Overwriting it here would
 * silently break those pages, which reference dead v1 tokens this file
 * doesn't share (v1's copy is "Nahid Here", not "Nahidul Islam.").
 */
export default function HomeFooter() {
  return (
    <footer className="border-t border-line">
      <Reveal
        group
        className="flex items-center justify-between px-gutter py-8 lg:px-gutter-lg"
      >
        <Link
          href="/"
          className="font-script text-2xl tracking-wordmark whitespace-nowrap text-ink"
        >
          Nahidul Islam.
        </Link>

        <p className="text-sm tracking-body whitespace-nowrap text-ink-muted">
          &copy; 2026 &mdash; Nahidul Islam
        </p>
      </Reveal>
    </footer>
  );
}
