import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("company profile section contract", () => {
  it("presents the founder-led studio facts and places the section before contact", () => {
    const component = readSource("./company-profile.tsx");
    const homepage = readSource("../app/page.tsx");

    expect(component).toContain("Founded and led by Farid Matovu");
    expect(component).toContain("Founder &amp; Product Engineer");
    expect(component).toContain("Kampala, Uganda");
    expect(component).toContain("GMT+3");
    expect(component).toContain("7+ years of professional delivery");
    expect(component).toContain("Rishi");
    expect(component).toContain("lending");
    expect(component).toContain("inventory");
    expect(component).toContain("https://matovu-farid.com");
    expect(component).toContain("https://www.linkedin.com/in/matovu-farid/");
    expect(component).toContain('href="#contact"');
    expect(homepage.indexOf("<WhatWeDo />")).toBeLessThan(homepage.indexOf("<CompanyProfile />"));
    expect(homepage.indexOf("<CompanyProfile />")).toBeLessThan(homepage.indexOf("<Contact />"));
  });

  it("defines a two-column desktop layout that stacks below tablet landscape", () => {
    const styles = readSource("../app/globals.css");

    expect(styles).toMatch(/\.company-profile-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1\.05fr\) minmax\(0, \.85fr\)/);
    expect(styles).toMatch(/@media\s*\(min-width:\s*768px\) and \(max-width:\s*1193px\)[\s\S]*?\.company-profile-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
  });
});
