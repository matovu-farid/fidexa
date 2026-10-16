import { site } from "../data/site";
import { categories, projects } from "../data/projects";
import { studioEngines } from "../data/services";

export function createAgentGuide(full: boolean): string {
  const lines = [
    "# Fidexa", "",
    `> ${site.profile}`, "",
    `Founded and led by ${site.founder.name}, ${site.founder.role}.`,
    ...studioEngines.flatMap((engine) => [
      `${engine.name}: ${engine.description}`,
      `${engine.scope}. Process: ${engine.steps.join(" → ")}.`,
    ]), "",
    "## Authoritative pages", "",
    `- [Studio, services, company, and contact](${site.url}/): the public homepage.`,
    `- [Projects](${site.url}/projects): the complete 11-project catalog and category filters.`,
    `- [SMS customer care](${site.url}/sms): opt-in, HELP, STOP, and policy links; this program is not for marketing.`,
    `- [Full studio and project guide](${site.url}/llms-full.txt): public project descriptions and evidence links.`, "",
    "## Contact and founder", "",
    `- [Project inquiries](mailto:${site.email}): ${site.email}. Typical response: two business days.`,
    `- [Founder portfolio](${site.founder.url}): ${site.founder.name}.`,
    `- [Founder LinkedIn](${site.founder.linkedIn}).`,
    `- Base: ${site.location}; remote work in ${site.timezone}.`, "",
    "## Product facts", "",
    "Rishi is an Apple ecosystem reading platform. Android is planned, but is not available today.",
    "Kaks Credit and Inventory are production business platforms. Their public links show product showcases; access to operational workspaces may require sign-in.",
    "The catalog includes client products, independent products, infrastructure, and libraries. A listed project is evidence of delivered work, not a claim that every project is sold as a public subscription.", "",
  ];

  if (full) {
    lines.push("## Project catalog", "");
    for (const project of projects) {
      lines.push(`### ${project.name}`, "", project.description, "",
        `Category: ${categories.find((category) => category.value === project.category)?.label}.`,
        `Technologies: ${project.techStack.join(", ")}.`,
        `- [Fidexa project record](${site.url}/projects#project-${project.id})`);
      if (project.links?.live) lines.push(`- [Public product or website](${project.links.live})`);
      if (project.links?.appStore) lines.push(`- [App Store listing](${project.links.appStore})`);
      if (project.links?.github) lines.push(`- [Source repository](${project.links.github})`);
      if (project.links?.video) lines.push(`- [Product walkthrough](${project.links.video})`);
      if (project.caseStudy) {
        const story = project.caseStudy;
        lines.push("", `#### ${story.shortName} case study`, "", story.intro,
          `- [Case study on the homepage](${site.url}/#project-${project.id})`,
          `Situation: ${story.situation}`, `Product decision: ${story.decision}`, `Delivered: ${story.delivered}`);
        for (const workflow of story.evidence?.workflows ?? []) {
          lines.push("", `##### ${workflow.title}`, "", workflow.description);
        }
        for (const capture of story.evidence?.captures ?? []) {
          lines.push("", `- [${capture.alt}](${new URL(capture.src, site.url).href}): ${capture.caption}`);
        }
      }
      lines.push("");
    }
  } else {
    lines.push("## Selected product evidence", "");
    for (const project of projects.filter((project) => project.featured)) {
      lines.push(`- [${project.name}](${site.url}/projects#project-${project.id}): ${project.featuredSummary ?? project.description}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
