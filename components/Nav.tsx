import Link from "next/link";
import NavLink from "./NavLink";

// Flip to true once the UI Picker page exists.
const SHOW_UI_PICKER = false;

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-page/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-6 px-gutter pt-10 pb-6 sm:px-gutter-lg sm:pt-14">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight whitespace-nowrap transition-opacity duration-[var(--motion-slow)] ease-editorial hover:opacity-70 sm:text-xl"
        >
          Nahid Here
        </Link>

        <nav className="flex items-baseline gap-6 sm:gap-9">
          <NavLink href="/about">About Me</NavLink>
          <NavLink href="https://www.linkedin.com/" external>
            LinkedIn
          </NavLink>

          {SHOW_UI_PICKER && <NavLink href="/ui-picker">UI Picker</NavLink>}

          <a
            href="/resume.pdf"
            download
            className="group relative inline-flex items-baseline gap-1.5 text-base tracking-ui text-ink transition-colors duration-[var(--motion-slow)] ease-editorial hover:text-accent"
          >
            <span className="hidden sm:inline">Download Resume</span>
            <span className="sm:hidden">Resume</span>

            <svg
              viewBox="0 0 12 12"
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 translate-y-0.5 transition-transform duration-[var(--motion-slow)] ease-editorial group-hover:translate-y-1"
            >
              <path
                d="M6 1v9M2.5 6.5L6 10l3.5-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="square"
              />
            </svg>

            {/* Hairline sits under the label only; accent is the one flourish. */}
            <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-100 bg-line transition-colors duration-[var(--motion-slow)] ease-editorial group-hover:bg-accent" />
          </a>
        </nav>
      </div>
    </header>
  );
}
