import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { WhatWeDo } from "@/components/what-we-do";
import { FeaturedProjects } from "@/components/featured-projects";
import { Capabilities } from "@/components/capabilities";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <Hero />
        <WhatWeDo />
        <FeaturedProjects />
        <Capabilities />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
