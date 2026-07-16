import Link from "next/link";

type Size = "base" | "xs";

const SIZE_CLASS: Record<Size, string> = {
  base: "text-base", // 16px — required size for the primary nav row
  xs: "text-2xs", // 12px — the floor, used for the footer's lighter links
};

/**
 * Text link with an underline that wipes in from the left on hover and out
 * to the right on leave. Reused by Nav (16px) and Footer (12px floor).
 */
export default function NavLink({
  href,
  external = false,
  size = "base",
  children,
}: {
  href: string;
  external?: boolean;
  size?: Size;
  children: React.ReactNode;
}) {
  const className =
    `relative inline-block ${SIZE_CLASS[size]} tracking-ui text-ink-soft ` +
    "transition-colors duration-[var(--motion-slow)] ease-editorial hover:text-ink " +
    "after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-right " +
    "after:scale-x-0 after:bg-current after:transition-transform " +
    "after:duration-[var(--motion-slow)] after:ease-editorial " +
    "hover:after:origin-left hover:after:scale-x-100";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
