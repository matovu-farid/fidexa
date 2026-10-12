import { StructuredData } from "@/components/structured-data";
import { homeStructuredData } from "@/lib/seo";
import { Hero } from "@/components/hero";
import { WhatWeDo } from "@/components/what-we-do";
import { CompanyProfile } from "@/components/company-profile";
import { FeaturedProjects } from "@/components/featured-projects";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <StructuredData data={homeStructuredData()} />
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
