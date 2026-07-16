import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Footer from "@/components/Footer";
import { getProject, getProjectSlugs } from "@/lib/projects";

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
  const project = await getProject(slug);

  if (!project) notFound();

  return (
    <>
      <main className="mx-auto max-w-6xl px-gutter py-section sm:px-gutter-lg sm:py-section-lg">
        <h1 className="text-3xl sm:text-4xl">{project.title}</h1>

        <MDXRemote source={project.content} />
      </main>
      <Footer />
    </>
  );
}
