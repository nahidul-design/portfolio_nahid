import Reveal from "./Reveal";
import ToolIcon from "./ToolIcon";

/**
 * Tools (Figma 175:2, "05 Tools") — re-pulled from Figma after the first
 * pass didn't match: this is a two-column layout (title left, rows right),
 * not a Résumé-style label-left/rows-right table, and every icon is a real
 * full-colour brand asset exported directly from the file — not a
 * simple-icons substitute or a muted placeholder square. The sixteen PNGs
 * in public/tools/ are those exact Figma exports.
 *
 * Layout, verified against node 175:2: outer `p-[120px]`, inner row
 * `gap-[24px]` between the "Tools I use" heading (flex-1, Instrument Serif
 * 48px) and the rows column (flex-1, `gap-[32px]`). Each row is
 * `items-center justify-between`: a 24px Instrument Serif label on the
 * left, an icon cluster (`gap-[12px]`, 32px tall) on the right. A 1px
 * `bg-line` hairline sits between rows.
 *
 * Icon identities were confirmed by inspecting the individual exports at
 * full resolution (not the icon-library heuristics from the first pass):
 * Design — Figma, Framer, Photoshop, Illustrator. AI & Creative — Claude
 * (the coral asterisk mark), an unidentified blue bar-chart mark, ChatGPT,
 * Magnific. Process — Plane, ClickUp, Loom, Miro. Research — Maze,
 * Pinterest, and two unidentified marks. The three I couldn't confidently
 * name render with `label` omitted on `ToolIcon`, which renders them
 * `aria-hidden` rather than asserting a guessed brand name.
 */
type Tool = {
  label?: string;
  src: string;
  /** Defaults to size-8 (32px square) in ToolIcon; only set for the two
   *  assets that are genuinely narrower than 32px (no side padding in the
   *  source export) or that carry a rounded-corner app-icon treatment. */
  className?: string;
};

const ROWS: { label: string; tools: Tool[] }[] = [
  {
    label: "Design",
    tools: [
      { label: "Figma", src: "/tools/design-1.png", className: "h-8 w-[22px]" },
      { label: "Framer", src: "/tools/design-2.png" },
      { label: "Photoshop", src: "/tools/design-3.png" },
      { label: "Illustrator", src: "/tools/design-4.png" },
    ],
  },
  {
    label: "AI & Creative",
    tools: [
      { label: "Claude", src: "/tools/ai-1.png" },
      { src: "/tools/ai-2.png" },
      { label: "ChatGPT", src: "/tools/ai-3.png", className: "size-8 overflow-hidden rounded-[6px]" },
      { label: "Magnific", src: "/tools/ai-4.png" },
    ],
  },
  {
    label: "Process",
    tools: [
      { label: "Plane", src: "/tools/process-1.png" },
      { label: "ClickUp", src: "/tools/process-2.png", className: "h-8 w-7" },
      { label: "Loom", src: "/tools/process-3.png", className: "size-8 overflow-hidden rounded-[6px]" },
      { label: "Miro", src: "/tools/process-4.png" },
    ],
  },
  {
    label: "Research",
    tools: [
      { label: "Maze", src: "/tools/research-1.png" },
      { label: "Pinterest", src: "/tools/research-2.png" },
      { src: "/tools/research-3.png" },
      { src: "/tools/research-4.png", className: "size-8 overflow-hidden rounded-[6px]" },
    ],
  },
];

export default function Tools() {
  return (
    <section
      aria-label="Tools"
      className="flex flex-col px-gutter py-4 lg:px-gutter-lg lg:py-4"
    >
      <div className="flex w-full flex-col items-start gap-6 lg:flex-row lg:gap-6">
        <Reveal
          as="h2"
          className="flex-1 text-[48px] leading-[1.05] tracking-[-0.02em]"
        >
          Tools I use
        </Reveal>

        <div className="flex w-full flex-1 flex-col gap-8">
          {ROWS.map((row, i) => (
            <div key={row.label} className="flex flex-col gap-8">
              {i > 0 && <span className="h-px w-full bg-line" />}
              <div className="flex w-full items-center justify-between">
                <Reveal
                  as="p"
                  className="font-display text-2xl leading-[1.2] tracking-[-0.01em] text-ink uppercase"
                >
                  {row.label}
                </Reveal>

                <Reveal group className="flex items-center gap-3">
                  {row.tools.map((tool) => (
                    <ToolIcon
                      key={tool.src}
                      label={tool.label}
                      className={tool.className}
                    >
                      <img
                        src={tool.src}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </ToolIcon>
                  ))}
                </Reveal>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
