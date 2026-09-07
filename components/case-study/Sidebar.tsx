import EyebrowTag from "../EyebrowTag";
import Reveal from "../Reveal";

/**
 * Case-study sidebar (Figma `77:2`/`77:126`, node `77:66`/`77:190`) — the
 * fixed-width left column: an eyebrow pill, title, one descriptive
 * paragraph, and a client/scope/year/timeline meta list.
 *
 * This is NOT the old v2 template's 4-column meta table (MetaTable.tsx,
 * deleted) — Figma's new meta block is a vertical stack of label/value
 * rows, each preceded by its own hairline, not a grid. Different enough
 * shape that reusing the old component would have fought the new layout
 * more than it helped.
 *
 * 443px fixed width matches Figma exactly at desktop (`lg:w-[443px]`), but
 * stacks to full width above the screen column on smaller viewports — the
 * same label-left/content-right → stack-on-mobile pattern already used by
 * About.tsx and Resume.tsx, not a new convention.
 *
 * Tagline is 24px at desktop (`77:71`, up from an original 16px) but only
 * 20px at mobile (`81:471`) — a real per-breakpoint difference, not the
 * same size scaled down. Both sizes fall under the site-wide rule that any
 * 20px/24px text runs at 135% line-height, so `leading-[1.35]` applies
 * flat across the responsive size change instead of needing its own split.
 *
 * Meta-list row gap is 16px at mobile (`81:472`'s own `gap-[16px]`) vs the
 * 24px desktop already had (`77:72`) — narrow enough a mismatch that it's
 * easy to miss if you're not diffing the two frames directly.
 */
const META_FIELDS = [
  { key: "client", label: "Client" },
  { key: "scope", label: "Scope" },
  { key: "year", label: "Year" },
  { key: "timeline", label: "Timeline" },
] as const;

type MetaValues = Record<(typeof META_FIELDS)[number]["key"], string>;

export default function Sidebar({
  title,
  tagline,
  ...meta
}: { title: string; tagline: string } & MetaValues) {
  return (
    <div className="flex w-full flex-col gap-12 lg:w-[443px] lg:shrink-0">
      <Reveal group className="flex flex-col items-start gap-4">
        <EyebrowTag>{`my works / ${title.toLowerCase()}`}</EyebrowTag>

        <h1 className="text-[clamp(2rem,4vw,3rem)] leading-[1.2] tracking-display text-ink">
          {title}
        </h1>

        <p className="text-xl leading-[1.35] tracking-display text-ink-muted lg:text-2xl">
          {tagline}
        </p>
      </Reveal>

      <Reveal group className="flex flex-col gap-4 lg:gap-6">
        {META_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-4 lg:gap-6">
            <span className="h-px w-full bg-line" />
            <div className="flex items-center justify-between font-mono text-[14px] leading-none text-ink uppercase">
              <span>{label}</span>
              <span>{meta[key]}</span>
            </div>
          </div>
        ))}
      </Reveal>
    </div>
  );
}
