"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProjectCard } from "@/components/project-card";
import { projects, categories } from "@/data/projects";
import type { ProjectCategory } from "@/data/projects";

export default function ProjectsPage() {
  const [active, setActive] = useState<ProjectCategory | "all">("all");

  const filtered =
    active === "all"
      ? projects
      : projects.filter((p) => p.category === active);

  return (
    <>
      <Nav />
      <main className="px-6 pb-24 pt-32">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Our Work
          </p>
          <h1 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
            Projects
          </h1>

          {/* Filters */}
          <div className="mb-10 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActive(cat.value)}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  active === cat.value
                    ? "bg-foreground text-background"
                    : "border border-white/[0.1] text-muted-foreground hover:border-white/[0.2] hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
