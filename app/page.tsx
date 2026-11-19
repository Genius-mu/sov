import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { ScrollScenes } from "@/components/ScrollScenes";
import { ExperienceLoader } from "@/components/three/ExperienceLoader";
import { Cursor } from "@/components/ui/Cursor";
import { Navbar } from "@/components/ui/Navbar";
import { Preloader } from "@/components/ui/Preloader";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { Craft } from "@/components/sections/Craft";
import { Collection } from "@/components/sections/Collection";
import { Performance } from "@/components/sections/Performance";
import { Starlight } from "@/components/sections/Starlight";
import { Bespoke } from "@/components/sections/Bespoke";
import { Process } from "@/components/sections/Process";
import { Visit } from "@/components/sections/Visit";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <Preloader />

      {/* Fixed 3D showroom behind everything */}
      <ExperienceLoader />

      <Navbar />

      {/* Every section with data-scene drives a camera shot (see lib/scenes.ts) */}
      <main className="relative z-10">
        <Hero />
        <Intro />
        <Craft />
        <Collection />
        <Performance />
        <Starlight />
        <Bespoke />
        <Process />
        <Visit />
      </main>
      <Footer />

      {/* Must stay after the sections so it sees their pins */}
      <ScrollScenes />

      <Cursor />
    </SmoothScroll>
  );
}
