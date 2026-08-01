import Reveal from "../Reveal";
import MetaTable from "./MetaTable";

/**
 * Title hero (Figma `98:2` → "02 Title hero"): a large Instrument Serif
 * title, a smaller dimmed tagline beneath it (the same two-tone dim used on
 * the home hero's non-emphasized lines — 55% ink, CLAUDE.md), a hairline,
 * then the meta table. Title and tagline are two separate Figma text nodes
 * at different sizes, not one multi-size heading, so the "two-tone" here is
 * applied as title=full ink / tagline=dimmed rather than per-line within one
 * block.
 */
export default function TitleHero({
  title,
  tagline,
  role,
  timeline,
  category,
  year,
}: {
  title: string;
  tagline: string;
  role: string;
  timeline: string;
  category: string;
  year: string;
}) {
  return (
    <section className="px-gutter pt-16 pb-10 lg:px-gutter-lg lg:pt-20 lg:pb-14">
      <Reveal
        as="h1"
        className="text-[clamp(2.75rem,6vw,6rem)] leading-[0.95] text-ink"
      >
        {title}
      </Reveal>

      <Reveal
        as="p"
        className="font-display mt-2 text-[clamp(1.5rem,2.6vw,2.75rem)] leading-[1.1] tracking-display text-ink-dim uppercase lg:mt-4"
      >
        {tagline}
      </Reveal>

      <div className="mt-10 border-t border-line pt-8 lg:mt-14 lg:pt-10">
        <MetaTable
          role={role}
          timeline={timeline}
          category={category}
          year={year}
        />
      </div>
    </section>
  );
}
