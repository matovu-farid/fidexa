"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProjectCard } from "@/components/project-card";
import { projects, categories } from "@/data/projects";
import type { ProjectCategory } from "@/data/projects";
import { trackAnalytics } from "@/lib/analytics";

export default function ProjectsPage() {
  const pathname = usePathname();
  const [active, setActive] = useState<ProjectCategory | "all">("all");
  useEffect(() => {
    function syncCategoryFromUrl() {
      const queryCategory = new URLSearchParams(window.location.search).get("category");
      setActive(categories.some((category) => category.value === queryCategory) ? queryCategory as ProjectCategory : "all");
    }
    syncCategoryFromUrl();
    window.addEventListener("popstate", syncCategoryFromUrl);
    return () => window.removeEventListener("popstate", syncCategoryFromUrl);
  }, []);
  function selectCategory(category: ProjectCategory | "all") {
    setActive(category);
    trackAnalytics("project_category_filtered");
    window.history.replaceState(null, "", category === "all" ? pathname : `${pathname}?category=${category}`);
  }
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
            <p className="body-copy">Selected product work, client systems, and experiments from the Fidexa studio. This catalog is a window into the practice, not the whole story.</p>
          </div>
          <div className="filter-row mt-10" role="group" aria-label="Filter projects">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                className={`filter-pill ${active === category.value ? "filter-pill-active" : ""}`}
                aria-pressed={active === category.value}
                onClick={() => selectCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="index-grid mt-10">
            {filtered.map((project) => <ProjectCard key={project.id} project={project} featured={project.featured} context="index" />)}
          </div>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.1em] text-[#667087]" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "project" : "projects"}{" "}shown · a sample of the studio&apos;s work.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
