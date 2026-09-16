# Fidexa outreach gateway

This Worker is Fidexa's isolated outreach data plane. Codex uses the narrow `/mcp` tool surface; Fidexa uses signed, read-only `/reporting/*` routes. D1 and R2 remain private bindings. No endpoint accepts arbitrary SQL, bucket credentials, or browser login state.

## Safety state

Staging and production must remain:

```text
OUTBOUND_ENABLED=false
SYNC_ENABLED=false
DAILY_SEND_LIMIT=0
```

The current implementation is deployed to staging from code version `e854fe64-5c17-49a1-a665-8b43e5cfa42b`; the active version after staging credential rotation is `d6fb8009-0ba0-4d8e-ab3b-728d9784beb8`. Production runs Worker version `8f69e4ce-4757-4f0a-bed9-4c416c4d4638`. Migrations `0001`-`0006` are applied in both environments. Zoho OAuth/account/folder secrets remain pending.

The scheduled cron is not active: Cloudflare rejected trigger registration because the Free-plan account already has five triggers (`10072`). HTTP/MCP/reporting endpoints are active; retention and Zoho will not run on schedule until a trigger slot is freed or the account limit changes.

The operator, reviewer, Fidexa read, Resend API, and Resend webhook secrets are configured separately in both Worker environments. Operator/reviewer Codex MCP clients are registered with bearer-token environment variables. Never commit or print their values. Vercel Preview/Production have sensitive `OUTREACH_WORKER_URL`, `OUTREACH_READ_SECRET`, and `RESEND_API_KEY` values; local development uses `.env.local`.

## Authentication and roles

Use `Authorization: Bearer <token>` for ordinary MCP clients. The token is compared against the operator and reviewer secrets and determines the role:

- operator: company/contact, research/evidence, draft/review submission, gated send, and follow-up tools;
- reviewer: `approve_outreach_draft` only.

Use separate Codex runs for operator and reviewer work. Approval must come from a reviewer run different from the persisted draft-author run and include all seven true checklist values.

The signed-header fallback uses `x-mcp-role`, unique `x-mcp-request-id`, `x-mcp-timestamp`, and `x-mcp-signature`. Signed MCP and reporting request IDs are claimed in D1 and rejected on replay. Tool idempotency is separate and returns a saved result only for the same payload.

## Persistence and recovery

Migrations `0001`-`0006` add the base schema, one outbound message per draft, replay nonces, approval/provenance/retry and Zoho recovery fields, retry reservation indexes, and company-scoped workflow reporting.

Generic non-send mutations use owner-token idempotency claims. An operation failure releases only the winning claim so the identical request can retry. If the domain mutation returns but ledger finalization fails, the claim deliberately remains in progress: this is fail-closed protection against repeating an already-committed side effect. Inspect the persisted entity and audit state before any operator remediation; do not issue a new key blindly. Evidence compensation deletes R2 before its D1 reference so failed cleanup remains discoverable by retention.

Sending revalidates approval, checklist, contact/evidence ownership and freshness, suppression, approval age, idempotency, kill switch, and an atomic daily-slot reservation. Resend receives a stable `Idempotency-Key`. Retryable failures allow at most three attempts in 24 hours; definitive 4xx failures do not retry.

Scheduled cleanup removes the R2 object before its expired D1 evidence reference and audits bounded counts. Zoho uses exact addresses, bounded descending pages, durable continuation, and a composite time/message watermark. New or legacy-null state starts at the current boundary rather than importing mailbox history. Cleanup and Zoho failures are isolated and audited.

Company reporting is bounded to that company's research, findings, evidence metadata, drafts/reviews, messages/events, follow-ups, and workflow timeline. Evidence bodies pass through the Better Auth-protected Fidexa server proxy; no private R2 URL or signing secret reaches the browser.

## Local verification

From the repository root:

```bash
pnpm exec vitest run workers/outreach-gateway/src/*.test.ts
pnpm exec tsc --noEmit -p workers/outreach-gateway/tsconfig.json
```

For local development, copy `.dev.vars.example` to `.dev.vars`, provide local-only values, and retain the disabled switches. The final 2026-09-16 local run passed 29 files and 136 tests; both typechecks and the production build also passed.

## Rollout

Apply and deploy staging first:

```bash
pnpm exec wrangler d1 migrations list fidexa-outreach-staging --remote \
  --config workers/outreach-gateway/wrangler.jsonc --env staging
pnpm exec wrangler d1 migrations apply fidexa-outreach-staging --remote \
  --config workers/outreach-gateway/wrangler.jsonc --env staging
pnpm exec wrangler deploy \
  --config workers/outreach-gateway/wrangler.jsonc --env staging
```

Staging verification passed wrong-token rejection, 10 operator tools, reviewer-only approval, a controlled full workflow after the final safety fixes, `paused/outbound_disabled` send behavior, signed reporting/evidence reads, and replay rejection. The refreshed Vercel preview is `READY` at `https://fidexa-qlz8osau1-farids-projects-186e7dae.vercel.app`; unauthenticated redirect plus admin-auth no-overflow and console checks passed. The production deployment `dpl_HmUbb38bV4WtKZ3EDGroE1G6tcvZ` is live at `https://www.fidexa.org`; authenticated dashboard QA passed at the available 1280×720 viewport with the expected empty production state. Exact 1512×982 and 393×852 browser passes remain unverified because the Luna browser surface did not expose viewport controls. Keep outbound/sync disabled.

Rollout record: the prior staging Worker was `0b9745b1-6f9c-40be-9581-92f4785c0741`, and the staging pre-change D1 bookmark is `00000005-00000000-000050e8-69dd80013636d4dbda8632d296298ea8`. The prior production Worker was `f0e766ac-a999-4b53-9668-811dcb389c57`, and the production pre-change bookmark is `0000000a-00000023-000050e8-5992bf575c391f09fca37f82f2b57e82`.

Only after staging passes, apply and deploy production:

```bash
pnpm exec wrangler d1 migrations list fidexa-outreach-production --remote \
  --config workers/outreach-gateway/wrangler.jsonc --env production
pnpm exec wrangler d1 migrations apply fidexa-outreach-production --remote \
  --config workers/outreach-gateway/wrangler.jsonc --env production
pnpm exec wrangler deploy \
  --config workers/outreach-gateway/wrangler.jsonc --env production
```

Capture the pre-change Worker version and D1 Time Travel bookmark before each rollout. Roll back Worker code with `wrangler rollback <version-id> --config workers/outreach-gateway/wrangler.jsonc --env <environment> --yes`. Restore D1 by bookmark only for a confirmed schema/data incident; it rewinds later changes. The full checklist and exact commands are in `docs/superpowers/specs/2026-09-11-fidexa-codex-outreach-runbook.md`.
