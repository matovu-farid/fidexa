import { describe, expect, it } from "vitest";
import { projects } from "../data/projects";
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
});
