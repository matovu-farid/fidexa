import { describe, expect, it } from "vitest";
import { allowedToolsForRole, createOutreachMcpServer } from "./mcp";

describe("MCP server roles", () => {
  it("gives the operator packet staging and post-PASS CRM creation, but no review decision or send tool", () => {
    expect(allowedToolsForRole("operator")).toContain("prepare_pre_review_packet");
    expect(allowedToolsForRole("operator")).toContain("read_pre_review_packet");
    expect(allowedToolsForRole("operator")).toContain("create_outreach_draft");
    expect(allowedToolsForRole("operator")).not.toContain("approve_outreach_draft");
    expect(allowedToolsForRole("operator")).not.toContain("send_approved_outreach");
    expect(allowedToolsForRole("operator")).not.toContain("submit_outreach_for_review");
  });

  it("gives the independent reviewer only packet read and exact-version decision tools", () => {
    expect(allowedToolsForRole("reviewer")).toEqual(["read_pre_review_packet", "review_pre_review_packet"]);
    expect(allowedToolsForRole("reviewer")).not.toContain("create_outreach_draft");
    expect(allowedToolsForRole("reviewer")).not.toContain("send_approved_outreach");
  });

  it("does not register legacy review-first-after-draft tools or gateway sending", () => {
    const db = {} as D1Database;
    for (const role of ["operator", "reviewer"] as const) {
      const server = createOutreachMcpServer(role, { OUTREACH_DB: db, OUTREACH_BUCKET: {} as R2Bucket });
      const tools = (server as unknown as { _registeredTools: Record<string, unknown> })._registeredTools;
      expect(Object.keys(tools)).not.toContain("submit_outreach_for_review");
      expect(Object.keys(tools)).not.toContain("approve_outreach_draft");
      expect(Object.keys(tools)).not.toContain("send_approved_outreach");
    }
  });
});
