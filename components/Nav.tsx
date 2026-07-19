import Link from "next/link";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-page/90 backdrop-blur-sm">
      <div
        data-reveal-group
        className="flex items-center justify-between px-gutter py-8 lg:px-gutter-lg"
      >
        <Link
          href="/"
          className="font-script text-2xl tracking-wordmark whitespace-nowrap text-ink"
        >
          Nahidul Islam.
        </Link>

        {/* Hidden on mobile — it crowds the wordmark against the contact link. */}
        <p className="hidden text-sm tracking-body whitespace-nowrap text-ink-muted md:block">
          Dhaka, Bangladesh — GMT+6
        </p>

        <Link
          href="#contact"
          className="group flex flex-col gap-1 whitespace-nowrap"
        >
          {/* Uppercase UI labels carry no negative tracking — see globals.css. */}
          <span className="text-base tracking-normal text-ink uppercase">
            Contact
          </span>
          {/* Rule is always present in the design, not a hover affordance. */}
          <span className="h-px w-full bg-ink transition-opacity duration-300 group-hover:opacity-60" />
        </Link>
      </div>
    </header>
  );
}
