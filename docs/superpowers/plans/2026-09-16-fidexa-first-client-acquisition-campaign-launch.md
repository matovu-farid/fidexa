# Fidexa First Client-Acquisition Campaign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Launch Fidexa's first controlled, evidence-led international client-acquisition campaign and send its first approved messages.

**Architecture:** Public company pages are the only research source. Each qualified company, source record, verified business mailbox, draft, independent review, delivery attempt, and follow-up is stored through the production outreach Worker MCP surface. Worker policy gates—not campaign prose—enforce the separate review and controlled-send requirements.

**Tech Stack:** Cloudflare Worker, D1, private R2 evidence, Resend, Fidexa admin reporting, authenticated MCP over HTTPS.

---

### Task 1: Establish the controlled send configuration

**Files:**
- Read: `workers/outreach-gateway/wrangler.jsonc`
- Read: `docs/superpowers/specs/2026-09-16-fidexa-first-client-acquisition-campaign-design.md`

- [ ] **Step 1: Verify production starts paused**

Run:

```bash
pnpm exec wrangler deployments list --config workers/outreach-gateway/wrangler.jsonc --env production
```

Expected: the production Worker is reachable and its deployed configuration is known before changing any delivery control.

- [ ] **Step 2: Set the first-wave daily limit**

Set `OUTBOUND_ENABLED=true` and `DAILY_SEND_LIMIT=3` only after at least one draft has passed independent review. Keep `SYNC_ENABLED=false`; Zoho sync is outside this launch.

- [ ] **Step 3: Verify the send gate with production reporting**

Open `/admin/outreach` while authenticated and confirm no message exists before the first send.

### Task 2: Build a ten-company evidence-led research queue

**Files:**
- Read: `docs/superpowers/specs/2026-09-16-fidexa-first-client-acquisition-campaign-design.md`
- Read: `workers/outreach-gateway/src/mcp.ts`

- [ ] **Step 1: Search public company sites**

Find no more than ten companies in lending/specialty finance, distribution/trade, property/facilities, or multi-location services. For every retained company, capture a public operational-fit signal and a public business contact source.

- [ ] **Step 2: Reject weak candidates**

Exclude companies with only a generic website need, no public operational signal, no verifiable business mailbox, a previous outreach record, or a suppression/negative signal.

- [ ] **Step 3: Persist qualified research**

For each retained company invoke, in order: `create_company`, `start_research_run`, `store_evidence`, `record_finding`, `upsert_contact`, and `complete_research_run`. Use a unique workflow run ID and idempotency key for every mutation.

- [ ] **Step 4: Verify visibility**

Open `/admin/outreach` while authenticated. Expected: qualified companies, research findings, evidence metadata, and verified contacts are visible without exposing credentials.

### Task 3: Draft and independently review the first send cohort

**Files:**
- Read: `docs/superpowers/specs/2026-09-16-fidexa-first-client-acquisition-campaign-design.md`
- Read: `workers/outreach-gateway/src/mcp.ts`

- [ ] **Step 1: Select no more than three highest-fit companies**

Choose candidates whose evidence supports a specific workflow question and whose public mailbox routes relevant business enquiries.

- [ ] **Step 2: Create evidence-backed drafts**

Invoke `create_outreach_draft` for each selected contact. Each body includes exactly one public company signal and one qualified operational question; every claim evidence ID must belong to that company.

- [ ] **Step 3: Independently approve each draft**

Using the reviewer credential and a distinct reviewer workflow run ID, invoke `approve_outreach_draft` only if all seven checklist items are true. Reject or revise any draft that fails a check.

- [ ] **Step 4: Verify draft review state**

Open each company detail in `/admin/outreach`. Expected: draft body, evidence linkage, and complete independent-review checklist are visible.

### Task 4: Send, monitor, and schedule a respectful follow-up

**Files:**
- Read: `workers/outreach-gateway/src/service.ts`
- Read: `docs/superpowers/specs/2026-09-16-fidexa-first-client-acquisition-campaign-design.md`

- [ ] **Step 1: Enable the three-message first wave**

Deploy production configuration with `OUTBOUND_ENABLED=true`, `DAILY_SEND_LIMIT=3`, and `SYNC_ENABLED=false`.

- [ ] **Step 2: Send each approved draft once**

Invoke `send_approved_outreach` with a unique idempotency key per draft. Expected: a `sent` state and a Resend provider message ID, or a recorded non-retryable failure.

- [ ] **Step 3: Schedule one conditional follow-up**

For a successfully sent message, invoke `schedule_follow_up` for seven days later with: `Follow up only if no reply or opt-out is recorded; send no more than one follow-up.`

- [ ] **Step 4: Verify delivery records**

Open `/admin/outreach` and each company detail. Expected: messages are visible with provider events when received, and every follow-up is linked to the correct company/contact/message.

- [ ] **Step 5: Pause on harm signals**

If a bounce, complaint, opt-out, or negative signal occurs, stop additional sends and record the outcome before deciding the next wave.
