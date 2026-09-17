import { Hero } from "@/components/hero";
import { WhatWeDo } from "@/components/what-we-do";
import { CompanyProfile } from "@/components/company-profile";
import { FeaturedProjects } from "@/components/featured-projects";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <FeaturedProjects />
        <WhatWeDo />
        <CompanyProfile />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
