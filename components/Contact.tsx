import CopyEmailLink from "./CopyEmailLink";
import Reveal from "./Reveal";

/**
 * Contact (Figma 96:132) — giant "Let's talk.", click-to-copy email,
 * LinkedIn/WhatsApp with icons. `id="contact"` is load-bearing: Nav's and
 * Hero's Contact links both smooth-scroll here (see lib/scroll.ts).
 *
 * Two-step stagger (email, then the icon row) rather than three individual
 * items — mirrors Figma's own grouping, where LinkedIn+WhatsApp sit inside
 * one "Frame 16" container distinct from the email block.
 *
 * LinkedIn/WhatsApp get a distinct treatment from the rest of the site's
 * links: no underline — a soft rounded pill background fades in behind
 * icon+label, the icon does a small scale+rotate, and the whole pill lifts
 * 1px. All of it lives directly on the <a> (safe here: the reveal-group's
 * actual target is the wrapping icon-row <div>, not these two <a> tags —
 * they're grandchildren, so GSAP never writes inline styles to them).
 * The negative margin/padding pairing lets the pill extend past the icon
 * and label without shifting surrounding layout. One combined arbitrary
 * `transition-[...]` utility, not separate transition-colors +
 * transition-transform stacked — see the btn-liquid note in CLAUDE.md for
 * why stacking Tailwind transition-* utilities is unsafe.
 * CopyEmailLink keeps the underline treatment, unchanged.
 */
function LinkedInIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/contact/linkedin.svg" alt="" aria-hidden className="size-5" />
  );
}

function WhatsAppIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/contact/whatsapp.svg" alt="" aria-hidden className="size-5" />
  );
}

export default function Contact() {
  return (
    <section
      id="contact"
      aria-label="Contact"
      className="flex flex-col gap-10 px-gutter pt-24 pb-20 lg:gap-16 lg:px-gutter-lg lg:pt-32 lg:pb-28"
    >
      <Reveal
        as="h2"
        className="text-[clamp(3rem,10vw,7.5rem)] leading-none tracking-[-0.02em]"
      >
        Let&rsquo;s talk.
      </Reveal>

      <Reveal
        group
        className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between"
      >
        <CopyEmailLink />

        <div className="flex items-center gap-8">
          <a
            href="https://www.linkedin.com/in/muhammad-nahidul-islam-48041a120/"
            target="_blank"
            rel="noopener noreferrer"
            className="group/li -mx-3 -my-2 flex items-center gap-2 rounded-full px-3 py-2 text-ink-muted transition-[color,background-color,transform] duration-300 hover:-translate-y-px hover:bg-ink/[0.07] hover:text-ink"
          >
            <span className="inline-block transition-transform duration-300 group-hover/li:scale-110 group-hover/li:-rotate-[5deg]">
              <LinkedInIcon />
            </span>
            <span className="text-base tracking-body">LinkedIn</span>
          </a>

          <a
            href="https://wa.me/8801827007441"
            target="_blank"
            rel="noopener noreferrer"
            className="group/wa -mx-3 -my-2 flex items-center gap-2 rounded-full px-3 py-2 text-ink-muted transition-[color,background-color,transform] duration-300 hover:-translate-y-px hover:bg-ink/[0.07] hover:text-ink"
          >
            <span className="inline-block transition-transform duration-300 group-hover/wa:scale-110 group-hover/wa:-rotate-[5deg]">
              <WhatsAppIcon />
            </span>
            <span className="text-base tracking-body">WhatsApp</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
