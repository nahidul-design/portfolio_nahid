import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/**
 * v3 schema (Figma `77:2` "Case study multiple image" / `77:126` "Case
 * study website") — replaces the v2 schema entirely, not layered on top of
 * it. v2 had role/category/overview/problem/whatIDid mapped onto a
 * template with a separate cover image, a 4-column meta table, and three
 * Overview/Problem/What-I-did copy rows; none of that exists in this
 * design. The new template is just: a sidebar (title, tagline, a
 * client/scope/year/timeline meta list) next to a flowing column of
 * screen images, then a "More Projects" section. See CLAUDE.md's old
 * "Content model" note — this is that redesign.
 *
 * `client` is a real gap in the current content, not an oversight: none of
 * the 5 projects have a disclosed client name on file, so every one of
 * them carries the literal placeholder "Confidential" until real names are
 * supplied — don't invent a company name to fill this in.
 *
 * There is deliberately no `layout`/`type` field distinguishing Figma's
 * "multiple image" vs. "single website image" variants — the template
 * (components/case-study/ScreenStack.tsx) infers it purely from
 * `screens.length` (1 → renders as one tall block, 2+ → a stacked column
 * with captions), so a project's shape can never drift out of sync with a
 * separate flag nobody remembered to update.
 *
 * `coverImage` no longer exists as its own field — the new template has no
 * separate hero-cover section, so each project's former cover image is
 * just `screens[0]` now (kept caption-less, since it never had one), with
 * the original 3 screens following it.
 */
export interface ProjectScreen {
  image: string;
  /** Optional — the lead image (former coverImage) has none. */
  caption?: string;
}

export interface ProjectFrontmatter {
  title: string;
  /** Shown as the one descriptive paragraph next to the title — v2's
   *  separate overview/problem/whatIDid fields are gone; there's nowhere
   *  in this design for them to render. */
  tagline: string;
  client: string;
  scope: string;
  timeline: string;
  year: string;
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
  "client",
  "scope",
  "timeline",
  "year",
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
 * The next `count` projects after `slug`, wrapping around past the last one
 * back to the first — matches v2's single-`getNextProject` wraparound
 * behaviour, just returning 2 for Figma's "More Projects" grid instead of
 * 1. A collection with `count` or fewer OTHER projects still returns
 * however many actually exist rather than padding or repeating one.
 */
export async function getNextProjects(
  slug: string,
  count: number,
): Promise<Project[]> {
  const all = await getAllProjects();
  if (all.length <= 1) return [];

  const index = all.findIndex((p) => p.slug === slug);
  if (index === -1) return [];

  const n = Math.min(count, all.length - 1);
  return Array.from({ length: n }, (_, i) => all[(index + i + 1) % all.length]);
}
