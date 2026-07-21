import About from "@/components/About";
import CaseStudies from "@/components/CaseStudies";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import HomeFooter from "@/components/HomeFooter";
import PenguinSlot from "@/components/PenguinSlot";
import Quote from "@/components/Quote";
import RestoreHomeScroll from "@/components/RestoreHomeScroll";
import Resume from "@/components/Resume";
import Tools from "@/components/Tools";
import UIPicker from "@/components/UIPicker";

/** Home is the single-page site — every section per CLAUDE.md's order.
 *  IntroLoader lives in the root layout, not here — see its comment there. */
export default function HomePage() {
  return (
    <main>
      <RestoreHomeScroll />
      <Hero />
      <About />
      <Tools />
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
