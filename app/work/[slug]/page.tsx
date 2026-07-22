import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Footer from "@/components/Footer";
import ProjectNav from "@/components/ProjectNav";
import { withBasePath } from "@/lib/assets";
import {
  CATEGORY_LABELS,
  getAllProjects,
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

  return { title: project.title, description: project.description };
}

export default async function WorkPage({ params }: Params) {
  const { slug } = await params;
  const [project, allProjects] = await Promise.all([
    getProject(slug),
    getAllProjects(),
  ]);

  if (!project) notFound();

  const index = allProjects.findIndex((p) => p.slug === slug);
  const prev = index > 0 ? allProjects[index - 1] : null;
  const next = index < allProjects.length - 1 ? allProjects[index + 1] : null;

  return (
    <>
      <main className="mx-auto max-w-6xl px-gutter py-section sm:px-gutter-lg sm:py-section-lg">
        <div className="lg:flex lg:items-start lg:gap-16">
          {/* Fixed-width, flexible-height panel — tall screenshots run their
              full length instead of being cropped. */}
          <div className="lg:w-[440px] lg:shrink-0 xl:w-[520px]">
            <img
              src={withBasePath(project.detailImage)}
              alt={`${project.title} — detail screenshot`}
              className="h-auto w-full rounded-sm border border-line"
            />
          </div>

          <div className="mt-10 min-w-0 flex-1 lg:mt-0">
            <p className="text-2xs tracking-ui text-faint">
              {CATEGORY_LABELS[project.category]}
            </p>

            <h1 className="mt-3 text-3xl sm:text-4xl">{project.title}</h1>

            <p className="mt-3 text-sm tracking-ui text-muted">
              {project.createdFor} · {project.timeline}
            </p>

            <p className="mt-8 text-md text-ink-soft text-pretty">
              {project.description}
            </p>

            <div className="mt-10 space-y-8">
              <div>
                <p className="text-2xs tracking-ui text-faint">
                  What we solved
                </p>
                <p className="mt-2 text-base text-ink-soft text-pretty">
                  {project.whatSolved}
                </p>
              </div>

              <div>
                <p className="text-2xs tracking-ui text-faint">Outcome</p>
                <p className="mt-2 text-base text-ink-soft text-pretty">
                  {project.outcome}
                </p>
              </div>
            </div>
          </div>
        </div>

        {project.content.trim() && (
          <div className="mt-16 max-w-2xl space-y-4 text-base text-ink-soft tracking-ui text-pretty [&_p]:mt-4 [&_p]:first:mt-0">
            <MDXRemote source={project.content} />
          </div>
        )}

        <ProjectNav prev={prev} next={next} />
      </main>
      <Footer />
    </>
  );
}
