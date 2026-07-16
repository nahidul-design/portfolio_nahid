import type { Metadata } from "next";
import Nav from "@/components/Nav";
import { sans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nahid Here",
    template: "%s — Nahid Here",
  },
  description: "Portfolio of Nahid.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="flex min-h-dvh flex-col">
        <Nav />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
