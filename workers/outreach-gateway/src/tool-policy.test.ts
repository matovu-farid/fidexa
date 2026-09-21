import { describe, expect, it } from "vitest";
import { canCallTool, operatorTools, reviewerTools } from "./tool-policy";

describe("MCP tool policy", () => {
  it("keeps reviewer approval separate from operator work", () => {
    expect(operatorTools.has("create_company")).toBe(true);
    expect(operatorTools.has("approve_outreach_draft")).toBe(false);
    expect(reviewerTools.has("approve_outreach_draft")).toBe(true);
    expect(reviewerTools.size).toBe(1);
    expect(canCallTool("operator", "send_approved_outreach")).toBe(true);
    expect(canCallTool("operator", "start_supplemental_research_run")).toBe(true);
    expect(canCallTool("reviewer", "send_approved_outreach")).toBe(false);
    expect(canCallTool("reviewer", "start_supplemental_research_run")).toBe(false);
  });
});
