import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MoreProjects from "@/components/case-study/MoreProjects";
import ScreenStack from "@/components/case-study/ScreenStack";
import Sidebar from "@/components/case-study/Sidebar";
import Contact from "@/components/Contact";
import { getNextProjects, getProject, getProjectSlugs } from "@/lib/projects";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  return { title: project.title, description: project.tagline };
}

/**
 * Case-study template — rebuilt onto v3 against Figma's `77:2` ("Case
 * study multiple image") and `77:126` ("Case study website") frames,
 * replacing the old v2 template entirely (TitleHero/CopyRow/MetaTable/
 * ScreenModule/NextProject — all deleted, all styled with v2 tokens like
 * `font-display`/`text-ink-dim`/`tracking-body` that don't exist in v3's
 * globals.css, same broken-on-arrival problem app/not-found.tsx had before
 * ITS v2→v3 rebuild).
 *
 * No local nav here, same call as app/not-found.tsx — the root layout
 * already renders the global <Nav/> on every route. Figma's own case-study
 * nav swaps the Résumé link for a "← All work" back-link, but duplicating
 * a second nav just to match that would reintroduce the exact doubled-
 * header bug 404 was rebuilt to fix; one correct nav beats a pixel-exact
 * one.
 *
 * Footer is the real <Contact/> component, not HomeFooter — Figma's own
 * case-study Contact section (`77:26`/`77:150`) is pixel-identical to the
 * home page's, and HomeFooter.tsx is the OTHER still-stale v2 component
 * (confirmed dead tokens earlier this session); reusing the real one fixes
 * that leftover rather than perpetuating it here too.
 *
 * Sidebar + ScreenStack sit in one responsive flex row (stacks to a single
 * column below `lg`, same convention as About.tsx/Resume.tsx) with a flat
 * 48px gap (`gap-12`) at every breakpoint — deliberately not the site's
 * usual mobile/desktop split, per feedback that the column gap read as too
 * tight at desktop. MoreProjects is a separate, full-width section below
 * that row, NOT indented under the sidebar — matches Figma's own absolute
 * layout, where "More Projects"
 * spans the full 1376px content width rather than starting where the
 * screen column does.
 *
 * Height is entirely content-driven — no fixed page height anywhere. A
 * project with one screen and a project with five produce genuinely
 * different total heights; ScreenStack's images are `h-auto` at their own
 * aspect ratio for the same reason (see that file's own comment).
 */
export default async function WorkPage({ params }: Params) {
  const { slug } = await params;
  const [project, nextProjects] = await Promise.all([
    getProject(slug),
    getNextProjects(slug, 2),
  ]);

  if (!project) notFound();

  return (
    <>
      <main className="page-container flex flex-col gap-12 px-gutter pt-10 pb-20 lg:flex-row lg:px-gutter-lg lg:pt-16 lg:pb-28">
        <Sidebar
          title={project.title}
          tagline={project.tagline}
          client={project.client}
          scope={project.scope}
          year={project.year}
          timeline={project.timeline}
        />

        <ScreenStack screens={project.screens} title={project.title} />
      </main>

      {nextProjects.length > 0 && <MoreProjects projects={nextProjects} />}

      <Contact />
    </>
  );
}
