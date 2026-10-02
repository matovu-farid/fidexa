import { describe, expect, it } from "vitest";
import { canCallTool, operatorTools, reviewerTools } from "./tool-policy";

describe("MCP tool policy", () => {
  it("stages only review packets before independent PASS and keeps sending outside the gateway", () => {
    expect(operatorTools.has("create_company")).toBe(true);
    expect(operatorTools.has("lookup_company_identity")).toBe(true);
    expect(operatorTools.has("record_company_alias")).toBe(true);
    expect(operatorTools.has("record_company_identity_resolution")).toBe(true);
    expect(operatorTools.has("prepare_pre_review_packet")).toBe(true);
    expect(operatorTools.has("create_outreach_draft")).toBe(true);
    expect(operatorTools.has("submit_outreach_for_review")).toBe(false);
    expect(operatorTools.has("submit_outreach_review")).toBe(false);
    expect(reviewerTools.has("read_pre_review_packet")).toBe(true);
    expect(reviewerTools.has("review_pre_review_packet")).toBe(true);
    expect(reviewerTools.size).toBe(2);
    expect(reviewerTools.has("lookup_company_identity")).toBe(false);
    expect(reviewerTools.has("record_company_alias")).toBe(false);
    expect(reviewerTools.has("record_company_identity_resolution")).toBe(false);
    expect(canCallTool("operator", "send_approved_outreach")).toBe(false);
    expect(canCallTool("operator", "start_supplemental_research_run")).toBe(true);
    expect(canCallTool("reviewer", "send_approved_outreach")).toBe(false);
    expect(canCallTool("reviewer", "start_supplemental_research_run")).toBe(false);
  });
});
