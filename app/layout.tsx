import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ScrollReveals from "@/components/ScrollReveals";
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
        <SmoothScroll>
          <Nav />
          <div className="flex-1">{children}</div>
          <ScrollReveals />
        </SmoothScroll>
      </body>
    </html>
  );
}
