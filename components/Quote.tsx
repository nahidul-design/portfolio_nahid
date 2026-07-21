import Reveal from "./Reveal";

/**
 * Quote (Figma 96:161). Instrument Serif at the dimmed 60% ink, with the
 * attribution in Barlow beneath — sentence case, so it can't be a heading
 * (the base layer uppercases those).
 *
 * NB: centred per the build request. The Figma frame has this block
 * left-aligned and full-width; flip `text-center`/`items-center` if the file
 * turns out to be the intended reference.
 *
 * Padding is deliberately asymmetric — not a Figma value, tuned entirely by
 * eye against the rendered page. Bottom went through several rounds of
 * optical correction against the quotation glyph's visual weight (×1.10,
 * then ×1.2). Top was then cut by 50% on top of that: combined with
 * CaseStudies' own bottom padding just above, the un-halved top gap read as
 * too much stacked whitespace between the two sections.
 */
export default function Quote() {
  return (
    <section
      aria-label="Quote"
      className="px-gutter pt-[38px] pb-[106px] lg:px-gutter-lg lg:pt-[53px] lg:pb-[148px]"
    >
      <figure className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <Reveal
          as="blockquote"
          className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.2] tracking-[-0.01em] text-ink-muted"
        >
          &ldquo;Design is not just what it looks like and feels like. Design is
          how it works&rdquo;
        </Reveal>

        <Reveal
          as="figcaption"
          className="text-2xl tracking-body text-ink"
        >
          &mdash;Steve Jobs
        </Reveal>
      </figure>
    </section>
  );
}
