"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { scrollToHash } from "@/lib/scroll";

type Props = Omit<ComponentPropsWithoutRef<typeof Link>, "href">;

/**
 * `href="#contact"` with a Lenis-smooth-scroll onClick. Kept as a real
 * anchor (not a <button>) so the href still works for no-JS, middle-click,
 * and "open in new tab" — the smooth scroll is progressive enhancement, not
 * the only path to Contact. A separate client island (not inlined at each
 * call site) so Nav/Hero stay server components.
 */
export default function ContactLink({ children, ...rest }: Props) {
  return (
    <Link
      href="#contact"
      onClick={(e) => {
        e.preventDefault();
        scrollToHash("#contact");
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
