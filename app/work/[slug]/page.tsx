import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CopyRow from "@/components/case-study/CopyRow";
import NextProject from "@/components/case-study/NextProject";
import ScreenModule from "@/components/case-study/ScreenModule";
import TitleHero from "@/components/case-study/TitleHero";
import HomeFooter from "@/components/HomeFooter";
import Reveal from "@/components/Reveal";
import { withBasePath } from "@/lib/assets";
import {
  getNextProject,
  getProject,
  getProjectSlugs,
} from "@/lib/projects";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  return { title: project.title, description: project.overview };
}

/**
 * Case-study template (Figma `98:2`, verified against the five real project
 * frames at `260:2`: Test Taker, Bag Flyers, Relivery, Kotha, RevUp).
 *
 * No local nav here, same call as app/not-found.tsx — the root layout
 * already renders the global <Nav/> on every route. Figma's own case-study
 * nav swaps the Résumé link for a "← All work" back-link, but duplicating a
 * second nav just to match that would reintroduce the exact doubled-header
 * bug 404 was rebuilt to fix; one correct nav beats a pixel-exact one.
 */
export default async function WorkPage({ params }: Params) {
  const { slug } = await params;
  const [project, next] = await Promise.all([
    getProject(slug),
    getNextProject(slug),
  ]);

  if (!project) notFound();

  return (
    <>
      <main>
        <TitleHero
          title={project.title}
          tagline={project.tagline}
          role={project.role}
          timeline={project.timeline}
          category={project.category}
          year={project.year}
        />

        <Reveal image className="img-radius w-full overflow-hidden">
          <img
            src={withBasePath(project.coverImage)}
            alt={`${project.title} — cover`}
            className="aspect-[1440/920] h-auto w-full object-cover"
          />
        </Reveal>

        <CopyRow heading="Overview" divider={false}>
          {project.overview}
        </CopyRow>
        <CopyRow heading="The problem">{project.problem}</CopyRow>
        <CopyRow heading="What I did">{project.whatIDid}</CopyRow>

        {project.screens.map((screen, i) => (
          <ScreenModule
            key={screen.image}
            image={screen.image}
            caption={screen.caption}
            alt={`${project.title} — ${screen.caption || `screen ${i + 1}`}`}
          />
        ))}

        {next && (
          <NextProject
            slug={next.slug}
            title={next.title}
            coverImage={next.coverImage}
          />
        )}
      </main>

      <HomeFooter />
    </>
  );
}
