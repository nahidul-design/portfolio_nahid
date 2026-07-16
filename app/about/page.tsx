import type { Metadata } from "next";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Me",
};

export default function AboutPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-gutter py-section sm:px-gutter-lg sm:py-section-lg">
        <h1 className="text-3xl sm:text-4xl">About Me</h1>
      </main>
      <Footer />
    </>
  );
}
