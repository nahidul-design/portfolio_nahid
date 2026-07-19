import Reveal from "./Reveal";

/**
 * Quote (Figma 96:161). Instrument Serif at the dimmed 60% ink, with the
 * attribution in Barlow beneath — sentence case, so it can't be a heading
 * (the base layer uppercases those).
 *
 * NB: centred per the build request. The Figma frame has this block
 * left-aligned and full-width; flip `text-center`/`items-center` if the file
 * turns out to be the intended reference.
 */
export default function Quote() {
  return (
    <section
      aria-label="Quote"
      className="px-gutter py-20 lg:px-gutter-lg lg:py-28"
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
