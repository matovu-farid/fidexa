# Fidexa Codex Outreach Data Plane Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an isolated Cloudflare D1/R2 outreach data plane that Codex controls through MCP while Fidexa displays the resulting operational data.

**Architecture:** A Cloudflare Worker owns validation, D1/R2 persistence, audit events, review gates, Resend delivery, and read-only reporting routes. Codex calls narrow domain tools through MCP; it never receives production database credentials and never executes arbitrary SQL. Fidexa reads the Worker’s authenticated reporting routes and remains independent of the Codex session.

**Tech Stack:** Cloudflare Workers, D1, R2, TypeScript, `@modelcontextprotocol/sdk`, Zod, Resend, Wrangler, Zoho Mail OAuth, Next.js server-side read adapter, Vitest.

---

## File map

- Create `workers/outreach-gateway/package.json` with Worker runtime and test dependencies.
- Create `workers/outreach-gateway/tsconfig.json` for Cloudflare Worker types and strict TypeScript.
- Create `workers/outreach-gateway/src/domain.ts` for shared domain types and state transitions.
- Create `workers/outreach-gateway/src/validation.ts` for Zod schemas and bounded input validation.
- Create `workers/outreach-gateway/src/d1.ts` for prepared D1 statements and explicit D1 batch operations.
- Create `workers/outreach-gateway/src/persistence.ts` for private evidence object writes and persistence helpers.
- Create `workers/outreach-gateway/src/audit.ts` for append-only workflow events.
- Create `workers/outreach-gateway/src/mcp.ts` for the narrow MCP tool surface.
- Create `workers/outreach-gateway/src/mcp-transport.ts` for the MCP HTTP transport and request authentication.
- Create `workers/outreach-gateway/src/routes.ts` for authenticated reporting routes and `src/resend-webhook.ts` for verified provider events.
- Create `workers/outreach-gateway/src/zoho.ts` for incremental Zoho Mail reply synchronization.
- Create `workers/outreach-gateway/src/retention.ts` for bounded R2/D1 cleanup.
- Create `workers/outreach-gateway/src/index.ts` for Worker bindings and request dispatch.
- Create `workers/outreach-gateway/migrations/0001_outreach_base.sql` through `0006_workflow_event_company.sql` for the base schema, outbound-draft uniqueness, replay nonces, approval/recovery fields, retry reservations, and company-scoped audit reporting.
- Create `workers/outreach-gateway/wrangler.jsonc` for D1/R2 bindings and environment names.
- Create `workers/outreach-gateway/.dev.vars.example` for names only, never secrets.
- Create `workers/outreach-gateway/src/*.test.ts` for domain, validation, idempotency, MCP, and route tests.
- Reuse `src/app/admin/layout.tsx` and the existing Better Auth session; do not create a second auth system.
- Modify `src/app/admin/page.tsx` only to add a link after the outreach route is stable.
- Create `src/app/admin/outreach/page.tsx` only after the Worker read surface is stable.
- Create `src/lib/outreach-reader.ts` for server-side Fidexa read access.
- Create `src/app/api/admin/outreach/route.ts` and `src/app/api/admin/outreach/evidence/[id]/route.ts` as authenticated Fidexa proxies.

## Task 1: Create the isolated Cloudflare resources and schema

**Files:**

- Create: `workers/outreach-gateway/wrangler.jsonc`
- Create: `workers/outreach-gateway/migrations/0001_outreach_base.sql` through `0006_workflow_event_company.sql`
- Create: `workers/outreach-gateway/.dev.vars.example`

- [x] **Step 1: Define isolated resource names.** Separate staging and production D1 databases and R2 buckets are configured. Both environments keep outbound/sync disabled and the daily limit at zero. Operator, reviewer, read, Resend API, and Resend webhook secrets are provisioned separately; Zoho OAuth secrets remain pending.

- [x] **Step 2: Add the D1 schema.** Migrations `0001`-`0006` define the tables and indexes, one-outbound-message-per-draft constraint, request nonces, persisted approval/retry/Zoho recovery fields, and company-scoped workflow events. The complete chain is tested and applied remotely to staging. Production migrations remain rollout work.

- [x] **Step 3: Add status constraints in schema comments and code constants.** State transitions and send gates are enforced in the Worker domain/service layer; direct discovered-to-sent flow is rejected.

- [x] **Step 4: Add versioned migrations and apply them to staging only.** Migrations `0001`-`0006` are applied to staging; production is intentionally not migrated.

```bash
cd workers/outreach-gateway
wrangler d1 migrations apply fidexa-outreach-staging --remote
```

Expected: Wrangler reports the migration as applied. Verify the staging tables with a read-only `SELECT` before any production migration is considered.

## Task 2: Implement validation, state transitions, and audit events

**Files:**

- Create: `workers/outreach-gateway/src/domain.ts`
- Create: `workers/outreach-gateway/src/validation.ts`
- Create: `workers/outreach-gateway/src/audit.ts`
- Test: `workers/outreach-gateway/src/domain.test.ts`
- Test: `workers/outreach-gateway/src/validation.test.ts`

- [x] **Step 1: Write failing transition tests.** Transition, approval, suppression, verification, and send-gate tests are present.

- [x] **Step 2: Define versioned input schemas.** Strict versioned schemas, evidence-backed drafts, verified-contact methods, bounded payloads, and unknown-field rejection are implemented.

- [x] **Step 3: Implement transition guards and audit records.** Idempotency reservations/results are stored in the append-only workflow event ledger; reviewer-only approval and distinct author/reviewer runs are enforced.

- [x] **Step 4: Run the tests.** The final local run on 2026-09-16 passed: 29 files, 136 tests.

## Task 3: Implement D1/R2 persistence and idempotency

**Files:**

- Create: `workers/outreach-gateway/src/d1.ts`
- Create: `workers/outreach-gateway/src/persistence.ts`
- Test: `workers/outreach-gateway/src/persistence.test.ts`

- [x] **Step 1: Write failing idempotency tests.** Retry/conflict behavior is covered by the workflow idempotency test.

- [x] **Step 2: Implement prepared D1 statements.** All Worker persistence uses prepared statements, D1 batches where related writes are required, unique constraints, and idempotency records.

- [x] **Step 3: Implement private R2 writes.** Evidence writes are namespaced, bounded, checksummed, and stored with provenance metadata.

- [x] **Step 4: Implement short-lived evidence reads.** The authenticated `/reporting/evidence/:id` route streams only non-expired evidence by D1 reference.

- [x] **Step 5: Run persistence tests.** Persistence/idempotency behavior passes against deterministic D1/SQLite fixtures as part of the 2026-09-16 focused run.

## Task 4: Expose the MCP write surface

**Files:**

- Create: `workers/outreach-gateway/src/mcp.ts`
- Create: `workers/outreach-gateway/src/mcp-transport.ts`
- Create: `workers/outreach-gateway/src/mcp.test.ts`
- Test: `workers/outreach-gateway/src/mcp-transport.test.ts`
- Modify: `workers/outreach-gateway/src/index.ts`

- [x] **Step 1: Define the allowed tools.** The role-specific tool allowlist is implemented.

- [x] **Step 2: Implement the MCP endpoint.** The Worker exposes `/mcp` via Streamable HTTP transport with role-filtered tools.

- [x] **Step 3: Authenticate MCP requests.** Standard MCP bearer tokens infer the operator or reviewer role. HMAC-signed headers remain a supported fallback. Signed request IDs are claimed in D1 within a bounded replay window; request-size limits, tool allowlists, and distinct reviewer runs are enforced. Fine-grained distributed rate limiting remains a production hardening task before enabling send.

- [x] **Step 4: Implement the tool handlers.** Domain handlers validate bounded inputs, persist stable IDs/states, and do not return credentials or unrelated records.

- [x] **Step 5: Enforce the send gate.** The Worker verifies a current approval, reviewer separation from the persisted author run, all seven approval checklist values, suppression, current contact evidence, kill switch, an atomically reserved daily allowance, and draft/send idempotency before Resend. Provider calls carry a stable Resend idempotency key, and failures remain recoverable rather than appearing pending.

- [x] **Step 6: Run MCP tests.** The MCP and transport suites pass, including role separation, bearer/signed authentication, replay rejection, send gates, and the absence of arbitrary SQL/R2 tools.

## Task 5: Expose read-only reporting routes, Resend webhooks, and Zoho reply ingestion

**Files:**

- Create: `workers/outreach-gateway/src/routes.ts`
- Create: `workers/outreach-gateway/src/resend-webhook.ts`
- Create: `workers/outreach-gateway/src/zoho.ts`
- Create: `workers/outreach-gateway/src/routes.test.ts`
- Test: `workers/outreach-gateway/src/resend-webhook.test.ts`
- Test: `workers/outreach-gateway/src/zoho.test.ts`
- Modify: `workers/outreach-gateway/src/index.ts`

- [x] **Step 1: Define read routes.** All listed reporting routes are implemented.

- [x] **Step 2: Authenticate Fidexa reads.** Signed server-to-server reads, bounded pagination, and server-only secrets are implemented.

- [x] **Step 3: Add route tests.** Tests cover unauthorized access, pagination validation, replayed read requests, bounded company drill-down data, evidence references without private bucket credentials, and read-only behavior.

- [x] **Step 4: Implement and verify Resend webhook ingestion.** The raw-body Svix verification boundary, provider-event deduplication, delivery-state updates, and bounce/complaint suppression are implemented and tested.

- [x] **Step 5: Add Zoho as the inbound source.** The OAuth/cursor adapter performs bounded, descending pagination, exact mailbox/sender matching, deduplication, quarantine-on-malformed-input behavior, and durable continuation without advancing a final watermark early. First-run and legacy-null-watermark states bootstrap without importing mailbox history. Attachment ingestion and richer thread-to-company matching remain gated follow-up work; no virtual inbox or email-routing Worker is created.

- [x] **Step 6: Test Zoho recovery and idempotency.** The suite passes duplicate-message, cursor/watermark, multi-page continuation, new-arrival, legacy-state, malformed-response, exact-address, and failed-persistence cases. Live OAuth remains unconfigured, so no remote mailbox sync has run.

- [x] **Step 7: Run route tests.** Route and webhook tests pass as part of the 2026-09-16 focused run.

- [x] **Step 8: Schedule controlled sync work.** The scheduled handler runs cleanup and Zoho sync only when enabled; staging remains disabled until OAuth fixtures and failure-audit handling are verified.

## Task 6: Add the Fidexa read-only admin surface

**Files:**

- Create: `src/lib/outreach-reader.ts`
- Create: `src/app/api/admin/outreach/route.ts`
- Create: `src/app/api/admin/outreach/evidence/[id]/route.ts`
- Create: `src/app/admin/outreach/page.tsx`
- Create: `src/lib/outreach-dashboard.ts`
- Test: `src/lib/outreach-reader.test.ts`
- Test: `src/lib/outreach-dashboard.test.ts`

- [x] **Step 1: Implement a server-only Worker client.** The signed server-only reader uses bounded requests, timeout, and typed reporting shapes.

- [x] **Step 2: Protect the route with existing Fidexa admin authentication.** The existing Better Auth admin session protects the page and proxy route; no second session model is introduced.

- [x] **Step 3: Build the dashboard and company drill-down.** The read-only admin view shows counts, companies, recent delivery history, follow-ups, and Worker-unavailable state. `?company=` opens bounded research runs, findings, evidence, drafts/reviews/checklists, messages/events, follow-ups, and a company-scoped audit timeline. Evidence bodies are fetched only through the authenticated Better Auth server proxy.

- [x] **Step 4: Run focused tests.** Reader and authenticated proxy tests pass. The final local verification passed 29 files/136 tests, both typechecks, and the production build.

## Task 7: Add retention, limits, and failure recovery

**Files:**

- Create: `workers/outreach-gateway/src/retention.ts`
- Create: `workers/outreach-gateway/src/limits.ts`
- Test: `workers/outreach-gateway/src/retention.test.ts`
- Test: `workers/outreach-gateway/src/limits.test.ts`
- Modify: `workers/outreach-gateway/src/index.ts`

- [x] **Step 1: Define retention rules.** Bounded cleanup deletes each expired R2 object before its D1 reference and writes content-free count/failure audit events. Expired request nonces are also removed in bounded batches.

- [x] **Step 2: Add operational limits.** Bounded schemas/body readers and evidence limits are enforced. The Worker-level outbound kill switch and invalid/zero daily limit fail closed with a paused state.

- [x] **Step 3: Add failure recovery.** Resend failures are classified and audited; retryable sends allow at most three attempts within 24 hours, definitive 4xx failures do not retry, and every attempt atomically consumes the applicable daily allowance. Scheduled retention and Zoho jobs fail independently and are audited. Zoho does not finalize its watermark until a bounded scan completes successfully.

- [x] **Step 4: Run tests.** Retention, limits, retry, quota-concurrency, and scheduled-job tests pass in the 2026-09-16 focused run.

## Task 8: Validate with Codex dry runs and production safeguards

**Files:**

- Create: `docs/superpowers/specs/2026-09-11-fidexa-codex-outreach-runbook.md`
- Create: `workers/outreach-gateway/README.md`
- Modify: `.env.example` only for `OUTREACH_WORKER_URL` and `OUTREACH_READ_SECRET` variable names.

- [x] **Step 1: Document the Codex MCP configuration.** The runbook and Worker README document bearer auth plus the signed fallback, role/tool separation, dry-run switches, evidence/review gates, and secret handling. `.env.example` contains only the application-facing Worker URL/read-secret names in addition to its existing Resend key name; no values are committed.

- [x] **Step 2: Run dry-run discovery.** The deployed staging smoke test completed the controlled workflow through company, research, evidence, contact, draft, independent approval, and attempted send. Sending returned `paused/outbound_disabled`; signed reporting/evidence reads and replay rejection passed.

- [ ] **Step 3: Run the staged adversarial dry-run.** Automated tests cover duplicate ownership, unsupported/unverified data gates, malformed payloads, prompt-injection checklist enforcement, suppression, and the narrow tool surface. Deployed staging has verified wrong-token rejection, role-specific tool exposure, and replay rejection; the remaining deliberately adversarial data fixtures are pending.

- [ ] **Step 4: Enable conservative sending.** Configure a low daily limit, require approved review records, monitor Resend delivery events, and keep a manual pause switch in the Worker environment.

- [x] **Step 5: Deploy only after staging verification.** The reviewed Worker and migrations `0001`-`0006` are live in staging and production. Operator/reviewer Codex MCP clients remain attached only to staging. The Fidexa app is live at `https://www.fidexa.org`, while outbound/sync remain disabled and the daily limit remains zero. The cron trigger is pending because Cloudflare rejected it at the account's Free-plan five-trigger limit (`10072`).

- [ ] **Step 6: Verify final behavior.** Local tests/typecheck/build pass; staging MCP/reporting smoke checks pass; and Luna verified the authenticated production dashboard, admin link, empty states, and no visible overflow at 1280×720. Exact 1512×982 and 393×852 browser checks, cron activation, the deliberate live adversarial fixtures, and Zoho OAuth/sync remain pending.
