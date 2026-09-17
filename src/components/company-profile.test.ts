import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("company profile section contract", () => {
  it("presents the verified company-first facts, proof, safe links, and contact sequence", () => {
    const component = readSource("./company-profile.tsx");
    const homepage = readSource("../app/page.tsx");
    const contact = readSource("./contact.tsx");

    expect(component).toContain('<dl className="company-profile-facts">');
    expect(component).toContain("<dt>Base</dt>");
    expect(component).toContain("<dd>Independent product studio</dd>");
    expect(component).toContain("<dt>Founder experience</dt>");
    expect(component).toContain("<dd>7+ years professional delivery</dd>");
    expect(component).toContain("<dt>Operating model</dt>");
    expect(component).toContain("<dd>Solo founder-led since April 2025</dd>");
    expect(component).toContain("Founded and led by Farid Matovu");
    expect(component).toContain("Founder &amp; Product Engineer");
    expect(component).toContain("Kampala, Uganda");
    expect(component).toContain("GMT+3");
    expect(component).toContain("discovery, domain modelling, product design, implementation, deployment, and support");
    expect(component).toContain("Rishi Reader + production money-lending + inventory/trade platforms");
    expect(component).toContain("https://matovu-farid.com");
    expect(component).toContain("https://www.linkedin.com/in/matovu-farid/");
    expect(component).toMatch(/href="https:\/\/matovu-farid\.com"\s+target="_blank"\s+rel="noopener noreferrer"/);
    expect(component).toMatch(/href="https:\/\/www\.linkedin\.com\/in\/matovu-farid\/"\s+target="_blank"\s+rel="noopener noreferrer"/);
    expect(component).toContain('href="#contact"');
    expect(component).not.toMatch(/<img\b/i);
    expect(component).not.toMatch(/portrait/i);
    expect(contact).toContain("05 / Contact");
    expect(homepage.indexOf("<WhatWeDo />")).toBeLessThan(homepage.indexOf("<CompanyProfile />"));
    expect(homepage.indexOf("<CompanyProfile />")).toBeLessThan(homepage.indexOf("<Contact />"));
  });

  it("uses one profile column at tablet portrait and smaller, and stacks company actions below 768px", () => {
    const styles = readSource("../app/globals.css");

    expect(styles).toMatch(/\.company-profile-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1\.05fr\) minmax\(0, \.85fr\)/);
    expect(styles).toMatch(/@media\s*\(max-width:\s*1193px\)[\s\S]*?\.company-profile-grid,\s*\.company-profile-details\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
    expect(styles).toMatch(/@media\s*\(max-width:\s*767px\)[\s\S]*?\.company-profile-actions,\s*\.company-profile-links\s*\{[\s\S]*?flex-direction:\s*column/);
  });
});
