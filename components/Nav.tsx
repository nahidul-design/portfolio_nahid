"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import IconMark from "./IconMark";
import SmoothAnchor from "./SmoothAnchor";

const LINKS = [
  { href: "#intro", label: "intro" },
  { href: "#about", label: "About" },
  { href: "#works", label: "my works" },
  { href: "#experience", label: "experience" },
] as const satisfies readonly { href: `#${string}`; label: string }[];

function ArrowDown() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-3.5 shrink-0"
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

/** Streamline Phosphor's "List" glyph — the mobile menu trigger (Figma
 *  `79:256`). Toggles to an X (same stroke weight/size) when the panel is
 *  open, rather than leaving the trigger's own state ambiguous. */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
    >
      {open ? (
        <path
          d="M3 3l10 10M13 3L3 13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M2 4h12M2 8h12M2 12h12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

/**
 * Tracks which section is currently "current" for the nav's active-link
 * highlight. IntersectionObserver with a squashed rootMargin (roughly a
 * horizontal band a bit above center) rather than the naive "any visible
 * section" — with a band that generous a tall section like Projects stays
 * "visible" for most of the scroll, so without narrowing the trigger zone
 * two adjacent sections can both report intersecting and the wrong one
 * wins depending on observer callback order.
 */
function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        // Topmost intersecting section wins when several qualify at once.
        visible.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
        );
        setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/**
 * v3 nav (Figma `32:9` desktop / `79:249` mobile) — replaces the giant
 * script wordmark with the small icon-mark + Chivo Mono lockup.
 *
 * Mobile is a genuinely different layout, not just a squeezed desktop one:
 * Figma's mobile nav (`79:249`, 390×56, `p-[20px]`) shows ONLY the wordmark
 * and a hamburger trigger — no inline links, no Résumé pill. An earlier
 * pass kept the links row `hidden` below `sm` but left the Résumé pill
 * always visible, which doesn't match (Figma hides that too). There's no
 * Figma frame for the panel's OPEN state, so its content/order (the same 4
 * links + Résumé pill, stacked) and styling (matching the tab/pill language
 * already established elsewhere) are this implementation's own call, not a
 * pixel-sourced one — everything else on this component IS Figma-sourced.
 */
export default function Nav() {
  const active = useActiveSection(LINKS.map((l) => l.href.slice(1)));
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the panel on an actual route/hash change so it doesn't stay open
  // behind whatever the tapped link navigated to.
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-page/90 backdrop-blur-sm">
      <div
        data-reveal-group
        className="page-container flex items-center justify-between p-5 lg:px-gutter-lg lg:py-6"
      >
        <Link href="/" className="group flex items-center gap-2">
          <IconMark className="size-3.5 transition-transform duration-300 group-hover:-translate-y-px" />
          <span className="font-mono text-[14px] leading-none font-light uppercase transition-transform duration-300 group-hover:-translate-y-px">
            Nahidul Islam.
          </span>
        </Link>

        <nav className="flex items-center gap-6 lg:gap-8">
          <div className="hidden items-center gap-8 lg:flex">
            {LINKS.map((link) => (
              <SmoothAnchor
                key={link.href}
                href={link.href}
                className={`link-underline font-mono text-[14px] leading-none uppercase transition-colors duration-300 hover:text-ink ${
                  link.href.slice(1) === active ? "text-ink" : "text-ink/60"
                }`}
              >
                {link.label}
              </SmoothAnchor>
            ))}
          </div>

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener"
            className="btn-liquid hidden items-center gap-1.5 rounded-full bg-ink px-4 py-2 font-mono text-[14px] leading-none text-page uppercase lg:flex"
          >
            Resume
            <ArrowDown />
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex items-center justify-center text-ink lg:hidden"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </nav>
      </div>

      {menuOpen && (
        <nav
          aria-label="Mobile"
          className="flex flex-col gap-1 border-t border-line px-5 py-4 lg:hidden"
        >
          {LINKS.map((link) => (
            <SmoothAnchor
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`border-b border-line py-3 font-mono text-[14px] leading-none uppercase last:border-none ${
                link.href.slice(1) === active ? "text-ink" : "text-ink/60"
              }`}
            >
              {link.label}
            </SmoothAnchor>
          ))}

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener"
            className="btn-liquid mt-3 flex items-center justify-center gap-1.5 self-start rounded-full bg-ink px-4 py-2 font-mono text-[14px] leading-none text-page uppercase"
          >
            Resume
            <ArrowDown />
          </a>
        </nav>
      )}
    </header>
  );
}
