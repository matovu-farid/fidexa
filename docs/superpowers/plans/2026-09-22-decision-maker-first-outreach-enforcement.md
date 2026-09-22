# Decision-Maker-First Outreach Enforcement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent new outreach sends unless the recipient is a publicly evidenced decision-maker and the independent review records person-specific, company-specific, devil’s-advocate checks.

**Architecture:** Extend `contacts` with append-only decision-maker qualification metadata. Enforce that qualification at draft creation and again at send time; extend the reviewer checklist so approvals cannot be reused from the prior public-inbox policy. Preserve existing research contacts as unqualified rather than deleting or mutating their history.

**Tech Stack:** Cloudflare Workers, D1 migrations, TypeScript, Zod, Vitest, Model Context Protocol.

---

### Task 1: Persist decision-maker qualification

**Files:**
- Create: `workers/outreach-gateway/migrations/0007_decision_maker_qualification.sql`
- Modify: `workers/outreach-gateway/src/d1.ts`
- Test: `workers/outreach-gateway/src/d1.test.ts`

- [ ] Add nullable decision-maker evidence and rationale plus a false-by-default qualification flag. Existing contacts must remain unqualified.

```sql
ALTER TABLE contacts ADD COLUMN is_decision_maker INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contacts ADD COLUMN decision_maker_evidence_id TEXT;
ALTER TABLE contacts ADD COLUMN decision_maker_reason TEXT;
```

- [ ] Extend `ContactInput` and `upsertContact` so the fields are inserted and refreshed on same-company upsert.
- [ ] Add a D1 unit test asserting that a qualified upsert writes `1`, its evidence ID, and its reason; retain the existing unqualified-contact test.
- [ ] Run `pnpm exec vitest run workers/outreach-gateway/src/d1.test.ts` and require a passing result.

### Task 2: Validate decision-maker evidence at the operator boundary

**Files:**
- Modify: `workers/outreach-gateway/src/validation.ts`
- Modify: `workers/outreach-gateway/src/mcp.ts`
- Modify: `workers/outreach-gateway/src/service.ts`
- Test: `workers/outreach-gateway/src/service.test.ts`

- [ ] Add optional `is_decision_maker`, `decision_maker_evidence_id`, and `decision_maker_reason` to `contactInputSchema`.
- [ ] Reject inputs that set `is_decision_maker: true` unless name, role, evidence ID, and rationale are all supplied; when qualification evidence is supplied, require it to belong to the company and workflow run.
- [ ] Expose the same fields in `upsert_contact`’s MCP schema and persist them through `createContact`.
- [ ] Add service tests for: rejected incomplete qualification; rejected cross-company qualification evidence; and accepted qualified decision-maker contact.
- [ ] Run `pnpm exec vitest run workers/outreach-gateway/src/service.test.ts` and require a passing result.

### Task 3: Fail closed for public-inbox or non-decision-maker drafting and sending

**Files:**
- Modify: `workers/outreach-gateway/src/service.ts`
- Modify: `workers/outreach-gateway/src/domain.ts`
- Test: `workers/outreach-gateway/src/service.test.ts`
- Test: `workers/outreach-gateway/src/domain.test.ts`

- [ ] Change `createDraft`’s contact lookup to require a qualified decision-maker with stored evidence and rationale; return a bounded error when the contact is not qualified.
- [ ] Add `decisionMakerVerified` to `DraftState`; require it in `isSendableDraft`.
- [ ] Extend `sendApproved`’s draft/contact query and `isSendableDraft` call to re-check the persisted decision-maker qualification at send time.
- [ ] Add tests proving an approved prior-policy draft cannot send without the new qualification, and a qualified draft remains sendable only when all existing gates pass.
- [ ] Run `pnpm exec vitest run workers/outreach-gateway/src/domain.test.ts workers/outreach-gateway/src/service.test.ts` and require a passing result.

### Task 4: Require a decision-maker and devil’s-advocate approval record

**Files:**
- Modify: `workers/outreach-gateway/src/validation.ts`
- Modify: `workers/outreach-gateway/src/mcp.ts`
- Test: `workers/outreach-gateway/src/mcp.test.ts`
- Test: `workers/outreach-gateway/src/service.test.ts`

- [ ] Require these three true approval checklist fields: `decision_maker_verified`, `company_specific_evidence_checked`, and `devils_advocate_objections_addressed`.
- [ ] Update reviewer MCP input schema and every approval fixture with the new true values.
- [ ] Add a test that an approval missing any new field fails validation and cannot later pass the send gate.
- [ ] Run `pnpm exec vitest run workers/outreach-gateway/src/mcp.test.ts workers/outreach-gateway/src/service.test.ts` and require a passing result.

### Task 5: Deploy, migrate, and align the continuous campaign loop

**Files:**
- Modify: `docs/superpowers/specs/fidexa-campaign-learning-log.md`

- [ ] Run the focused unit tests plus `pnpm exec tsc --noEmit -p workers/outreach-gateway/tsconfig.json`.
- [ ] Apply migration `0007` to production and deploy the Worker.
- [ ] Verify production MCP rejects an old approved public-inbox draft and accepts only a newly qualified decision-maker workflow.
- [ ] Update the hourly automation prompt to require the decision-maker-first policy and to hold/research generic-inbox records instead of sending them.
- [ ] Append a factual rollout checkpoint to the learning log. Commit only files created or modified by this implementation and push `main`.
