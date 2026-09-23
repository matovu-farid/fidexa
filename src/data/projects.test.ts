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

  it("keeps three featured products, their order, media, and factual summaries", () => {
    expect(featuredProjects.map((project) => project.id)).toEqual([
      "rishi",
      "money-lending",
      "inventory-trade",
    ]);
    expect(featuredProjects.every((project) => project.media && project.featuredSummary)).toBe(true);
  });
});
