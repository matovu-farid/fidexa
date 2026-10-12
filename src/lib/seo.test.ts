import { describe, expect, it } from "vitest";
import { projects } from "../data/projects";
import { site } from "../data/site";
import { createPageMetadata, homeStructuredData, projectsStructuredData, serializeJsonLd, siteVerification } from "./seo";

describe("public search metadata", () => {
  it("gives each route matching search and social facts and its own canonical", () => {
    for (const page of site.pages) {
      const metadata = createPageMetadata(page);
      expect(metadata.title).toBe(page.title);
      expect(metadata.description).toBe(page.description);
      expect(metadata.alternates?.canonical).toBe(new URL(page.path, site.url).href);
      expect(metadata.openGraph).toMatchObject({ title: page.title, description: page.description, url: new URL(page.path, site.url).href });
      expect(metadata.twitter).toMatchObject({ title: page.title, description: page.description, card: "summary_large_image" });
    }
  });

  it("uses only issued verification tokens, ignoring blank values", () => {
    expect(siteVerification({ GOOGLE_SITE_VERIFICATION: " google-token ", BING_SITE_VERIFICATION: "bing-token" })).toEqual({ google: "google-token", other: { "msvalidate.01": "bing-token" } });
    expect(siteVerification({ GOOGLE_SITE_VERIFICATION: "  " })).toEqual({});
  });
});

describe("machine-readable public identity", () => {
  it("connects the visible company, founder, website, and homepage with stable IDs", () => {
    const graph = homeStructuredData()["@graph"];
    const organization = graph.find((entity) => entity["@type"] === "Organization");
    const founder = graph.find((entity) => entity["@type"] === "Person");
    const website = graph.find((entity) => entity["@type"] === "WebSite");
    expect(organization).toMatchObject({ name: "Fidexa", email: "hello@fidexa.org", address: { addressLocality: "Kampala", addressCountry: "UG" }, founder: { "@id": founder?.["@id"] } });
    expect(founder).toMatchObject({ name: "Farid Matovu", url: "https://matovu-farid.com" });
    expect(website).toMatchObject({ publisher: { "@id": organization?.["@id"] } });
    expect(new Set(graph.map((entity) => entity["@id"])).size).toBe(graph.length);
    expect(organization).not.toHaveProperty("sameAs"); // Founder profiles are not company profiles.
  });

  it("describes exactly the 11 visible catalog projects with working internal anchors", () => {
    const graph = projectsStructuredData()["@graph"];
    const list = graph.find((entity) => entity["@type"] === "ItemList")!;
    const items = list.itemListElement as { position: number; item: { name: string; description: string; url: string } }[];
    expect(items).toHaveLength(11);
    expect(items.map((entry) => entry.item.name)).toEqual(projects.map((project) => project.name));
    items.forEach((entry, index) => {
      expect(entry.position).toBe(index + 1);
      expect(entry.item.description).toBe(projects[index].description);
      expect(entry.item.url).toBe(`${site.url}/projects#project-${projects[index].id}`);
    });
    expect(JSON.stringify(graph)).not.toMatch(/aggregateRating|reviewCount|offers|priceCurrency/);
  });

  it("escapes script-ending content without changing the decoded data", () => {
    const unsafe = { name: '</script><script>alert("x")</script>' };
    const serialized = serializeJsonLd(unsafe);
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual(unsafe);
  });

  it("describes only the visible category when the catalog is filtered", () => {
    const visible = projects.filter((project) => project.category === "ai-automation");
    const list = projectsStructuredData(visible)["@graph"].find((entity) => entity["@type"] === "ItemList")!;
    expect(list.numberOfItems).toBe(2);
    expect(list.itemListElement).toHaveLength(2);
  });
});
