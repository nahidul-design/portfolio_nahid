import type { Metadata } from "next";
import Cursor from "@/components/Cursor";
import IntroLoader from "@/components/IntroLoader";
import Nav from "@/components/Nav";
import ScrollRestoration from "@/components/ScrollRestoration";
import ScrollReveals from "@/components/ScrollReveals";
import ScrollVignette from "@/components/ScrollVignette";
import SmoothScroll from "@/components/SmoothScroll";
import { display, sans, script } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nahidul Islam — Product Designer",
    template: "%s — Nahidul Islam",
  },
  description:
    "Product designer in Dhaka making complicated things feel obvious.",
};

/**
 * IntroLoader lives here, not on the home page component — the root layout
 * mounts once per real navigation (first visit or a browser reload) and
 * persists across client-side route changes, since Next only swaps the
 * page segment below it. It used to live in app/page.tsx, which meant
 * clicking the logo (a plain Link) from any other route back to "/"
 * remounted the home page component and replayed the intro every time.
 * Living here instead, it naturally only plays on an actual page load.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${script.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <ScrollRestoration />
        <SmoothScroll>
          <IntroLoader />
          <Nav />
          <div className="flex-1">{children}</div>
          <ScrollReveals />
          <Cursor />
          <ScrollVignette />
        </SmoothScroll>
      </body>
    </html>
  );
}
