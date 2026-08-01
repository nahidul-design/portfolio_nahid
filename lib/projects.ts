import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/**
 * v2 schema — replaces the v1 fields (category/whatSolved/detailImage/etc.),
 * which were designed around the old single-panel work page. This one maps
 * 1:1 onto the case-study template's sections (Figma `98:2`, verified against
 * the five real frames at node `260:2`): title hero + tagline, a four-column
 * meta table, three copy rows (Overview/Problem/What I did), and a run of
 * full-width screen modules. See CLAUDE.md's "Content model" note — this is
 * the schema it said still needed designing.
 */
export interface ProjectScreen {
  image: string;
  caption: string;
}

export interface ProjectFrontmatter {
  title: string;
  tagline: string;
  role: string;
  timeline: string;
  category: string;
  year: string;
  coverImage: string;
  overview: string;
  problem: string;
  whatIDid: string;
  screens: ProjectScreen[];
  order: number;
}

export interface Project extends ProjectFrontmatter {
  slug: string;
  /** Raw MDX body — currently unused by the template but kept for parity
   *  with the loader shape; process notes could render here later. */
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

const REQUIRED_FIELDS = [
  "title",
  "tagline",
  "role",
  "timeline",
  "category",
  "year",
  "coverImage",
  "overview",
  "problem",
  "whatIDid",
  "screens",
  "order",
] as const;

function parse(slug: string, raw: string): Project {
  const { data, content } = matter(raw);

  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined) {
      throw new Error(`content/projects/${slug}.mdx is missing "${field}"`);
    }
  }

  if (!Array.isArray(data.screens) || data.screens.length === 0) {
    throw new Error(`content/projects/${slug}.mdx "screens" must be a non-empty array`);
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

/**
 * Next project, wrapping around to the first past the last — matches the
 * Figma file itself: RevUp's "NEXT CASE STUDY" points back to Test Taker,
 * not nowhere. A single-project collection returns null (nothing to link to).
 */
export async function getNextProject(slug: string): Promise<Project | null> {
  const all = await getAllProjects();
  if (all.length <= 1) return null;

  const index = all.findIndex((p) => p.slug === slug);
  if (index === -1) return null;

  return all[(index + 1) % all.length];
}
