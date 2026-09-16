import { describe, expect, it } from "vitest";
import { buildEvidenceKey, normalizeEmail, normalizeDomain } from "./persistence";

describe("outreach persistence boundaries", () => {
  it("normalizes deduplication keys", () => {
    expect(normalizeEmail("  CEO@Example.COM ")).toBe("ceo@example.com");
    expect(normalizeDomain("https://www.Example.com/about")).toBe("example.com");
  });

  it("builds safe namespaced evidence keys", () => {
    expect(buildEvidenceKey("company-1", "run-1", "dossier.json", "object-1")).toBe("research/company-1/run-1/object-1-dossier.json");
    expect(() => buildEvidenceKey("../escape", "run-1", "dossier.json")).toThrow();
    expect(() => buildEvidenceKey("company-1", "run-1", "../escape")).toThrow();
  });

  it("gives same-name evidence independent immutable object keys", () => {
    const first = buildEvidenceKey("company-1", "run-1", "dossier.json", "object-a");
    const second = buildEvidenceKey("company-1", "run-1", "dossier.json", "object-b");
    expect(first).not.toBe(second);
    expect(first).toContain("dossier.json");
    expect(second).toContain("dossier.json");
  });
});
