import { Chivo_Mono, Manrope } from "next/font/google";

/**
 * v3 typeface swap — replaces Instrument Serif + Barlow + Square Peg
 * entirely (see CLAUDE.md). Two families now, not three:
 *
 *   - Manrope   — every heading and larger body copy (was Instrument Serif
 *     for headings, Barlow for body). Same -2% tracking rule carries over.
 *     Regular (400) for everything, plus Medium (500) for the one spot that
 *     needs real emphasis within a line (Quote's "Design is how it works" —
 *     see Quote.tsx) — loaded explicitly so `font-medium` renders the actual
 *     Medium font file instead of a synthetic/faux bold.
 *   - Chivo Mono (Light) — every small UI string: nav, eyebrow tags,
 *     buttons, dates, meta labels. Uppercase, no letter-spacing — unlike
 *     old Barlow's -3% on uppercase-adjacent text.
 *
 * There is no script wordmark font anymore — the logo is a small icon
 * mark + Chivo Mono lockup (components/Logo.tsx), not typeset text.
 */
export const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-sans-family",
});

export const mono = Chivo_Mono({
  subsets: ["latin"],
  weight: "300",
  display: "swap",
  variable: "--font-mono-family",
});
