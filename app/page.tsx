import Hero from "@/components/Hero";
import IntroLoader from "@/components/IntroLoader";
import PenguinSlot from "@/components/PenguinSlot";

/**
 * Home is the single-page site. Only the nav (in the root layout) and the hero
 * are built so far — the remaining sections land below this.
 */
export default function HomePage() {
  return (
    <main>
      <IntroLoader />
      <Hero />
      <PenguinSlot />
    </main>
  );
}
