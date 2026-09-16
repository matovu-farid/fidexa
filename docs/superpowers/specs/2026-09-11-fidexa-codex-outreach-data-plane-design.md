# Fidexa Codex Outreach Data Plane

Date: 2026-09-11
Status: Approved for implementation

## Goal

Give Codex responsibility for discovering, researching, reviewing, and recording prospective Fidexa clients without making Codex a dependency of the Fidexa web application.

## Approved architecture

Codex is the operational writer. It uses MCP tools exposed by a dedicated Cloudflare Worker. The Worker validates requests, applies outreach business rules, stores structured records in D1, stores source material and generated documents in private R2, and sends only approved messages through Resend.

The Fidexa dashboard is a read-oriented administration surface. It reads the same D1/R2 data through authenticated Worker routes, but it does not call Codex and does not need to know which Codex run produced a record.

The existing Fidexa application already owns Better Auth, the admin shell, and its Postgres database. This feature adds an outreach read adapter and an admin route; it does not migrate or replace those existing systems.

```text
Codex
  ↓ MCP
Outreach Worker
  ├── D1: structured outreach records
  ├── R2: dossiers, evidence, documents
  └── Resend: approved outbound mail

Fidexa dashboard
  ↓ authenticated read routes
Outreach Worker
```

This is a shared-storage contract, not a service-to-service integration. The contract is versioned schemas, immutable evidence references, and append-only workflow events.

## Why this boundary

- The production Fidexa database remains unchanged and isolated from autonomous outreach work.
- Codex cannot execute arbitrary SQL or write arbitrary R2 keys.
- Worker validation makes duplicate prevention, review gates, and audit history deterministic.
- The dashboard can continue operating even when Codex is not running.
- Codex can be replaced later without changing the dashboard data model.

## Storage responsibilities

### D1

D1 is the queryable index and workflow state:

- `companies`
- `contacts`
- `research_runs`
- `research_findings`
- `evidence_refs`
- `outreach_drafts`
- `review_runs`
- `messages`
- `message_events`
- `workflow_events`
- `follow_ups`
- `suppressions`
- `zoho_sync_state`

Every record has `schema_version`, `created_at`, `updated_at`, and an idempotency key where an external action can be retried.

Suppression records are checked before every send and can be created from an explicit opt-out, a hard bounce, a complaint, or an administrator action. They are never deleted merely because a prospect is archived.

### R2

R2 is private object storage for larger or immutable material:

- `research/<company-id>/<run-id>/source-*`
- `research/<company-id>/<run-id>/dossier.json`
- `outreach/<company-id>/<draft-id>/draft.md`
- `outreach/<company-id>/<draft-id>/review.json`
- `messages/<message-id>/attachments/*`

R2 objects are private and are accessed only through short-lived, authenticated Worker responses. The browser never receives bucket credentials.

## MCP write surface

The remote MCP surface exposes narrow domain actions, not database primitives:

- `create_company`
- `upsert_contact`
- `start_research_run`
- `record_finding`
- `store_evidence`
- `complete_research_run`
- `create_outreach_draft`
- `submit_outreach_review`
- `approve_outreach_draft`
- `send_approved_outreach`
- `schedule_follow_up`

The Worker exposes these tools through a dedicated `/mcp` endpoint using the MCP Streamable HTTP transport. The operator and reviewer use separate MCP credentials and tool allowlists. Provider delivery events and Zoho reply ingestion are internal Worker operations, not Codex-writable tools. The Worker does not expose D1 or R2 as generic MCP resources.

The operator can create and submit a draft for review, but cannot approve it. Approval requires a separate reviewer run with a different run ID and reviewer credential. The Worker rejects a review that uses the draft author's run ID or credential.

The Worker rejects unknown tools, unknown fields, stale schema versions, duplicate idempotency keys with conflicting payloads, and writes that violate state transitions.

## Review and send policy

Codex may discover prospects, save research, and create drafts. A draft must pass review before sending. The review record must include:

- evidence references for factual claims;
- recipient validation result;
- duplicate/outreach-history check;
- personalization and relevance check;
- opt-out and suppression check;
- contact verification method, verification timestamp, and evidence reference;
- spam-risk and deliverability check;
- explicit reviewer decision, policy version, reviewer run ID, and timestamp.

The Worker, not the model prompt, enforces the final send condition. `send_approved_outreach` succeeds only when the draft is approved by a distinct reviewer run, the approval is current, the recipient is not suppressed, the contact was verified through an allowed method, and the idempotency key has not already been sent.

Research pages, email bodies, attachments, and external documents are untrusted input. They are stored as evidence, never treated as instructions, and never executed or rendered as unsanitized HTML.

## Read surface for Fidexa

The Worker exposes authenticated read routes for:

- pipeline summaries;
- companies and contacts;
- research dossier metadata and evidence links;
- draft/review/send states;
- delivery and reply history;
- follow-up queue;
- audit timeline.

The Fidexa dashboard is read-only for the first milestone. Administrative mutations can be added later as separate Worker commands if needed.

## Email and inbound responses

Resend remains the outbound provider. The Worker records the message before sending and records provider events through a signed Resend webhook route. Provider retries are idempotent and a failed send remains visible as a retryable state.

Zoho Mail is the inbound mailbox and the source of truth for replies. Codex can inspect the signed-in Zoho mailbox during interactive runs. For unattended runs, the Worker uses an internal Zoho Mail API/OAuth adapter with a durable cursor in `zoho_sync_state`; it imports only messages newer than the cursor, records Zoho message IDs for deduplication, and never attempts to mirror the entire mailbox. OAuth refresh tokens remain Worker secrets; D1 stores only the cursor and sync metadata. Browser session cookies are not part of the durable architecture. The rejected virtual-inbox design is not part of this system.

## Credentials

- Codex uses a dedicated, least-privilege Worker/MCP credential.
- The Worker owns D1, R2, Resend, and webhook secrets.
- Fidexa receives a read-only Worker credential or signed service request capability.
- No D1, R2, Resend, or Zoho secrets are sent to the browser.
- Production Fidexa database credentials are not given to Codex.
- The Worker applies request size limits, per-tool rate limits, and a kill switch for outbound sending.
- R2 evidence has retention metadata and is deleted through an auditable cleanup job.
- Contact verification accepts only documented methods such as a public company-domain mailbox, a verified company contact page, or explicit administrator verification; guessed address patterns are rejected.

## Rollout

1. Create isolated `fidexa-outreach` D1 and `fidexa-outreach` R2 resources.
2. Implement schema, validation, idempotency, and audit events.
3. Implement MCP writes and read-only dashboard queries.
4. Run Codex in dry-run mode: discovery and research only.
5. Enable draft and independent review records.
6. Enable Resend sending for approved drafts with conservative limits.
7. Add inbound response ingestion and learning reports.

Every rollout stage has a rollback switch. Outbound sending remains disabled until replay, suppression, prompt-injection, duplicate, and provider-failure tests pass.

## Non-goals

- Replacing Fidexa's existing Postgres database.
- Letting Codex execute arbitrary SQL or access arbitrary R2 objects.
- Making the Fidexa dashboard dependent on a live Codex session.
- Sending outreach without an auditable review record.
- Treating browser login state as a production integration.
- Importing or retaining the full Zoho mailbox.
