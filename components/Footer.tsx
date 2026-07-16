import NavLink from "./NavLink";

export default function Footer() {
  return (
    <footer className="mt-section border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-gutter py-10 sm:flex-row sm:items-center sm:justify-between sm:px-gutter-lg">
        <p className="text-2xs tracking-ui text-faint">
          &copy; {new Date().getFullYear()} Nahid Here
        </p>

        <div className="flex items-center gap-7">
          <NavLink href="/about" size="xs">
            About Me
          </NavLink>
          <NavLink href="https://www.linkedin.com/" external size="xs">
            LinkedIn
          </NavLink>
        </div>
      </div>
    </footer>
  );
}
