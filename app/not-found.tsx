import Link from "next/link";
import HomeFooter from "@/components/HomeFooter";
import Reveal from "@/components/Reveal";

/**
 * Custom 404 (Figma 99:27) — v2 rebuild. No local <header> here: the root
 * layout (app/layout.tsx) already renders <Nav /> globally on every route,
 * so this page used to double up — its own wordmark+Contact header stacked
 * on top of the site-wide nav. Rendering just <main> + <HomeFooter/> and
 * letting the global Nav own the top of the page fixes that; it means this
 * page shows the standard wordmark/location/Résumé nav rather than the
 * Figma-specific wordmark+Contact variant, but a single correct nav beats a
 * pixel-exact duplicate one.
 *
 * Reuses HomeFooter rather than standing up a third footer variant; it's
 * already v2-token-based and carries no home-specific logic beyond its own
 * copy. This replaces the old page, which imported the dead v1 Footer/
 * NavLink components and referenced tokens (text-2xs, tracking-ui, ease-
 * editorial) that don't exist in the v2 design system — it rendered broken.
 */
function ArrowLeft() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-1"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M13 8H3M6.5 3.5L2 8l4.5 4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function NotFound() {
  return (
    <>
      <main className="flex flex-col items-center gap-6 px-gutter py-24 text-center lg:px-gutter-lg lg:py-32">
        <Reveal
          as="h1"
          className="font-display text-[clamp(6rem,20vw,14rem)] leading-[0.9] tracking-[-0.02em] text-ink"
        >
          404.
        </Reveal>

        <Reveal
          as="p"
          className="max-w-[520px] text-base leading-[1.4] tracking-body text-ink-muted"
        >
          This page is currently under construction and will be
          <br />
          launched on <span className="text-ink">July 25th at 16:00 UTC.</span>
        </Reveal>

        <Reveal>
          <Link
            href="/"
            className="group mt-4 inline-flex items-center gap-2 text-base tracking-normal text-ink uppercase"
          >
            <ArrowLeft />
            Back home
          </Link>
        </Reveal>
      </main>

      <HomeFooter />
    </>
  );
}
