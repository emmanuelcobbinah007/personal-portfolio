import { About } from "@/components/About";
import { Contact, Footer } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { BlackStarBridge } from "@/components/BlackStarBridge";
import { Notes } from "@/components/Notes";
import { Resume } from "@/components/Resume";
import { Reveal } from "@/components/Reveal";
import { Signature } from "@/components/Signature";
import { SignatureLoader } from "@/components/SignatureLoader";
import { SkipLink } from "@/components/SkipLink";
import { Work } from "@/components/Work";

export default function Home() {
  return (
    <>
      <SignatureLoader />
      <SkipLink />
      <Nav />
      <main id="main">
        <Hero />
        <Reveal>
          <Work />
        </Reveal>
        <Reveal>
          <About />
        </Reveal>
        <Reveal>
          <Resume />
        </Reveal>
        <Reveal>
          <BlackStarBridge className="mt-6 mb-2 sm:mt-10 sm:mb-4" />
        </Reveal>
        <Reveal>
          <Notes />
        </Reveal>
        <Reveal>
          <Contact />
        </Reveal>
      </main>
      <Signature />
      <Footer />
    </>
  );
}
