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
            <h2 className="section-title mt-5">Projects with a point of view.</h2>
          </div>
          <Link className="button-secondary" href="/projects">View all work <ArrowUpRight size={15} /></Link>
        </div>
        <p className="body-copy mt-6 max-w-xl">A few products and client systems we have taken from fuzzy first thought to something people can use.</p>
        <div className="featured-grid mt-12">
          {featuredProjects.map((project) => <ProjectCard key={project.id} project={project} featured />)}
        </div>
      </div>
    </section>
  );
}
