"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProjectCard } from "@/components/project-card";
import { projects, categories } from "@/data/projects";
import type { ProjectCategory } from "@/data/projects";

export default function ProjectsPage() {
  const [active, setActive] = useState<ProjectCategory | "all">("all");
  const filtered = active === "all" ? projects : projects.filter((project) => project.category === active);

  return (
    <>
      <Nav />
      <main className="page-main">
        <div className="site-shell">
          <div className="split-heading">
            <div>
              <p className="eyebrow">Work index · {projects.length} systems</p>
              <h1 className="section-title mt-5">Work with a point of view.</h1>
            </div>
            <p className="body-copy">Featured launches, client systems, and experiments from the Fidexa studio. Filter by the kind of problem, not just the technology.</p>
          </div>
          <div className="filter-row mt-10" role="group" aria-label="Filter projects">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                className={`filter-pill ${active === category.value ? "filter-pill-active" : ""}`}
                aria-pressed={active === category.value}
                onClick={() => setActive(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="index-grid mt-10">
            {filtered.map((project) => <ProjectCard key={project.id} project={project} featured={project.featured} />)}
          </div>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.1em] text-[#667087]">{projects.length} projects in the full index · filters mirror the live catalog.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
