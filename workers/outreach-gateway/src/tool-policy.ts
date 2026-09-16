export type McpRole = "operator" | "reviewer";

export const operatorTools = new Set([
  "create_company",
  "upsert_contact",
  "start_research_run",
  "record_finding",
  "store_evidence",
  "complete_research_run",
  "create_outreach_draft",
  "submit_outreach_for_review",
  "submit_outreach_review",
  "send_approved_outreach",
  "schedule_follow_up",
]);

export const reviewerTools = new Set(["approve_outreach_draft"]);

export function canCallTool(role: McpRole, toolName: string): boolean {
  return (role === "operator" ? operatorTools : reviewerTools).has(toolName);
}
