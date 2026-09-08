import BackToTop from "./BackToTop";
import CopyEmailLink from "./CopyEmailLink";
import IconMark from "./IconMark";
import Reveal from "./Reveal";
import SmoothAnchor from "./SmoothAnchor";

const LINKS = [
  { href: "#intro", label: "intro" },
  { href: "#about", label: "About" },
  { href: "#works", label: "my works" },
  { href: "#experience", label: "experience" },
] as const satisfies readonly { href: `#${string}`; label: string }[];

/**
 * v3 Contact + Footer, merged into one section (Figma `32:72`) — v2 kept
 * these as two separate components (Contact.tsx + HomeFooter.tsx); v3's
 * Figma file has no separate footer at all, just this one band on the new
 * `--color-surface` (#f7f8fa) background. `id="contact"` is still
 * load-bearing — the Nav/Hero/Résumé CTAs all smooth-scroll here.
 *
 * The outer <section> stays a genuine full-bleed band (the surface colour
 * runs edge to edge); the inner page-container div is what caps the actual
 * content at 1376px and centers it — same split every full-bleed-background
 * section on the page needs.
 *
 * Internal rhythm at desktop (icon+copy block → hairline → social row)
 * runs on a flat 80px gap via the `lg:gap-20` on the wrapper below — that
 * part's unchanged (verified fresh against `121:669`, still 3 top-level
 * sections at desktop since the nav sits INLINE with the message there,
 * not as its own row — see the nav's own comment further down). Mobile
 * got real extra breathing room in a later Figma pass (`127:1030`,
 * re-pulled after direct feedback that it read as too congested): the
 * message/email block, the nav row, the hairline, and the social row are
 * now four genuinely separate mobile sections each 48px apart (`gap-12`
 * on the wrapper), not the old flat 32px — a real increase, not a
 * rounding change, confirmed against the fresh frame's own y-offsets.
 * No top padding of its own — the gap from Quote comes from `<main>`'s
 * shared gap-40 (see app/page.tsx), same as every other section boundary.
 * Contact IS the footer though, and nothing follows it for a gap to apply
 * against, so it keeps its own bottom padding — 80px at desktop, matching
 * the frame's own bottom inset, and 24px at mobile (unchanged in this
 * pass — Figma's mobile frame still ends on that same real, much smaller
 * value, not the 80px scaled down). The icon mark above the copy is 32px
 * at mobile vs. 76px at desktop, also unchanged this pass.
 *
 * Side gutter is also its own value here, not the shared 32px
 * `px-gutter-lg` every other section uses — Figma's Contact frame insets
 * its content 40px at desktop (1360px content in a 1440px frame), not the
 * 32px/1376px every other section uses. Verified against the frame's own
 * x-offset, not assumed continuity with the rest of the page.
 *
 * Paragraph is ALL 60%-muted ink now, not two-tone — Figma `79:423` styles
 * both halves of "I'd love to hear from you! / Whether you have a
 * project…" identically at `rgba(27,30,31,0.6)`; an earlier pass had the
 * first half at full ink opacity, which no longer matches.
 *
 * Nav is now rendered TWICE — once `hidden lg:flex` inline beside the
 * message (desktop), once `lg:hidden` as its own standalone block (mobile)
 * — rather than one shared `<nav>` repositioned with CSS, because Figma's
 * fresh mobile frame (`127:1030`) doesn't just reflow the same row
 * narrower: it's a structurally separate section now, sitting 48px below
 * the message/email block and 48px above the hairline, where before it
 * was grouped tightly with the message. A single shared element can't
 * carry two different gap values to two different neighbours depending on
 * breakpoint without becoming two elements — same "genuinely different
 * arrangement, not a narrower one" call this codebase already makes
 * elsewhere (e.g. MoreProjects.tsx's own mobile/desktop split). It still
 * wraps via `flex-wrap` on mobile if it ever needs to (four items fit one
 * row at 350px with room to spare per the fresh frame, but nothing forces
 * that).
 *
 * Back-to-top drops its "Back to top" text label at mobile (Figma `79:450`
 * has just the bare 32px icon control, no text next to it) and the button
 * itself shrinks from 40px to that same 32px.
 *
 * No background fill — verified fresh against Figma, this section's own
 * container carries no bg color at all (plain page white). An earlier pass
 * sampled a #f7f8fa "surface" tone here that Figma no longer has (or never
 * actually had; either way it's gone from the current file).
 *
 * HomeFooter.tsx is NOT deleted — app/not-found.tsx (the 404 page, left
 * untouched per this pass's scope) still renders it.
 */
export default function Contact() {
  return (
    <section id="contact" aria-label="Contact">
      <div className="page-container flex flex-col gap-12 px-gutter pb-6 lg:gap-20 lg:px-10 lg:pb-20">
        <div className="flex flex-col gap-6 lg:gap-8">
          <Reveal>
            <IconMark className="size-8 lg:size-[76px]" />
          </Reveal>

          <Reveal
            group
            className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-start lg:gap-10"
          >
            <div className="flex w-full max-w-[676px] flex-col gap-6 lg:gap-16">
              <p className="text-[clamp(1.5rem,3vw,2rem)] leading-[1.2] tracking-display text-ink-muted">
                I&rsquo;d love to hear from you! Whether you have a project in
                mind or just want to say hi, feel free to reach out.
              </p>

              <CopyEmailLink />
            </div>

            {/* Desktop only — nav sits inline beside the message here, same
                row (Figma `121:669`'s "Frame 33" is inline with the message
                block, not a separate row, at this breakpoint). Mobile gets
                its own standalone copy below instead of this one just
                un-hiding, since Figma's mobile frame (`127:1030`) now
                structures it as a genuinely separate block — its own
                48px gaps before AND after, not grouped with the message —
                not a case of the same row simply wrapping narrower. */}
            <nav className="hidden lg:flex lg:flex-nowrap lg:gap-8">
              {LINKS.map((link) => (
                <SmoothAnchor
                  key={link.href}
                  href={link.href}
                  className="link-underline font-mono text-[14px] leading-none text-ink/60 uppercase transition-colors duration-300 hover:text-ink"
                >
                  {link.label}
                </SmoothAnchor>
              ))}
            </nav>
          </Reveal>
        </div>

        {/* Mobile only — see the desktop nav's own comment above for why
            this is a separate block instead of one nav shared across
            breakpoints. */}
        <Reveal className="lg:hidden">
          <nav className="flex flex-wrap items-center gap-x-8 gap-y-6">
            {LINKS.map((link) => (
              <SmoothAnchor
                key={link.href}
                href={link.href}
                className="link-underline font-mono text-[14px] leading-none text-ink/60 uppercase transition-colors duration-300 hover:text-ink"
              >
                {link.label}
              </SmoothAnchor>
            ))}
          </nav>
        </Reveal>

        <Reveal as="span" className="h-px w-full bg-line" />

        <Reveal group className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 lg:gap-8">
            <a
              href="https://www.linkedin.com/in/muhammad-nahidul-islam-48041a120/"
              target="_blank"
              rel="noopener noreferrer"
              className="group/li -mx-3 -my-2 flex items-center gap-2 rounded-full px-3 py-2 font-mono text-[14px] leading-none text-ink uppercase transition-[color,background-color,transform] duration-300 hover:-translate-y-px hover:bg-ink/[0.07]"
            >
              <span className="inline-block transition-transform duration-300 group-hover/li:scale-110 group-hover/li:-rotate-[5deg]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/contact/linkedin-brand.svg"
                  alt=""
                  aria-hidden
                  className="size-5"
                />
              </span>
              LinkedIn
            </a>

            <a
              href="https://wa.me/8801827007441"
              target="_blank"
              rel="noopener noreferrer"
              className="group/wa -mx-3 -my-2 flex items-center gap-2 rounded-full px-3 py-2 font-mono text-[14px] leading-none text-ink uppercase transition-[color,background-color,transform] duration-300 hover:-translate-y-px hover:bg-ink/[0.07]"
            >
              <span className="inline-block transition-transform duration-300 group-hover/wa:scale-110 group-hover/wa:-rotate-[5deg]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/contact/whatsapp-brand.svg"
                  alt=""
                  aria-hidden
                  className="size-5"
                />
              </span>
              WhatsApp
            </a>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[14px] leading-none text-ink uppercase lg:inline">
              Back to top
            </span>
            <BackToTop className="size-8 lg:size-10" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
