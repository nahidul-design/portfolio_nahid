import { Geist } from "next/font/google";

/**
 * Single neutral grotesque, used everywhere — wordmark, headings, nav, body.
 * Variable weight axis: headings/wordmark lean on 600–700, body/UI on 400–500.
 * No serif, no second family.
 */
export const sans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-family",
});
