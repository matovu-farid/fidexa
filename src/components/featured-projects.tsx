import Link from "next/link";
import { featuredProjects } from "@/data/projects";
import { ProjectCard } from "./project-card";

export function FeaturedProjects() {
  return (
    <section id="projects" className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Selected Work
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Featured Projects
            </h2>
          </div>
          <Link
            href="/projects"
            className="rounded-lg border border-white/[0.1] px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-white/[0.2] hover:text-foreground"
          >
            View All &rarr;
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
