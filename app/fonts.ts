import { Barlow, Instrument_Serif, Kaushan_Script } from "next/font/google";

/** Display headings — set uppercase, tight tracking, two-tone opacity per line. */
export const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display-family",
});

/** Body + all UI. Regular for copy, Medium for the emphasised half of a label. */
export const sans = Barlow({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-sans-family",
});

/** Wordmark only — never used for anything else on the site. */
export const script = Kaushan_Script({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-script-family",
});
