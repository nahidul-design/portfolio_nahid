import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export const PROJECT_CATEGORIES = [
  "dashboard",
  "landing",
  "saas",
  "webapp",
  "mobile",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export interface ProjectFrontmatter {
  title: string;
  category: ProjectCategory;
  createdFor: string;
  timeline: string;
  description: string;
  whatSolved: string;
  outcome: string;
  coverImage: string;
  detailImage: string;
  order: number;
}

export interface Project extends ProjectFrontmatter {
  slug: string;
  /** Raw MDX body, ready to hand to next-mdx-remote. */
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

function parse(slug: string, raw: string): Project {
  const { data, content } = matter(raw);

  for (const field of [
    "title",
    "category",
    "createdFor",
    "timeline",
    "description",
    "whatSolved",
    "outcome",
    "coverImage",
    "detailImage",
    "order",
  ] as const) {
    if (data[field] === undefined) {
      throw new Error(`content/projects/${slug}.mdx is missing "${field}"`);
    }
  }

  if (!PROJECT_CATEGORIES.includes(data.category)) {
    throw new Error(
      `content/projects/${slug}.mdx has category "${data.category}"; expected one of ${PROJECT_CATEGORIES.join(", ")}`,
    );
  }

  return { ...(data as ProjectFrontmatter), slug, content };
}

export async function getProjectSlugs(): Promise<string[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(CONTENT_DIR);
  } catch {
    return [];
  }

  return entries
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export async function getProject(slug: string): Promise<Project | null> {
  try {
    const raw = await fs.readFile(path.join(CONTENT_DIR, `${slug}.mdx`), "utf8");
    return parse(slug, raw);
  } catch {
    return null;
  }
}

export async function getAllProjects(): Promise<Project[]> {
  const slugs = await getProjectSlugs();
  const projects = await Promise.all(slugs.map(getProject));

  return projects
    .filter((p): p is Project => p !== null)
    .sort((a, b) => a.order - b.order);
}
