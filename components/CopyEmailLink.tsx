"use client";

import { useState } from "react";

const EMAIL = "nahidul.design@gmail.com";

/**
 * Click copies the email instead of opening a mail client; text swaps to
 * "Copied!" for 1.5s then reverts. Keeps href="mailto:" so middle-click /
 * open-in-new-tab still reaches a mail client — only the plain left-click
 * (the one React's onClick fires for) is intercepted.
 *
 * The state update is synchronous and unconditional — it does NOT await the
 * clipboard write. Gating it on `await navigator.clipboard.writeText()`
 * (the original approach) meant the visible swap only happened after that
 * promise settled; in practice the promise could resolve without the
 * continuation ever committing a re-render, silently eating every click.
 * Firing the clipboard write independently, after the UI already updated,
 * sidesteps that entirely and is better UX besides — no reason to make the
 * user wait on a promise before showing feedback for a copy action.
 *
 * Underline uses the shared `link-underline` utility (safe directly on the
 * <a> — it only animates its own ::after, never the anchor's transform). The
 * translateY nudge instead lives on the child span via group-hover/email:,
 * not on the <a> itself: this <a> IS a direct child of Contact's
 * reveal-group, so a hover-transform utility on the same element would
 * contend with GSAP's entrance write — the Discuss-button bug. Already full
 * ink per Figma, so there's no muted→ink shift to add here (see LinkedIn/
 * WhatsApp in Contact.tsx for where that applies).
 */
export default function CopyEmailLink() {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);

    // Fire-and-forget — failure just means the fallback mailto href is what
    // a middle-click/new-tab open would have reached anyway.
    navigator.clipboard.writeText(EMAIL).catch(() => {});
  };

  return (
    <a
      href={`mailto:${EMAIL}`}
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
      data-cursor="Copy"
      className="link-underline group/email flex flex-col items-start gap-1.5 text-ink"
    >
      <span className="inline-block text-2xl tracking-body transition-transform duration-300 group-hover/email:-translate-y-px">
        {copied ? "Copied!" : EMAIL}
      </span>
    </a>
  );
}
