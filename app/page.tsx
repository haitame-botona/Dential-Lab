import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { Differentiators } from "@/components/sections/Differentiators";
import { Frictions } from "@/components/sections/Frictions";
import { PackContents } from "@/components/sections/PackContents";
import { Deliverables } from "@/components/sections/Deliverables";
import { Configurator } from "@/components/sections/Configurator";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Stats />
      <Differentiators />
      <Frictions />
      <PackContents />
      <Deliverables />
      <Configurator />
      <Footer />
    </main>
  );
}
