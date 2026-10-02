export type McpRole = "operator" | "reviewer";

export const operatorTools = new Set([
  "create_company",
  "lookup_company_identity",
  "record_company_alias",
  "record_company_identity_resolution",
  "hold_qualification",
  "reopen_qualification",
  "upsert_contact",
  "start_research_run",
  "start_supplemental_research_run",
  "record_finding",
  "store_evidence",
  "complete_research_run",
  "prepare_pre_review_packet",
  "read_pre_review_packet",
  "create_outreach_draft",
  "schedule_follow_up",
]);

export const reviewerTools = new Set(["read_pre_review_packet", "review_pre_review_packet"]);

export function canCallTool(role: McpRole, toolName: string): boolean {
  return (role === "operator" ? operatorTools : reviewerTools).has(toolName);
}
