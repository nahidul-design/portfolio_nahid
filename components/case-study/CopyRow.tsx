import Reveal from "../Reveal";

/**
 * The label-left/copy-right row shared by Overview, The problem, and What I
 * did (Figma `98:2`, nodes `04/05/06`) — same idiom as Resume.tsx's
 * Experience/Education rows, reused here rather than inventing a new
 * two-column pattern. `divider` draws the hairline Figma places above every
 * row except the first (Overview sits directly under the cover image).
 */
export default function CopyRow({
  heading,
  children,
  divider = true,
}: {
  heading: string;
  children: string;
  divider?: boolean;
}) {
  return (
    <div className="px-gutter lg:px-gutter-lg">
      <div
        className={`py-14 lg:py-20 ${divider ? "border-t border-line" : ""}`}
      >
        <Reveal
          group
          className="flex w-full flex-col items-start gap-4 sm:flex-row sm:gap-6"
        >
          <p className="w-[180px] shrink-0 font-display text-2xl leading-[1.2] tracking-[-0.01em] text-ink uppercase">
            {heading}
          </p>
          <p className="flex-1 text-base tracking-body text-ink-muted text-pretty">
            {children}
          </p>
        </Reveal>
      </div>
    </div>
  );
}
