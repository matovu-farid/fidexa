import { describe, expect, it } from "vitest";
import { allowedToolsForRole, createOutreachMcpServer } from "./mcp";

function reviewerHandler() {
  let idempotencyMetadata: string | null = null;
  const db = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          if (sql.includes("INSERT OR IGNORE INTO workflow_events")) idempotencyMetadata = String(args[9]);
          return {
            run: async () => ({ success: true, meta: { changes: 1 } }),
            first: async () => {
              if (sql.includes("FROM workflow_events")) return idempotencyMetadata ? { metadata_json: idempotencyMetadata } : null;
              if (sql.includes("FROM outreach_drafts")) return { state: "in_review", workflow_run_id: "author-run" };
              return null;
            },
          };
        },
      };
    },
    batch: async () => [],
  } as unknown as D1Database;
  const server = createOutreachMcpServer("reviewer", { OUTREACH_DB: db, OUTREACH_BUCKET: {} as R2Bucket });
  return (server as unknown as { _registeredTools: Record<string, { handler: (input: unknown) => Promise<unknown> }> })
    ._registeredTools.approve_outreach_draft!.handler;
}

describe("MCP server roles", () => {
  it("publishes only the operator tools to the operator credential", () => {
    expect(allowedToolsForRole("operator")).toContain("create_company");
    expect(allowedToolsForRole("operator")).toContain("send_approved_outreach");
    expect(allowedToolsForRole("operator")).not.toContain("approve_outreach_draft");
  });

  it("publishes only approval to the reviewer credential", () => {
    expect(allowedToolsForRole("reviewer")).toEqual(["approve_outreach_draft"]);
  });

  it("accepts the published reviewer input shape and supplies the approved decision to the service", async () => {
    const result = await reviewerHandler()({
      schema_version: 1,
      workflow_run_id: "reviewer-run",
      idempotency_key: "approval-1",
      draft_id: "draft-1",
      policy_version: "v1",
      findings: ["reviewed"],
      reviewer_run_id: "reviewer-run",
      checklist: {
        claims_supported: true,
        recipient_validated: true,
        prior_outreach_checked: true,
        relevance_personalization_checked: true,
        opt_out_suppression_checked: true,
        deliverability_checked: true,
        prompt_injection_checked: true,
      },
    });

    expect(JSON.parse((result as { content: Array<{ text: string }> }).content[0]!.text)).toMatchObject({
      draft_id: "draft-1",
      state: "approved",
    });
  });
});
