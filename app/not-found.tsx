import Link from "next/link";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <main className="mx-auto flex max-w-6xl flex-col items-start px-gutter py-section sm:px-gutter-lg sm:py-section-lg">
        <p className="text-2xs tracking-ui text-faint">404</p>

        <h1 className="mt-8 text-3xl sm:text-4xl">
          This page doesn&apos;t exist.
        </h1>

        <Link
          href="/"
          className="group mt-10 inline-flex items-baseline gap-2 text-base tracking-ui text-ink transition-colors duration-[var(--motion-slow)] ease-editorial hover:text-accent"
        >
          <svg
            viewBox="0 0 12 12"
            aria-hidden="true"
            className="h-2.5 w-2.5 shrink-0 translate-y-0.5 transition-transform duration-[var(--motion-slow)] ease-editorial group-hover:-translate-x-0.5"
          >
            <path
              d="M10 6H1M5.5 1.5L1 6l4.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="square"
            />
          </svg>
          Back home
        </Link>
      </main>
      <Footer />
    </>
  );
}
