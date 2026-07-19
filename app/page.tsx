import About from "@/components/About";
import CaseStudies from "@/components/CaseStudies";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import HomeFooter from "@/components/HomeFooter";
import IntroLoader from "@/components/IntroLoader";
import PenguinSlot from "@/components/PenguinSlot";
import Quote from "@/components/Quote";
import Resume from "@/components/Resume";
import UIPicker from "@/components/UIPicker";

/** Home is the single-page site — every section per CLAUDE.md's order. */
export default function HomePage() {
  return (
    <main>
      <IntroLoader />
      <Hero />
      <About />
      <CaseStudies />
      <Quote />
      <Resume />
      <UIPicker />
      <Contact />
      <PenguinSlot />
      <HomeFooter />
    </main>
  );
}
