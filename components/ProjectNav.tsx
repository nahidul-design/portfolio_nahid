import Link from "next/link";

type ProjectLink = { slug: string; title: string } | null;

const ArrowLeft = () => (
  <svg
    viewBox="0 0 12 12"
    aria-hidden="true"
    className="h-2.5 w-2.5 shrink-0 transition-transform duration-[var(--motion-slow)] ease-editorial group-hover:-translate-x-0.5"
  >
    <path
      d="M10 6H1M5.5 1.5L1 6l4.5 4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
    />
  </svg>
);

const ArrowRight = () => (
  <svg
    viewBox="0 0 12 12"
    aria-hidden="true"
    className="h-2.5 w-2.5 shrink-0 transition-transform duration-[var(--motion-slow)] ease-editorial group-hover:translate-x-0.5"
  >
    <path
      d="M2 6h9M6.5 1.5L11 6l-4.5 4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
    />
  </svg>
);

/**
 * Prev/Next project pager. Non-wrapping — the first project has no prev,
 * the last has no next. Renders nothing if neither side exists (a single
 * project in the whole collection).
 */
export default function ProjectNav({
  prev,
  next,
}: {
  prev: ProjectLink;
  next: ProjectLink;
}) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Project navigation"
      className="mt-section flex items-start justify-between gap-8 border-t border-line pt-10"
    >
      <div className="min-w-0">
        {prev && (
          <Link href={`/work/${prev.slug}`} className="group inline-block">
            <span className="flex items-baseline gap-1.5 text-2xs tracking-ui text-faint transition-colors duration-[var(--motion-slow)] ease-editorial group-hover:text-accent">
              <ArrowLeft />
              Prev
            </span>
            <span className="mt-1.5 block text-md tracking-ui text-ink transition-colors duration-[var(--motion-slow)] ease-editorial group-hover:text-accent sm:text-lg">
              {prev.title}
            </span>
          </Link>
        )}
      </div>

      <div className="min-w-0 text-right">
        {next && (
          <Link href={`/work/${next.slug}`} className="group inline-block">
            <span className="flex items-baseline justify-end gap-1.5 text-2xs tracking-ui text-faint transition-colors duration-[var(--motion-slow)] ease-editorial group-hover:text-accent">
              Next
              <ArrowRight />
            </span>
            <span className="mt-1.5 block text-md tracking-ui text-ink transition-colors duration-[var(--motion-slow)] ease-editorial group-hover:text-accent sm:text-lg">
              {next.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
