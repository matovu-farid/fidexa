import type { Project } from "@/data/projects";

const featuredValue: Record<string, string> = {
  rishi: "A calmer way to read with AI.",
  "money-lending": "Kaks Credit / Make the numbers work harder.",
  "inventory-trade": "A shared system from supply to shop.",
};

export function ProjectCard({ project, featured = false, context = "home" }: { project: Project; featured?: boolean; context?: "home" | "index" }) {
  const links = project.links ? [
    project.links.live ? { label: "Visit live", href: project.links.live } : null,
    project.links.appStore ? { label: "App Store", href: project.links.appStore } : null,
    project.links.github ? { label: "GitHub", href: project.links.github } : null,
    project.links.video ? { label: "Watch demo", href: project.links.video } : null,
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
        {context === "index" || !featuredValue[project.id] ? (
          <p className="mt-4">{project.description}</p>
        ) : (
          <p className="mt-4">{featuredValue[project.id]}</p>
        )}
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
            <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label} ↗</a>
          ))}
        </div>
      )}
    </article>
  );
}
