import { ArrowUpRight } from "lucide-react";
import { categories, type Project } from "@/data/projects";
import { AnalyticsLink } from "@/components/analytics-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ProjectEvidence } from "@/components/project-evidence";

const liveLinkLabels: Record<string, string> = {
  rishi: "Explore Rishi",
  "money-lending": "View Kaks Credit showcase",
  "inventory-trade": "View inventory showcase",
  "apartment-manager": "Explore Apartment Manager",
};

export function ProjectCard({ project, featured = false, context = "home" }: { project: Project; featured?: boolean; context?: "home" | "index" }) {
  const story = featured && context === "home" ? project.caseStudy : undefined;
  const links = project.links ? [
    project.links.live ? { label: liveLinkLabels[project.id] ?? "Explore live site", shortLabel: "Live site", href: project.links.live } : null,
    project.links.appStore ? { label: "Get Rishi on the App Store", shortLabel: "App Store", href: project.links.appStore } : null,
    project.links.github ? { label: `View ${project.name} source on GitHub`, shortLabel: "Source", href: project.links.github } : null,
    project.links.video ? { label: `Watch ${project.name} product walkthrough`, shortLabel: "Walkthrough", href: project.links.video } : null,
  ].filter((link): link is { label: string; shortLabel: string; href: string } => Boolean(link)) : [];
  const [primaryLink, ...secondaryLinks] = links;
  const events = featured && context === "home"
    ? ["featured_project_opened", "outbound_project_link_opened"] as const
    : ["outbound_project_link_opened"] as const;
  const actions = primaryLink && (
    <>
      <Button asChild className="project-primary-link h-auto min-h-11 max-w-full whitespace-normal">
        <AnalyticsLink href={primaryLink.href} aria-label={primaryLink.label} target="_blank" rel="noopener noreferrer" events={events}>
          {primaryLink.shortLabel === "Source" ? "View source on GitHub" : primaryLink.label} <ArrowUpRight data-icon="inline-end" />
        </AnalyticsLink>
      </Button>
      {secondaryLinks.length > 0 && (
        <div className="project-secondary-links">
          {secondaryLinks.map(({ label, shortLabel, href }) => (
            <AnalyticsLink key={href} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" events={events}>
              {shortLabel}
            </AnalyticsLink>
          ))}
        </div>
      )}
    </>
  );
  const media = featured && project.media && (
    <figure className={cn("project-media", `project-media-${project.id}`)}>
      <div className="project-media-window">
        <img
          width={story && project.id === "rishi" ? 660 : project.media.width}
          height={story && project.id === "rishi" ? 1310 : project.media.height}
          loading="lazy"
          decoding="async"
          src={story && project.id === "rishi" ? "/projects/rishi-showcase-poster.jpg" : project.media.src}
          alt={story && project.id === "rishi"
            ? "Rishi’s iPhone library showing search, books in progress, and reading navigation"
            : project.id === "money-lending"
              ? "Kaks Credit public product page with a lending dashboard illustration"
              : project.media.alt}
        />
      </div>
      {project.caseStudy && (
        <figcaption className="project-media-caption">
          <span>{project.caseStudy.caption}</span>
          <span className="project-media-provenance">
            {context === "index" && project.id === "rishi"
              ? "Existing capture of the public Rishi product showcase."
              : project.caseStudy.provenance}
          </span>
        </figcaption>
      )}
    </figure>
  );

  if (story && project.media) {
    return (
      <Card id={`project-${project.id}`} className={cn("project-card project-story flex gap-0 rounded-none border-0 py-0 shadow-none md:grid", `project-story-${project.id}`, project.id === "rishi" && "theme-inverse")}>
        <CardContent className="project-story-visual p-0">{media}</CardContent>
        <div className="project-story-body">
          <CardHeader className="p-0">
            <CardTitle><h3>{story.shortName}</h3></CardTitle>
            <CardDescription className="project-story-description text-lg">{story.intro}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <dl className="project-story-details">
              <div><dt>The situation</dt><dd>{story.situation}</dd></div>
              <div><dt>Product decision</dt><dd>{story.decision}</dd></div>
              <div><dt>Delivered</dt><dd>{story.delivered}</dd></div>
            </dl>
          </CardContent>
          <CardFooter className="project-links items-start p-0">{actions}</CardFooter>
        </div>
        {story.evidence && <ProjectEvidence evidence={story.evidence} />}
      </Card>
    );
  }

  return (
    <Card id={`project-${project.id}`} className={cn("project-card gap-5", featured && "project-card-featured")}>
      {media && <CardContent className="project-index-visual">{media}</CardContent>}
      <CardHeader>
        <p className="eyebrow">{project.year} · {project.featured ? "Featured" : "Selected work"}</p>
        <CardTitle>{context === "index" ? <h2>{project.name}</h2> : <h3>{project.name}</h3>}</CardTitle>
        <CardDescription>{context === "home" && featured ? project.featuredSummary ?? project.description : project.description}</CardDescription>
        <div className="project-tag-row">
          <Badge variant="secondary">{categories.find(({ value }) => value === project.category)?.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="project-story-stack">{project.techStack.slice(0, 3).join(" · ")}</p>
      </CardContent>
      {actions && <CardFooter className="project-links items-start">{actions}</CardFooter>}
    </Card>
  );
}
