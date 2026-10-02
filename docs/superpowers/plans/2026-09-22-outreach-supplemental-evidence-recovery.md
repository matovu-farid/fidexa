# Outreach Supplemental-Evidence Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recover suitable outreach targets from remediable research and review gaps without weakening delivery controls.

**Architecture:** Add a separate operator-only mutation that opens a standard new research run for an existing `researched` company. Existing evidence remains append-only; the returned run uses the existing evidence, contact, draft, independent-review, and send gates.

**Tech Stack:** Cloudflare Workers, TypeScript, D1, R2, MCP SDK, Zod, Vitest.

**Status:** Proposed implementation plan; unchecked steps are not evidence of implementation or deployment. The send limit must be read from the current authorized campaign policy and production ledger when executing, not from the historical first-wave limit.

---

### Task 1: Add failing recovery-boundary tests

**Files:**

- Modify: `workers/outreach-gateway/src/service.test.ts`
- Modify: `workers/outreach-gateway/src/mcp.test.ts`
- Modify: `workers/outreach-gateway/src/tool-policy.test.ts`

- [ ] **Step 1: Add a failing service test for a researched company.**

```ts
const result = await startSupplementalResearch(dbContext, {
  schema_version: 1, workflow_run_id: "recovery-run", idempotency_key: "supplemental-1",
  company_id: "company-1", reason: "Verify a public business mailbox.",
});
expect(text(result)).toMatchObject({ state: "researching", supplemental: true });
expect(bound.some(({ sql, args }) => sql.includes("INSERT INTO research_runs") && args.includes("company-1"))).toBe(true);
expect(bound.some(({ sql }) => sql.includes("UPDATE companies SET status = 'researching'"))).toBe(true);
```

- [ ] **Step 2: Add an invalid-state test.**

```ts
await expect(startSupplementalResearch(dbContextFor("discovered"), {
  schema_version: 1, workflow_run_id: "recovery-run", idempotency_key: "supplemental-discovered",
  company_id: "company-1", reason: "Need a public source.",
})).rejects.toThrow("Company is not eligible for supplemental research");
```

- [ ] **Step 3: Add role-exposure tests.**

```ts
expect(allowedToolsForRole("operator")).toContain("start_supplemental_research_run");
expect(allowedToolsForRole("reviewer")).not.toContain("start_supplemental_research_run");
```

- [ ] **Step 4: Verify RED.**

Run: `pnpm test workers/outreach-gateway/src/service.test.ts workers/outreach-gateway/src/mcp.test.ts workers/outreach-gateway/src/tool-policy.test.ts`

Expected: FAIL because `startSupplementalResearch` and its MCP tool do not exist.

### Task 2: Implement the append-only supplemental run

**Files:**

- Modify: `workers/outreach-gateway/src/service.ts`

- [ ] **Step 1: Add the strictly validated input schema.**

```ts
const supplementalResearchRunSchema = researchRunSchema.extend({
  reason: z.string().trim().min(1).max(2_000),
}).strict();
```

- [ ] **Step 2: Add the minimal service mutation.**

```ts
export async function startSupplementalResearch(context: Context, input: unknown) {
  const value = supplementalResearchRunSchema.parse(input);
  const id = crypto.randomUUID();
  return executeIdempotentMutation(context, "supplemental_research_run", id, value, "start_supplemental_research_run", async () => {
    const company = await context.db.prepare("SELECT status FROM companies WHERE id = ? LIMIT 1").bind(value.company_id).first<{ status: string }>();
    if (!company || company.status !== "researched") throw new Error("Company is not eligible for supplemental research");
    await context.db.batch([
      context.db.prepare("INSERT INTO research_runs (id, schema_version, company_id, workflow_run_id, state, started_at, created_at, updated_at) VALUES (?, 1, ?, ?, 'researching', ?, ?, ?)").bind(id, value.company_id, value.workflow_run_id, now(context), now(context), now(context)),
      context.db.prepare("UPDATE companies SET status = 'researching', updated_at = ? WHERE id = ?").bind(now(context), value.company_id),
    ]);
    return { result: { id, state: "researching", supplemental: true }, nextState: "researching", companyId: value.company_id };
  });
}
```

The idempotency event stores the reason in immutable `metadata_json`; no migration or second mutable evidence path is introduced.

- [ ] **Step 3: Verify GREEN.**

Run: `pnpm test workers/outreach-gateway/src/service.test.ts`

Expected: PASS, including the new recovery and invalid-state tests.

### Task 3: Expose only the operator-safe MCP action

**Files:**

- Modify: `workers/outreach-gateway/src/mcp.ts`
- Modify: `workers/outreach-gateway/src/tool-policy.ts`

- [ ] **Step 1: Import and register the action in the operator branch.**

```ts
server.registerTool("start_supplemental_research_run", {
  description: "Open an audited supplemental research run for a researched company with a remediable evidence gap.",
  inputSchema: { schema_version: z.literal(1), workflow_run_id: z.string(), idempotency_key: z.string(), company_id: z.string(), reason: z.string().min(1).max(2000) },
}, (input) => startSupplementalResearch(context("start_supplemental_research_run"), input));
```

- [ ] **Step 2: Add `"start_supplemental_research_run"` to `operatorTools` only.**

- [ ] **Step 3: Run the targeted role tests.**

Run: `pnpm test workers/outreach-gateway/src/mcp.test.ts workers/outreach-gateway/src/tool-policy.test.ts`

Expected: PASS; operator sees the tool and reviewer does not.

### Task 4: Deploy and recover the two live targets

**Files:**

- No further source changes expected.

- [ ] **Step 1: Run the complete Worker verification.**

Run: `pnpm test && pnpm exec tsc --noEmit`

Working directory: `workers/outreach-gateway`

Expected: all tests pass and TypeScript exits 0.

- [ ] **Step 2: Commit only the Worker implementation and test files.**

```bash
git add workers/outreach-gateway/src/service.ts workers/outreach-gateway/src/mcp.ts workers/outreach-gateway/src/tool-policy.ts workers/outreach-gateway/src/service.test.ts workers/outreach-gateway/src/mcp.test.ts workers/outreach-gateway/src/tool-policy.test.ts
git commit -m "feat: recover outreach research evidence"
```

- [ ] **Step 3: Deploy production.**

Run: `pnpm deploy:production`

Working directory: `workers/outreach-gateway`

Expected: a successful deployment of `fidexa-outreach-gateway-production`.

- [ ] **Step 4: Recover La’Oli and Sam West using the new action.**

For each company, create a supplemental run with reason `Public mailbox verification was obtained after the initial research run was completed.` Store the verified public mailbox evidence in that run, upsert the contact, complete the run, create a sourced draft, obtain a fresh independent approval, and send only within the then-current authorized daily cap after all action-time gates pass.

- [ ] **Step 5: Verify production state with remote D1.**

Confirm each company has its original and supplemental research runs, the contact references the new evidence, the message is `delivered`, and the daily total did not exceed the authorized cap.
