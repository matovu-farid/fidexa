import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { featuredProjects } from "@/data/projects";
import { ProjectCard } from "./project-card";

export function FeaturedProjects() {
  return (
    <section id="projects" className="section-rule section-block">
      <div className="site-shell">
        <div className="work-header">
          <div>
            <p className="eyebrow">02 / Work</p>
            <h2 className="section-title mt-5">A few things we&apos;ve built.</h2>
          </div>
          <Link className="button-secondary" href="/projects">View all work <ArrowUpRight size={15} /></Link>
        </div>
        <p className="body-copy mt-6 max-w-xl">Selected work from a much broader studio practice.</p>
        <div className="filter-row mt-8" aria-label="Featured work categories">
          <Link className="filter-pill filter-pill-active" href="/projects">All</Link>
          <Link className="filter-pill" href="/projects?category=ai-automation">AI + Automation</Link>
          <Link className="filter-pill" href="/projects?category=native-apps">Apple + Native</Link>
          <Link className="filter-pill" href="/projects?category=web-apps">Web Apps</Link>
        </div>
        <div className="featured-grid mt-12">
          {featuredProjects.map((project) => <ProjectCard key={project.id} project={project} featured />)}
        </div>
      </div>
    </section>
  );
}
