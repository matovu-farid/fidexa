import { describe, expect, it } from "vitest";
import { categories, featuredProjects, projects } from "./projects";

describe("project catalog", () => {
  it("keeps the curated catalog and category totals intact", () => {
    expect(projects).toHaveLength(11);
    expect(
      Object.fromEntries(
        categories
          .filter((category) => category.value !== "all")
          .map((category) => [
            category.value,
            projects.filter((project) => project.category === category.value).length,
          ]),
      ),
    ).toEqual({
      "ai-automation": 2,
      "native-apps": 1,
      "web-apps": 5,
      "developer-tools": 3,
    });
  });

  it("features the rebuilt Apartment Manager alongside the three existing products", () => {
    expect(featuredProjects.map((project) => project.id)).toEqual([
      "rishi",
      "money-lending",
      "inventory-trade",
      "apartment-manager",
    ]);
    expect(featuredProjects.every((project) => project.media && project.featuredSummary)).toBe(true);
  });

  it("replaces the old apartment entry with one current, explorable successor", () => {
    const matches = projects.filter((project) => project.id === "apartment-manager");
    expect(matches).toHaveLength(1);
    expect(matches[0].name).toBe("Apartment Manager");
    expect(matches[0].year).toBe(2026);
    expect(matches[0].links?.live).toBe("https://apartment.fidexa.org/home");
    expect(matches[0].description).toContain("rebuild");
    expect(matches[0].description).toContain("provisional");
    expect(matches[0].media?.src).toBe("/projects/apartment-manager-showcase.png");
  });
});
