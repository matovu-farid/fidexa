# Fidexa outreach gateway

This Worker is Fidexa's isolated outreach data plane. Codex uses the narrow `/mcp` tool surface; Fidexa uses signed, read-only `/reporting/*` routes. D1 and R2 remain private bindings. No endpoint accepts arbitrary SQL, bucket credentials, or browser login state.

## Safety state

**Campaign-operation boundary:** the current user-approved campaign workflow sends and checks mail only in the signed-in Zoho Mail browser. This Worker is legacy infrastructure and is not the authorized campaign sender or mailbox reader. The checked-in Wrangler file sets `OUTBOUND_ENABLED=false` and `SYNC_ENABLED=false` for both environments, but a local file does not prove the deployed Worker configuration or secrets. Do not invoke its send/sync tools, enable Resend, or treat gateway rows as Zoho evidence. Production state has not been verified as part of the browser-only workflow.

The separate campaign-learning page at `/admin/outreach/learning` records operator-entered Zoho observations. It does not connect to this Worker or to Zoho. Its database migration must be reviewed and applied through the approved application release process before the page can persist data.

The checked-in staging settings are:

```text
OUTBOUND_ENABLED=false
SYNC_ENABLED=false
DAILY_SEND_LIMIT=0
```

The checked-in production variables say `OUTBOUND_ENABLED=false`, `SYNC_ENABLED=false`, and `DAILY_SEND_LIMIT=100`. This is repository configuration only, not verified deployed state. The 100-message cap is not authority to use this Worker or change any deployed setting.

The following deployment identifiers are historical records only; they were not revalidated on 2026-10-01 and must not be represented as current live state: previously recorded staging versions `e854fe64-5c17-49a1-a665-8b43e5cfa42b` and `d6fb8009-0ba0-4d8e-ab3b-728d9784beb8`, and production version `8f69e4ce-4757-4f0a-bed9-4c416c4d4638`. The earlier record said migrations `0001`-`0006` were applied in both environments; current remote migration state and Zoho OAuth/account/folder secrets have not been checked.

The checked-in Wrangler config requests a 15-minute cron, but a prior Cloudflare registration attempt was rejected because the Free-plan account already had five triggers (`10072`). The currently deployed trigger state has not been rechecked, so do not claim that the cron is active. In source, `scheduled()` performs retention cleanup only. It never invokes the legacy Zoho API-sync module, even if `SYNC_ENABLED=true`; there is no Worker entrypoint that reads the Zoho mailbox. `scheduleFollowUp()` only stores a dated row. Follow-ups remain visible review tasks, never a background email send.

Older deployment notes record operator/reviewer, Fidexa read, Resend API, and Resend webhook secrets. Their current deployed presence and values have not been verified here. Never commit or print secret values. Do not use any Resend credentials for Fidexa campaign outreach.

## Authentication and roles

Use `Authorization: Bearer <token>` for ordinary MCP clients. The token is compared against the operator and reviewer secrets and determines the role:

- operator: company/contact research, immutable pre-review packet preparation, packet read, CRM draft creation from a passed packet, and follow-up reminders;
- reviewer: `read_pre_review_packet` and `review_pre_review_packet` only. Reviewer credentials cannot author packets, create CRM drafts, or send.

Use separate credentials and workflow runs for operator and reviewer work. Reviewers must read the exact packet and its bounded supporting evidence before submitting one `approved` or `needs_changes` decision. An approval is bound to a SHA-256 over the subject, body, and exact booking/email/website link manifest. The manifest requires the approved Zoho Bookings URL, `mailto:farid@fidexa.org`, and `https://www.fidexa.org`; its human-readable anchor text must occur in the message body, and raw destination URLs must not be pasted there. The reviewer checks that all three link controls and natural opt-out language are present; a signature block is optional at the user's direction. Failed findings are preserved; repairs create a new version that supersedes the failed packet and needs a fresh independent review. CRM draft creation rejects missing, failed, stale, tampered, or same-author approvals. The packet stage is not a CRM/Zoho draft and does not send anything. After PASS, the operator still composes the email in Zoho using Insert Link for each approved anchor and verifies the rendered links before sending.

Company intake deduplicates by normalized domain without replacing the existing record's company facts or status. Same-company email matches return the existing contact without overwriting its verified name, role, evidence, or decision-maker status; cross-company reassignments are rejected. The gateway's D1 binding is private and the gateway service is the supported company-write path. A database trigger blocks new same-name cases when either company lacks a domain (including concurrent gateway inserts), provided each row has the application-generated identity key; intake returns `possible_duplicate` with the existing record ID and creates nothing. SQLite cannot independently verify JavaScript's NFKC normalization, so privileged ad hoc SQL that forges `identity_name_key` is outside this database guard's guarantee and is not an authorized write path. Migration `0011` adds an append-only, evidence-linked alias registry and exact `lookup_company_identity` tool. It distinguishes legal/trading/former names and domains (`same_entity`) from brands, parent groups, subsidiaries, and divisions (`related_entity`); exact matches can be ambiguous across multiple companies. Same-entity alias/domain matches are surfaced as `possible_duplicate`, while related-entity aliases are never merged. Migration `0012` adds an append-only `record_company_identity_resolution` event for a documented same-entity or distinct-entity finding. A `distinct_entity` result requires current evidence and a completed research run tied to a collision candidate, and authorizes only the exact proposed NFKC-normalized name/domain pair. The application uses the same NFKC/whitespace key for canonical names and aliases. Because SQLite cannot perform that Unicode normalization reliably, migration `0012` leaves legacy canonical-name keys null; identity lookup, identity resolution, and company creation lazily backfill them in application code. A database trigger blocks new company inserts while any legacy row is unindexed, and backfilled keys cannot later be changed. All other conflicting candidates still block creation. `create_company` must cite the resolution; the new company stores its single-use resolution ID, which is immutable along with the identity fields it authorizes. Same-entity decisions never authorize a second record. No company records are merged, and an unresolved or mismatched case remains blocked.

The signed-header fallback uses `x-mcp-role`, unique `x-mcp-request-id`, `x-mcp-timestamp`, and `x-mcp-signature`. Signed MCP and reporting request IDs are claimed in D1 and rejected on replay. Tool idempotency is separate and returns a saved result only for the same payload.

## Persistence and recovery

Migrations `0001`-`0012` are present in the repository. Migration `0008` adds append-only versioned pre-review packets, reviewer read receipts and exact-version decisions, plus the packet foreign key on CRM drafts. Migration `0009` adds normalized company names and a database trigger preventing ambiguous domainless name collisions. Migration `0010` adds source lanes and append-only reason-coded hold/reopen history; each eligible lane requires matching source evidence in the reviewed packet, and a reopen requires company-linked evidence captured in a completed post-hold research run. Formal-procurement and unclassified records cannot enter cold-email pre-review/send gates, and a hold cannot be cleared by merely starting research. Migration `0011` adds the evidence-linked, append-only company alias registry and its validation triggers. Migration `0012` adds application-normalized NFKC identity keys, evidence-backed resolution history, exact-target authorization, and a single-use identity reference on newly created companies. Legacy key backfill is performed by application code and is guarded by database triggers. Migrations 0011–0012 have been exercised in SQLite integration tests only; no configured or production database migration was run. The README's earlier deployment record lists only migrations `0001`-`0006`; that is historical and does not establish the current remote migration state.

Generic non-send mutations use owner-token idempotency claims. An operation failure releases only the winning claim so the identical request can retry. If the domain mutation returns but ledger finalization fails, the claim deliberately remains in progress: this is fail-closed protection against repeating an already-committed side effect. Inspect the persisted entity and audit state before any operator remediation; do not issue a new key blindly. Evidence compensation deletes R2 before its D1 reference so failed cleanup remains discoverable by retention.

Campaign messages are created and sent only through the signed-in Zoho Mail browser under the current user-approved workflow. The MCP role policy does not register a send tool; do not use Resend or treat historical gateway records as Zoho state. The legacy sender implementation and environment variables are retained for audit/backward compatibility, but they are not an authorized campaign route. This source change does not verify or modify deployed configuration.

Scheduled cleanup removes the R2 object before its expired D1 evidence reference and audits bounded counts. Zoho uses exact addresses, bounded descending pages, durable continuation, and a composite time/message watermark. New or legacy-null state starts at the current boundary rather than importing mailbox history. Cleanup and Zoho failures are isolated and audited.

Company reporting is bounded to that company's research, findings, evidence metadata, drafts/reviews, messages/events, follow-ups, and workflow timeline. Evidence bodies pass through the Better Auth-protected Fidexa server proxy; no private R2 URL or signing secret reaches the browser.

## Local verification

From the repository root:

```bash
pnpm exec vitest run workers/outreach-gateway/src/*.test.ts
pnpm exec tsc --noEmit -p workers/outreach-gateway/tsconfig.json
```

For local development, copy `.dev.vars.example` to `.dev.vars`, provide local-only values, and retain the disabled switches. The final 2026-09-16 local run passed 29 files and 136 tests; both typechecks and the production build also passed.

## Historical rollout notes — not current operating instructions

The commands and deployment identifiers below are retained for audit context only. They are not authorization to migrate, configure, or deploy the Worker. The user's Zoho-browser-only direction takes precedence; no campaign send, mailbox sync, migration, or production mutation is part of this workflow.

Apply and deploy staging first:

```bash
pnpm exec wrangler d1 migrations list fidexa-outreach-staging --remote \
  --config workers/outreach-gateway/wrangler.jsonc --env staging
pnpm exec wrangler d1 migrations apply fidexa-outreach-staging --remote \
  --config workers/outreach-gateway/wrangler.jsonc --env staging
pnpm exec wrangler deploy \
  --config workers/outreach-gateway/wrangler.jsonc --env staging
```

Staging verification passed wrong-token rejection, 10 operator tools, reviewer-only approval, a controlled full workflow after the final safety fixes, `paused/outbound_disabled` send behavior, signed reporting/evidence reads, and replay rejection. The refreshed Vercel preview is `READY` at `https://fidexa-qlz8osau1-farids-projects-186e7dae.vercel.app`; unauthenticated redirect plus admin-auth no-overflow and console checks passed. The production deployment `dpl_HmUbb38bV4WtKZ3EDGroE1G6tcvZ` is live at `https://www.fidexa.org`. Exact 1512×982 and 393×852 browser passes remain unverified because the Luna browser surface did not expose viewport controls.

Rollout record: the prior staging Worker was `0b9745b1-6f9c-40be-9581-92f4785c0741`, and the staging pre-change D1 bookmark is `00000005-00000000-000050e8-69dd80013636d4dbda8632d296298ea8`. The prior production Worker was `f0e766ac-a999-4b53-9668-811dcb389c57`, and the production pre-change bookmark is `0000000a-00000023-000050e8-5992bf575c391f09fca37f82f2b57e82`.

The following production commands are preserved as historical documentation. Do not execute them for current Fidexa campaigns or this learning-ledger change:

```bash
pnpm exec wrangler d1 migrations list fidexa-outreach-production --remote \
  --config workers/outreach-gateway/wrangler.jsonc --env production
pnpm exec wrangler d1 migrations apply fidexa-outreach-production --remote \
  --config workers/outreach-gateway/wrangler.jsonc --env production
pnpm exec wrangler deploy \
  --config workers/outreach-gateway/wrangler.jsonc --env production
```

Capture the pre-change Worker version and D1 Time Travel bookmark before each rollout. Roll back Worker code with `wrangler rollback <version-id> --config workers/outreach-gateway/wrangler.jsonc --env <environment> --yes`. Restore D1 by bookmark only for a confirmed schema/data incident; it rewinds later changes. The full checklist and exact commands are in `docs/superpowers/specs/2026-09-11-fidexa-codex-outreach-runbook.md`.
