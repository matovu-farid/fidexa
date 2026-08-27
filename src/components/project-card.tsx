import type { Project } from "@/data/projects";

function Snapshot({ project }: { project: Project }) {
  const snapshot = project.id === "rishi"
    ? { label: "Reader / current chapter", value: "04:12", bar: "w-3/4" }
    : project.id === "money-lending"
      ? { label: "Cash flow / this month", value: "$128k", bar: "w-1/2" }
      : project.id === "inventory-trade"
        ? { label: "Supply → store → shop", value: "LIVE", bar: "w-2/3" }
        : { label: "System snapshot", value: "READY", bar: "w-1/2" };

  return (
    <div className="project-snapshot" aria-label={`${project.name} product snapshot`}>
      <div className="snapshot-top">
        <span className="snapshot-label">Project snapshot</span>
        <span className="snapshot-label opacity-60">{snapshot.label}</span>
      </div>
      <div className="snapshot-bottom">
        <span className="snapshot-number">{snapshot.value}</span>
        <span className={`snapshot-bar ${snapshot.bar}`} />
      </div>
    </div>
  );
}

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
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
        <p className="mt-4">{project.description}</p>
      </div>
      {featured && <Snapshot project={project} />}
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
