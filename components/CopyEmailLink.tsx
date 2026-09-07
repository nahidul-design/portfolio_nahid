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
 * clipboard write; see the v2 history on this file for why (gating the swap
 * on the clipboard promise silently ate clicks).
 *
 * No copy icon — a prior pass added one (hidden by default, fading in on
 * hover), but the underline-on-hover this link had before that is what's
 * wanted instead. `data-cursor="Copy"` still tells the custom cursor to
 * show a "Copy" pill on hover, which already communicates the click
 * behaviour without a second icon doing the same job.
 *
 * `self-start` is load-bearing: this sits inside Contact's `flex flex-col`
 * copy column, which blockifies the `inline-flex` below to `flex` (an
 * inline-level display is always blockified for a flex-item child) and
 * then stretches it to the column's full width via the default
 * `align-items: stretch` — the link-underline `::after` spans `left:0` to
 * `right:0` on THIS element, so a stretched anchor drew the hover
 * underline under the whole column width instead of just the email text.
 * `self-start` opts the anchor back out of the stretch so it sizes to its
 * own content again.
 */
export default function CopyEmailLink() {
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
      className="link-underline group/email inline-flex w-fit items-center self-start text-ink"
    >
      <span className="inline-block text-[clamp(1.5rem,3vw,2rem)] leading-none tracking-display transition-transform duration-300 group-hover/email:-translate-y-px">
        {copied ? "Copied!" : EMAIL}
      </span>
    </a>
  );
}
