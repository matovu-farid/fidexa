"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProjectCard } from "@/components/project-card";
import { projects, categories } from "@/data/projects";
import type { ProjectCategory } from "@/data/projects";
import { StructuredData } from "@/components/structured-data";
import { projectsStructuredData } from "@/lib/seo";
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
    if (category !== active) trackAnalytics("project_category_filtered", { category });
    setActive(category);
    window.history.replaceState(null, "", category === "all" ? pathname : `${pathname}?category=${category}`);
  }
  const filtered = active === "all" ? projects : projects.filter((project) => project.category === active);

  return (
    <>
      <StructuredData data={projectsStructuredData(filtered)} />
      <Nav />
      <main className="page-main">
        <div className="site-shell">
          <div className="split-heading">
            <div>
              <h1 className="section-title">Products, systems, and tools.</h1>
            </div>
            <p className="body-copy">Product work, client systems, and developer tools from the Fidexa studio. Explore the scope and evidence behind each project.</p>
          </div>
          <div className="catalog-controls mt-10">
          <ToggleGroup type="single" variant="outline" value={active} onValueChange={(value) => { if (value) selectCategory(value as ProjectCategory | "all"); }} className="catalog-filter flex flex-wrap justify-start" aria-label="Filter projects">
            {categories.map((category) => <ToggleGroupItem key={category.value} value={category.value}>{category.label}</ToggleGroupItem>)}
          </ToggleGroup>
          <p className="catalog-count text-sm text-muted-foreground" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "project" : "projects"}{" "}shown
          </p>
          </div>
          <div className="index-grid mt-10">
            {filtered.map((project) => <ProjectCard key={project.id} project={project} featured={project.featured} context="index" />)}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
