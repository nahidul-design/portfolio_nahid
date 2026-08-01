import Link from "next/link";
import Reveal from "../Reveal";
import { withBasePath } from "@/lib/assets";

/** Same glyph as Nav/Resume's download arrow, rotated to point right — the
 *  sitewide convention for a directional CTA arrow (CLAUDE.md). */
function ArrowDown() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
    >
      <path
        d="M8 3v8.5M4.5 8.5L8 12l3.5-3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * "NEXT CASE STUDY" (Figma `98:2`, "11 Next project"): label, next title,
 * a "go to next" pill, and a preview thumbnail of that next project's cover.
 * The list wraps — lib/projects.getNextProject() sends the last project back
 * to the first, matching Figma's own RevUp → Test Taker link.
 */
export default function NextProject({
  slug,
  title,
  coverImage,
}: {
  slug: string;
  title: string;
  coverImage: string;
}) {
  return (
    <section className="border-t border-line px-gutter py-20 lg:px-gutter-lg lg:py-28">
      <Link
        href={`/work/${slug}`}
        data-cursor="View"
        className="group flex flex-col-reverse items-start gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16"
      >
        <div className="flex flex-col items-start gap-6">
          <Reveal
            as="p"
            className="text-base tracking-normal text-ink-muted uppercase"
          >
            Next case study
          </Reveal>

          <Reveal
            as="h2"
            className="text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] text-ink"
          >
            {title}
          </Reveal>

          <Reveal>
            <span className="btn-liquid inline-flex items-center gap-2 rounded-full bg-ink px-6 py-4 text-base tracking-normal text-page uppercase">
              Go to next
              <div className="-rotate-90 flex-none">
                <ArrowDown />
              </div>
            </span>
          </Reveal>
        </div>

        <Reveal
          image
          className="img-radius w-full overflow-hidden lg:w-[588px] lg:shrink-0"
        >
          <div className="aspect-[588/420] w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]">
            <img
              src={withBasePath(coverImage)}
              alt={`${title} — preview`}
              className="h-full w-full object-cover"
            />
          </div>
        </Reveal>
      </Link>
    </section>
  );
}
