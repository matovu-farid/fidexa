import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { WhatWeDo } from "@/components/what-we-do";
import { FeaturedProjects } from "@/components/featured-projects";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <WhatWeDo />
        <FeaturedProjects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
