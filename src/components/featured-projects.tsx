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
            <p className="eyebrow">Selected work</p>
            <h2 className="section-title mt-5">Work with a point of view.</h2>
          </div>
          <Link className="button-secondary" href="/projects">View all work <ArrowUpRight size={15} /></Link>
        </div>
        <p className="body-copy mt-6 max-w-xl">Featured launches and the full project index.</p>
        <div className="filter-row mt-8" aria-label="Featured work categories">
          <Link className="filter-pill filter-pill-active" href="/projects">All</Link>
          <Link className="filter-pill" href="/projects">AI + Automation</Link>
          <Link className="filter-pill" href="/projects">Apple + Native</Link>
          <Link className="filter-pill" href="/projects">Web Apps</Link>
        </div>
        <div className="featured-grid mt-12">
          {featuredProjects.map((project) => <ProjectCard key={project.id} project={project} featured />)}
        </div>
      </div>
    </section>
  );
}
