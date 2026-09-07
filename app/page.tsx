import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import ProjectsGrid from "@/components/ProjectsGrid";
import Quote from "@/components/Quote";
import RestoreHomeScroll from "@/components/RestoreHomeScroll";
import Resume from "@/components/Resume";

/**
 * Home — v3 (see CLAUDE.md). Section order per the current Figma file:
 * Hero → About → Projects grid → Résumé → Quote → Contact (Contact now
 * carries the footer too — see its own comment for why HomeFooter isn't
 * used here anymore).
 *
 * Résumé and Quote swapped from an earlier pass — Figma moved Résumé's
 * frame ahead of Quote's (verified by y-position: Résumé now starts before
 * Quote, not after).
 *
 * Tools, UI Picker, and PenguinSlot are gone — none of the three appear
 * anywhere in the v3 file. IntroLoader lives in the root layout, not here.
 *
 * Section-to-section spacing is a flat gap here, NOT padding owned by each
 * section — Figma's own frames confirm every section boundary (Hero photo→
 * About, About→Projects, Résumé→Quote, Quote→Contact) sits exactly 160px
 * apart at desktop, with no section carrying its own top/bottom padding.
 * Sections themselves only ever set side (gutter) padding now; the vertical
 * rhythm lives in this one `gap-40` (160px) instead of being duplicated as
 * py-* on every section and having to stay in sync by hand. Mobile uses
 * gap-20 (80px) — Figma's frame is desktop-only, so this halves the
 * desktop value rather than being pulled from a verified mobile spec.
 * Contact is the one exception: it's the page's footer, so it keeps its
 * own bottom padding (nothing follows it for a gap to apply against).
 *
 * Hero returns a single wrapping element (not a bare fragment) specifically
 * so it counts as ONE flex child here — its own section and its photo band
 * are two siblings internally with an intentional negative-margin overlap
 * between them, and letting THIS gap land between those two as well would
 * both double up the spacing and fight the overlap.
 */
export default function HomePage() {
  return (
    <main className="flex flex-col gap-20 lg:gap-40">
      <RestoreHomeScroll />
      <Hero />
      <About />
      <ProjectsGrid />
      <Resume />
      <Quote />
      <Contact />
    </main>
  );
}
