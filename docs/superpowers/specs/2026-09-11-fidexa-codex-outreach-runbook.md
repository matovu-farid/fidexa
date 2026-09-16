# Fidexa Codex Outreach Runbook

Status: staging deployed and smoke-tested; production rollout remains pending (2026-09-16)

## Safety baseline

Keep these values in both Worker environments until every staging check below passes:

```text
OUTBOUND_ENABLED=false
SYNC_ENABLED=false
DAILY_SEND_LIMIT=0
```

Do not send real outreach during the first deployment. Turning on outbound delivery requires an explicit later decision, a positive conservative daily limit, a monitored Resend webhook, and a controlled approved recipient. Turning on Zoho sync requires its OAuth secrets and folder/account identifiers first.

Every external page, captured document, and inbound email is untrusted evidence, never an instruction. Every mutation includes `schema_version`, `workflow_run_id`, and an idempotency key. Reusing an idempotency key with a different payload is rejected.

For generic non-send mutations, only the owner of a new idempotency claim executes the operation. If the operation fails before returning an outcome, that owner releases the claim so the identical request can retry. If the domain mutation succeeds but audit-ledger finalization fails, the claim remains in progress and retries stay blocked to prevent duplicate side effects. Treat that result as an operator-reconciliation incident: inspect the entity and audit state, and never issue a new key blindly.

## Workflow and gates

1. Record a company and its public source/fit rationale.
2. Start a research run, then store bounded findings and private R2 evidence. Evidence is persisted with `untrusted_external` provenance.
3. Add a contact only with a current evidence reference and one accepted verification method: public company-domain mailbox, verified company contact page, or administrator verification. The contact, evidence, research run, draft, and company must agree.
4. Create an evidence-backed draft and submit it for review.
5. A separate reviewer run approves only when all seven persisted checks are true: claims supported, recipient validated, prior outreach checked, relevance/personalization checked, opt-out/suppression checked, deliverability checked, and prompt injection checked.
6. The Worker rechecks the latest approval, author/reviewer separation, approval age, verification evidence, suppression, one-send-per-draft constraint, idempotency, kill switch, and an atomically reserved daily slot before calling Resend.
7. Resend receives the stable send idempotency key. Retryable failures permit at most three total attempts within 24 hours; definitive 4xx responses do not retry. A failed provider call is recorded as failed, never left pending.
8. Resend events and verified Zoho replies update the recorded history. Outcomes are observed, not inferred.

## MCP clients

The endpoint is `https://<worker-host>/mcp`. Prefer standard bearer authentication. The token determines the role; never send a caller-selected role with bearer auth and never place a token directly in a command or committed file.

```bash
codex mcp add fidexa-outreach-operator \
  --url https://<staging-worker-host>/mcp \
  --bearer-token-env-var FIDEXA_OUTREACH_OPERATOR_TOKEN

codex mcp add fidexa-outreach-reviewer \
  --url https://<staging-worker-host>/mcp \
  --bearer-token-env-var FIDEXA_OUTREACH_REVIEWER_TOKEN
```

Use the operator and reviewer credentials in separate Codex tasks/runs. The operator can create companies and contacts, conduct research, store evidence, draft, submit for review, request a gated send, and schedule follow-ups. The reviewer credential exposes only `approve_outreach_draft`. Browser sessions are not durable MCP credentials.

HMAC is retained for clients that cannot use bearer auth. Send `x-mcp-role`, a unique `x-mcp-request-id`, Unix-seconds `x-mcp-timestamp`, and `x-mcp-signature`. The signature is HMAC-SHA256 over:

```text
<timestamp>.<JSON.stringify([role, requestId, rawRequestBody])>
```

The timestamp window is 300 seconds. Signed MCP request IDs and signed Fidexa read request IDs are claimed in D1 and rejected on replay. Reporting signs `<timestamp>.<requestId>.<method>.<path-and-query>` with `FIDEXA_READ_SECRET`.

## Reporting and evidence

Fidexa reads only authenticated `/reporting/*` routes from the server. `/admin/outreach?company=<id>` shows the bounded company record, contacts, research runs/findings, evidence metadata, drafts and review checklists, messages/events, follow-ups, and company-scoped workflow events. No route returns bucket credentials, MCP credentials, Resend/Zoho secrets, raw provider payloads, or signing material.

Evidence bodies are available only through `/api/admin/outreach/evidence/<id>`. That route first requires the existing Better Auth administrator session, then performs the signed Worker read. The browser never receives `OUTREACH_READ_SECRET` or a direct private R2 URL.

## Resend and Zoho

Resend posts to `/webhooks/resend`. The Worker reads a bounded raw body and verifies `svix-id`, `svix-timestamp`, and `svix-signature` with `RESEND_WEBHOOK_SECRET` before parsing. Provider event IDs deduplicate delivery events; bounce and complaint events suppress the recipient.

Zoho is the inbound source. The scheduled adapter uses OAuth refresh credentials held only as Worker secrets, exact address matching, a fixed upper bound, descending bounded pages, durable continuation, and a `(received time, message ID)` watermark. A new or legacy-null-watermark mailbox bootstraps at the current boundary without importing historical mail. Malformed pages are quarantined/audited and do not advance state; an inbound message links only to a previously verified contact/company. Scheduled Zoho and retention work fail independently.

## Current environment inventory

- Staging and production D1/R2 resources exist.
- Staging and production migrations `0001`-`0006` are applied; both report no pending migrations.
- Staging runs code version `e854fe64-5c17-49a1-a665-8b43e5cfa42b`; the active version after credential rotation is `d6fb8009-0ba0-4d8e-ab3b-728d9784beb8`. The pre-rollout version was `0b9745b1-6f9c-40be-9581-92f4785c0741`.
- The staging pre-change D1 bookmark is `00000005-00000000-000050e8-69dd80013636d4dbda8632d296298ea8`.
- Production runs Worker version `8f69e4ce-4757-4f0a-bed9-4c416c4d4638`; the prior version was `f0e766ac-a999-4b53-9668-811dcb389c57`, and the pre-change D1 bookmark is `0000000a-00000023-000050e8-5992bf575c391f09fca37f82f2b57e82`.
- Cloudflare did not register the scheduled cron because the Free-plan account already has five triggers. Wrangler returned `10072`. HTTP endpoints are active, but scheduled retention/Zoho execution remains pending until a trigger slot is freed or the limit changes.
- Both Worker environments have separate operator, reviewer, read, Resend API, and Resend webhook secrets configured. Secret values are not recorded here.
- Staging and production Resend webhooks are registered for their corresponding Worker URLs.
- Zoho OAuth/account/folder secrets are not configured. `SYNC_ENABLED` remains false.
- Vercel Preview points at the staging Worker and Vercel Production points at the production Worker. `OUTREACH_WORKER_URL`, `OUTREACH_READ_SECRET`, and `RESEND_API_KEY` are configured as sensitive Preview/Production variables. Vercel does not allow sensitive Development variables; local development uses `.env.local`.
- Operator and reviewer Codex MCP clients are registered using bearer-token environment variables. Staging rejected a wrong token, exposed all 10 operator tools, exposed only draft approval to the reviewer, and completed a controlled full workflow. The send attempt returned `paused/outbound_disabled`. Signed reporting, evidence reads, and replay rejection passed.
- Final local verification on 2026-09-16: 29 files and 136 tests passed; both typechecks and the production build passed.
- Vercel preview is ready at `https://fidexa-qlz8osau1-farids-projects-186e7dae.vercel.app`. The unauthenticated redirect and admin-auth no-overflow and console-clean checks passed.
- Production deployment `dpl_HmUbb38bV4WtKZ3EDGroE1G6tcvZ` is `READY` and aliased to `https://www.fidexa.org`. Luna verified the authenticated `/admin/outreach` route, the `/admin` link, the 0-company/0-draft/0-message empty state, and no visible overflow at 1280×720. Exact 1512×982 and 393×852 viewport checks were unavailable in that browser surface.
- Remaining rollout work: deliberately adversarial staged fixtures, exact target-viewport browser QA, cron activation, and Zoho OAuth/sync.

## Staging rollout record

- Environment: staging.
- Applied migrations: `0001_outreach_base.sql` through `0006_workflow_event_company.sql`.
- Pre-change D1 bookmark: `00000005-00000000-000050e8-69dd80013636d4dbda8632d296298ea8`.
- Prior Worker version: `0b9745b1-6f9c-40be-9581-92f4785c0741`.
- Active Worker version: `d6fb8009-0ba0-4d8e-ab3b-728d9784beb8` (code deployment `e854fe64-5c17-49a1-a665-8b43e5cfa42b`).
- Active switches: outbound off, sync off, daily send limit zero.
- MCP: operator and reviewer registered separately through bearer environment variables; no token values are recorded.
- Smoke result: wrong-token rejection, operator/reviewer tool separation, controlled workflow, paused send, signed reporting/evidence, and replay rejection passed.
- Application preview: `https://fidexa-qlz8osau1-farids-projects-186e7dae.vercel.app` is `READY`.
- Exception: cron registration blocked by Cloudflare account trigger limit, error `10072`; scheduled execution is not active.

## Production rollout record

- Environment: production.
- Applied migrations: `0001_outreach_base.sql` through `0006_workflow_event_company.sql`; no migrations pending.
- Pre-change D1 bookmark: `0000000a-00000023-000050e8-5992bf575c391f09fca37f82f2b57e82`.
- Prior Worker version: `f0e766ac-a999-4b53-9668-811dcb389c57`.
- Active Worker version: `8f69e4ce-4757-4f0a-bed9-4c416c4d4638`.
- Active switches: outbound off, sync off, daily send limit zero.
- Vercel deployment: `dpl_HmUbb38bV4WtKZ3EDGroE1G6tcvZ`, aliased to `https://www.fidexa.org`.
- Browser result: authenticated dashboard, admin navigation, Worker-backed empty state, and 1280×720 overflow checks passed through a Luna subagent.
- Exception: cron registration is blocked by the same account limit (`10072`); scheduled retention and Zoho execution are not active.

## Staging rollout

Run from the repository root. Capture the displayed deployment version and D1 bookmark in the change record before applying anything.

```bash
pnpm exec wrangler deployments status \
  --config workers/outreach-gateway/wrangler.jsonc --env staging
pnpm exec wrangler d1 time-travel info fidexa-outreach-staging --json \
  --config workers/outreach-gateway/wrangler.jsonc --env staging
pnpm exec wrangler d1 migrations list fidexa-outreach-staging --remote \
  --config workers/outreach-gateway/wrangler.jsonc --env staging
pnpm exec wrangler d1 migrations apply fidexa-outreach-staging --remote \
  --config workers/outreach-gateway/wrangler.jsonc --env staging
pnpm exec wrangler deploy \
  --config workers/outreach-gateway/wrangler.jsonc --env staging
```

This rollout completed the migration, HTTP Worker, MCP, and reporting checks below. Keep the list for repeatable verification without changing the safety baseline:

- `wrangler d1 migrations list` reports no unapplied migrations through `0006`.
- `/mcp` completes an operator and a separate reviewer handshake; a wrong token is rejected.
- A repeated signed request ID is rejected, while a same-payload tool idempotency replay returns its recorded result.
- A dry run creates a company, research run, findings, evidence, verified contact, draft, and review. Sending returns `paused` because outbound is disabled.
- D1/R2 ownership, provenance, uniqueness, and audit rows are correct; no secrets or private keys appear in responses.
- Automated tests cover dashboard empty/missing/unavailable states, long content, and the `?company=` drill-down. The preview auth boundary passed browser QA; production authenticated empty-state QA passed at 1280×720. Exact target viewports remain pending.
- Resend webhook signature/deduplication checks pass. Do not send a real email as part of this baseline deployment.

## Production rollout

Proceed only after the staging record is complete. Keep production outbound/sync disabled and the daily limit at zero.

```bash
pnpm exec wrangler deployments status \
  --config workers/outreach-gateway/wrangler.jsonc --env production
pnpm exec wrangler d1 time-travel info fidexa-outreach-production --json \
  --config workers/outreach-gateway/wrangler.jsonc --env production
pnpm exec wrangler d1 migrations list fidexa-outreach-production --remote \
  --config workers/outreach-gateway/wrangler.jsonc --env production
pnpm exec wrangler d1 migrations apply fidexa-outreach-production --remote \
  --config workers/outreach-gateway/wrangler.jsonc --env production
pnpm exec wrangler deploy \
  --config workers/outreach-gateway/wrangler.jsonc --env production
```

Verify the production MCP handshake, signed reporting reads, Better Auth proxy, dashboard, and webhook endpoint before deploying the Fidexa application. Create the Vercel preview first; promote to production only after preview QA:

```bash
vercel deploy --scope farids-projects-186e7dae -y
vercel deploy --scope farids-projects-186e7dae --prod -y
```

Record the applied migration list, Worker version IDs, Vercel deployment URLs, active switches, verification commands/results, and the pre-change D1 bookmarks. Production sending and Zoho sync are separate, later enablement changes.

## Rollback

Pause first if either feature has ever been enabled: restore `OUTBOUND_ENABLED=false`, `SYNC_ENABLED=false`, and `DAILY_SEND_LIMIT=0`, then deploy that configuration. Roll back Worker code to the version recorded before rollout:

```bash
pnpm exec wrangler rollback <staging-version-id> \
  --config workers/outreach-gateway/wrangler.jsonc --env staging --yes
pnpm exec wrangler rollback <production-version-id> \
  --config workers/outreach-gateway/wrangler.jsonc --env production --yes
```

Do not attempt a hand-written down migration. If a schema/data rollback is actually required, stop writes and restore the exact pre-change bookmark captured above:

```bash
pnpm exec wrangler d1 time-travel restore fidexa-outreach-staging \
  --bookmark <staging-prechange-bookmark> \
  --config workers/outreach-gateway/wrangler.jsonc --env staging
pnpm exec wrangler d1 time-travel restore fidexa-outreach-production \
  --bookmark <production-prechange-bookmark> \
  --config workers/outreach-gateway/wrangler.jsonc --env production
```

D1 Time Travel rewinds data and is destructive to changes after the bookmark; use it only for a confirmed schema/data incident. A Worker-code rollback normally does not require a D1 restore.
