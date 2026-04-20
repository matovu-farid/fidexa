import type { Project } from "@/data/projects";
import { ExternalLink, GithubIcon, Play } from "lucide-react";

const tagColors: Record<string, string> = {
  Innovation: "bg-indigo-500/15 text-indigo-300",
  "Cross-Platform": "bg-white/[0.06] text-muted-foreground",
  SaaS: "bg-green-500/15 text-green-300",
  Finance: "bg-white/[0.06] text-muted-foreground",
  AI: "bg-amber-500/15 text-amber-300",
  "Developer Tool": "bg-white/[0.06] text-muted-foreground",
  Property: "bg-pink-500/15 text-pink-300",
  "Client Work": "bg-white/[0.06] text-muted-foreground",
  Business: "bg-white/[0.06] text-muted-foreground",
  Infrastructure: "bg-white/[0.06] text-muted-foreground",
  Docker: "bg-white/[0.06] text-muted-foreground",
  Analytics: "bg-cyan-500/15 text-cyan-300",
  "Real-time": "bg-white/[0.06] text-muted-foreground",
  npm: "bg-red-500/15 text-red-300",
  "Component Library": "bg-white/[0.06] text-muted-foreground",
  Tourism: "bg-white/[0.06] text-muted-foreground",
  Marketing: "bg-white/[0.06] text-muted-foreground",
  Mobile: "bg-violet-500/15 text-violet-300",
  "Play Store": "bg-white/[0.06] text-muted-foreground",
  Communication: "bg-white/[0.06] text-muted-foreground",
  Telephony: "bg-white/[0.06] text-muted-foreground",
  Data: "bg-white/[0.06] text-muted-foreground",
  API: "bg-white/[0.06] text-muted-foreground",
  Space: "bg-white/[0.06] text-muted-foreground",
  CLI: "bg-white/[0.06] text-muted-foreground",
  Systems: "bg-orange-500/15 text-orange-300",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]">
      <div className="mb-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${tagColors[tag] ?? "bg-white/[0.06] text-muted-foreground"}`}
          >
            {tag}
          </span>
        ))}
      </div>
      <h3 className="text-lg font-semibold">{project.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>
      <p className="mt-4 text-xs text-white/30">
        {project.techStack.join(" \u00B7 ")}
      </p>
      {project.links && (
        <div className="mt-4 flex gap-3">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <GithubIcon size={16} />
            </a>
          )}
          {project.links.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink size={16} />
            </a>
          )}
          {project.links.video && (
            <a
              href={project.links.video}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Play size={16} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
