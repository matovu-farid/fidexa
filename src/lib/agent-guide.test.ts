import { describe, expect, it } from "vitest";
import { projects } from "../data/projects";
import { studioEngines } from "../data/services";
import { createAgentGuide } from "./agent-guide";

describe("agent reading guides", () => {
  it("gives readers authoritative public entry points and contact facts", () => {
    const guide = createAgentGuide(false);
    expect(guide).toContain("# Fidexa");
    expect(guide).toContain("Kampala, Uganda");
    expect(guide).toContain("https://www.fidexa.org/projects");
    expect(guide).toContain("https://www.fidexa.org/llms-full.txt");
    expect(guide).toContain("hello@fidexa.org");
    expect(guide).not.toMatch(/\/admin|\/api\/|outreach|campaign|secret/i);
  });

  it("includes current catalog descriptions and every available public product evidence link", () => {
    const guide = createAgentGuide(true);
    for (const project of projects) {
      expect(guide).toContain(project.description);
      expect(guide).toContain(`/projects#project-${project.id}`);
      for (const url of Object.values(project.links ?? {})) expect(guide).toContain(url);
    }
    expect(guide).toContain("Android is planned, but is not available today.");
    expect(guide).not.toMatch(/authenticated dashboard|guaranteed.*rank|\/admin|\/api\/|outreach/i);
  });

  it("makes existing case-study decisions and deeper workflows available in the full guide", () => {
    const guide = createAgentGuide(true);
    for (const project of projects) {
      const story = project.caseStudy;
      if (!story) continue;
      expect(guide).toContain(`/#project-${project.id}`);
      for (const text of [story.intro, story.situation, story.decision, story.delivered]) expect(guide).toContain(text);
      for (const workflow of story.evidence?.workflows ?? []) {
        expect(guide).toContain(workflow.title);
        expect(guide).toContain(workflow.description);
      }
    }
  });

  it("uses the same service explanation and process as the public homepage", () => {
    for (const full of [false, true]) {
      const guide = createAgentGuide(full);
      for (const engine of studioEngines) {
        expect(guide).toContain(engine.description);
        for (const step of engine.steps) expect(guide).toContain(step);
      }
    }
  });
});
