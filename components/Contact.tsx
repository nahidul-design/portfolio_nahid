import Reveal from "./Reveal";

/**
 * Contact (Figma 96:132) — giant "Let's talk.", email with a hover-reveal
 * underline, LinkedIn/WhatsApp with icons. `id="contact"` is load-bearing:
 * Nav's Contact link points at `#contact`.
 *
 * Two-step stagger (email, then the icon row) rather than three individual
 * items — mirrors Figma's own grouping, where LinkedIn+WhatsApp sit inside
 * one "Frame 16" container distinct from the email block.
 *
 * The underline lives on a child span with its own hover transition, never
 * on the <a> itself — the <a> is what the reveal-group animates, and putting
 * a same-property CSS transition directly on a reveal target is the
 * contention bug from the Discuss button. (This mirrors Nav's Contact link,
 * whose rule is a child span for the same reason.)
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
        <a
          href="mailto:nahidul.design@gmail.com"
          data-cursor="view"
          className="group/email flex flex-col items-start gap-1.5"
        >
          <span className="text-2xl tracking-body text-ink">
            nahidul.design@gmail.com
          </span>
          <span className="h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-300 group-hover/email:scale-x-100" />
        </a>

        <div className="flex items-center gap-8">
          <a
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group/li flex items-center gap-2"
          >
            <LinkedInIcon />
            <span className="text-base tracking-body text-ink-muted transition-colors duration-300 group-hover/li:text-ink">
              LinkedIn
            </span>
          </a>

          {/* wa.me placeholder — no phone number provided yet to build a
              real deep link, so this stays "#" rather than shipping a wrong
              or broken external URL. */}
          <a href="#" className="group/wa flex items-center gap-2">
            <WhatsAppIcon />
            <span className="text-base tracking-body text-ink-muted transition-colors duration-300 group-hover/wa:text-ink">
              WhatsApp
            </span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
