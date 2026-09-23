import type { Project } from "@/data/projects";
import { AnalyticsLink } from "@/components/analytics-link";

const liveLinkLabels: Record<string, string> = {
  rishi: "Explore Rishi",
  "money-lending": "View Kaks Credit showcase",
  "inventory-trade": "View inventory showcase",
};

export function ProjectCard({ project, featured = false, context = "home" }: { project: Project; featured?: boolean; context?: "home" | "index" }) {
  const links = project.links ? [
    project.links.live ? { label: liveLinkLabels[project.id] ?? "Explore live site", href: project.links.live } : null,
    project.links.appStore ? { label: "Get Rishi on the App Store", href: project.links.appStore } : null,
    project.links.github ? { label: "View source on GitHub", href: project.links.github } : null,
    project.links.video ? { label: "Watch product walkthrough", href: project.links.video } : null,
  ].filter((link): link is { label: string; href: string } => Boolean(link)) : [];

  return (
    <article className={`project-card ${featured ? "project-card-featured" : ""}`}>
      <div className="project-tag-row">
        <span className="project-tag">{project.category.replace("-", " ")}</span>
        {project.tags.slice(0, 2).map((tag) => <span className="project-tag" key={tag}>{tag}</span>)}
      </div>
      <div className="project-card-copy">
        <p className="eyebrow opacity-70">{project.year} · {project.featured ? "Featured" : "Selected work"}</p>
        <h3 className="mt-3 text-2xl font-bold tracking-[-0.05em]">{project.name}</h3>
        <p className="mt-4">{context === "home" && featured ? project.featuredSummary ?? project.description : project.description}</p>
      </div>
      {featured && project.media && (
        <figure className="project-media">
          <img width={project.media.width} height={project.media.height} loading="lazy" decoding="async" src={project.media.src} alt={project.media.alt} />
          <figcaption className="project-media-label">Live product showcase</figcaption>
        </figure>
      )}
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.08em] opacity-60">{project.techStack.slice(0, 3).join(" · ")}</p>
      {links.length > 0 && (
        <div className="project-links">
          {links.map(({ label, href }) => (
            <AnalyticsLink
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              events={featured && context === "home"
                ? ["featured_project_opened", "outbound_project_link_opened"]
                : ["outbound_project_link_opened"]}
            >
              {label} ↗
            </AnalyticsLink>
          ))}
        </div>
      )}
    </article>
  );
}
