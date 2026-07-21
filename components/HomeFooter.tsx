import BackToTop from "./BackToTop";
import Reveal from "./Reveal";

/**
 * v2 home-page footer (Figma 96:151) — wordmark left, copyright + back-to-top
 * right. Back-to-top isn't in the Figma frame — a pure implementation add.
 *
 * Named HomeFooter, not Footer: components/Footer.tsx is the v1 component
 * still used by the stale /about and /work/[slug] routes (see CLAUDE.md —
 * those await their own v2 rebuild; not-found was already rebuilt onto v2
 * and reuses this component). Overwriting Footer.tsx here would silently
 * break those pages, which reference dead v1 tokens this file doesn't share
 * (v1's copy is "Nahid Here", not "Nahidul Islam.").
 *
 * The wordmark is plain static text, not a link — it carries no href, no
 * hover treatment. (It previously wrapped a Link with link-underline/hover
 * nudge, matching the Nav wordmark; that was a bug — Figma shows it as
 * inert branding here, not a navigation control.)
 */
export default function HomeFooter() {
  return (
    <footer className="border-t border-line">
      <Reveal
        group
        className="flex items-center justify-between px-gutter py-8 lg:px-gutter-lg"
      >
        <p className="font-script tracking-wordmark text-[32px] whitespace-nowrap text-ink">
          Nahidul Islam.
        </p>

        <div className="flex items-center gap-6">
          <p className="text-sm tracking-body whitespace-nowrap text-ink-muted">
            &copy; 2026 &mdash; Nahidul Islam
          </p>
          <BackToTop />
        </div>
      </Reveal>
    </footer>
  );
}
