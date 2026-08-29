# Fidexa Virtual Inbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin-only Fidexa virtual inbox that captures new mail for the five approved aliases, preserves Gmail forwarding, supports threaded search/replies/drafts/attachments, and tracks Resend delivery events.

**Architecture:** Cloudflare Email Routing sends the five aliases to an Email Worker. The Worker parses inbound MIME, stores raw/attachments in private R2, posts a signed idempotent payload to the Fidexa Next.js ingestion endpoint, and independently forwards the original to `matovu90@gmail.com`. Fidexa uses Better Auth, a separate Neon PostgreSQL database, Resend for outbound delivery, and a three-pane admin UI.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Better Auth magic-link/passkey authentication, Drizzle ORM/Drizzle Kit, Neon PostgreSQL, Resend/Svix webhook verification, Cloudflare Email Workers, R2, PostalMime, Zod, Vitest, Testing Library.

---

## Scope and file map

The existing Fidexa app has public routes and a Resend-powered contact endpoint but no admin route, auth, database, or Worker. The implementation adds the following bounded units:

- `src/lib/config.ts` — validated server environment configuration.
- `src/lib/email/addresses.ts` — approved aliases and sender/recipient validation.
- `src/lib/email/headers.ts` — message-ID normalization and threading headers.
- `src/lib/email/sanitize.ts` — server-side HTML sanitization and safe-link policy.
- `src/lib/email/retention.ts` — retention dates and expiry classification.
- `src/lib/auth.ts` and `src/lib/auth-client.ts` — Better Auth server/client configuration.
- `src/db/client.ts`, `src/db/schema.ts`, `drizzle.config.ts`, and `drizzle/` — Neon/Drizzle persistence.
- `src/app/api/auth/[...all]/route.ts` — Better Auth handler.
- `src/app/api/inbox/ingest/route.ts` — signed Worker ingestion.
- `src/app/api/webhooks/resend/route.ts` — signed Resend event ingestion.
- `src/app/api/admin/inbox/*` — authenticated inbox, search, drafts, attachment proxy, send, and cleanup endpoints.
- `src/app/admin/layout.tsx`, `src/app/admin/inbox/page.tsx`, and `src/components/admin/` — protected three-pane UI.
- `workers/email-gateway/src/index.ts`, `workers/email-gateway/src/mime.ts`, `workers/email-gateway/wrangler.jsonc`, and Worker tests — inbound parsing, R2, forwarding, signing, retry, and scheduled cleanup.
- `vitest.config.ts`, `src/**/*.test.ts`, and `workers/email-gateway/src/**/*.test.ts` — focused unit/integration tests.
- `.env.example`, `workers/email-gateway/.dev.vars.example`, and `.gitignore` — documented non-secret configuration only.

Do not modify existing public portfolio components except where a shared utility is strictly required. Do not commit secrets, real inbox contents, raw MIME, private attachments, or generated `.env` files.

## Task 1: Add the test harness and validated configuration

**Files:**

- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/config.ts`
- Create: `src/lib/email/addresses.ts`
- Create: `.env.example`
- Modify: `.gitignore`
- Test: `src/lib/email/addresses.test.ts`
- Test: `src/lib/config.test.ts`

- [ ] **Step 1: Add dependencies and scripts.** Add `better-auth`, `drizzle-orm`, `drizzle-kit`, `postgres`, `zod`, `sanitize-html`, `@types/sanitize-html`, `svix`, `postal-mime`, `vitest`, `jsdom`, `@testing-library/react`, and `@testing-library/jest-dom`; add a `test` script that runs `vitest run`. Keep the existing `resend` dependency.

- [ ] **Step 2: Write failing allowlist tests.** Cover exact matching for `hello@fidexa.org`, `sales@fidexa.org`, `support@fidexa.org`, `info@fidexa.org`, and `faridmatovu@fidexa.org`; reject subdomains, display-name tricks, catch-all addresses, and unapproved senders as outbound identities.

```ts
it("accepts only the five approved Fidexa aliases", () => {
  expect(isInboundAlias("hello@fidexa.org")).toBe(true);
  expect(isInboundAlias("random@fidexa.org")).toBe(false);
  expect(isOutboundAlias("support@fidexa.org")).toBe(true);
  expect(isOutboundAlias("matovu90@gmail.com")).toBe(false);
});
```

- [ ] **Step 3: Run the focused tests and verify they fail for the missing functions.**

Run: `pnpm exec vitest run src/lib/email/addresses.test.ts src/lib/config.test.ts`

Expected: FAIL because the new helpers and configuration module do not exist yet.

- [ ] **Step 4: Implement the allowlist and environment parser.** Define constants for the five aliases, `FIDEXA_ADMIN_EMAILS`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `INBOX_INGEST_SECRET`, `INBOX_ATTACHMENT_SECRET`, and `FIDEXA_APP_URL`. Fail closed when a required server secret is missing; never expose secrets through a client module.

- [ ] **Step 5: Run the focused tests.**

Run: `pnpm exec vitest run src/lib/email/addresses.test.ts src/lib/config.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit only the foundation files.**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts src/lib/config.ts src/lib/email/addresses.ts src/lib/email/addresses.test.ts src/lib/config.test.ts .env.example .gitignore
git commit -m "feat: add inbox foundation configuration"
```

## Task 2: Define persistence, retention, threading, and sanitization

**Files:**

- Create: `drizzle.config.ts`
- Create: `src/db/client.ts`
- Create: `src/db/schema.ts`
- Create: `src/lib/email/headers.ts`
- Create: `src/lib/email/sanitize.ts`
- Create: `src/lib/email/retention.ts`
- Create: `drizzle/0000_virtual_inbox.sql`
- Test: `src/lib/email/headers.test.ts`
- Test: `src/lib/email/sanitize.test.ts`
- Test: `src/lib/email/retention.test.ts`

- [ ] **Step 1: Write failing tests for threading and safety.** Test that `In-Reply-To` and `References` select an existing thread, that a normalized subject is only a fallback, that script/form/unsafe-link HTML is removed, that plain text remains available, and that parsed content expires after 365 days while raw MIME expires after 7 days.

- [ ] **Step 2: Define Drizzle tables.** Create `mail_threads`, `mail_messages`, `mail_attachments`, `mail_drafts`, `mail_contacts`, `mail_events`, and `mail_audit_logs`. Because the current Fidexa app has no existing CRM database, `mail_contacts` is the initial CRM contact boundary; opportunity creation remains manual. Add unique constraints for provider event IDs, RFC `Message-ID`, Worker idempotency keys, and normalized contact email. Add a PostgreSQL full-text search index over sender, subject, text body, and sanitized body.

- [ ] **Step 3: Add the first migration and database client.** Use a pooled Neon connection from `DATABASE_URL`; make the database module server-only. The migration must include expiry timestamps, inbound/outbound direction, message status, archive/unread state, raw MIME R2 key, attachment expiry, and audit timestamps.

- [ ] **Step 4: Implement and test headers, sanitization, and retention.** Sanitize with a server-side allowlist, remove scripts/forms/event attributes and unsafe schemes, preserve readable text, and generate explicit expiry timestamps from the message receipt time.

- [ ] **Step 5: Run the focused tests and migration type checks.**

Run: `pnpm exec vitest run src/lib/email/headers.test.ts src/lib/email/sanitize.test.ts src/lib/email/retention.test.ts`

Expected: PASS.

Run: `pnpm exec drizzle-kit check`

Expected: PASS with the migration recognized.

- [ ] **Step 6: Commit the persistence boundary.**

```bash
git add drizzle.config.ts src/db src/lib/email/headers.ts src/lib/email/sanitize.ts src/lib/email/retention.ts drizzle src/lib/email/headers.test.ts src/lib/email/sanitize.test.ts src/lib/email/retention.test.ts
git commit -m "feat: add virtual inbox persistence model"
```

## Task 3: Build the Cloudflare inbound Email Worker

**Files:**

- Create: `workers/email-gateway/package.json`
- Create: `workers/email-gateway/tsconfig.json`
- Create: `workers/email-gateway/wrangler.jsonc`
- Create: `workers/email-gateway/.dev.vars.example`
- Create: `workers/email-gateway/src/mime.ts`
- Create: `workers/email-gateway/src/index.ts`
- Test: `workers/email-gateway/src/mime.test.ts`
- Test: `workers/email-gateway/src/index.test.ts`

The Worker package must declare `postal-mime`, `@cloudflare/workers-types`, `typescript`, and `vitest` locally so its build and tests do not depend on accidental root-module resolution. Add a Worker lockfile if `pnpm install` generates one; do not add secrets to it.

- [ ] **Step 1: Write failing Worker tests.** Cover alias rejection, MIME parsing, seven-day raw key creation, one-year attachment key metadata, signed ingestion payloads, replay rejection, independent Gmail/Fidexa results, authenticated attachment streaming, and no forwarding for a failed/unallowlisted recipient.

- [ ] **Step 2: Add the Worker configuration.** Define an R2 binding named `INBOX_BUCKET`, a `FIDEXA_APP_URL` variable, `GMAIL_FORWARD_TO`, `INBOX_INGEST_SECRET`, `INBOX_ATTACHMENT_SECRET`, and a daily scheduled handler. Configure no public HTTP endpoint for ingestion; the Worker-to-app request is authenticated with HMAC over `timestamp.body` and includes an idempotency key. Add a separate authenticated `fetch` handler only for the Fidexa app’s attachment proxy; it must not expose an unauthenticated object-listing or object-download API.

- [ ] **Step 3: Implement MIME handling.** Buffer the inbound stream once, parse it with PostalMime, preserve text and HTML, capture RFC headers, and write raw MIME/attachments to private R2 under namespaced keys. Enforce attachment size and executable-type policies before writing objects.

- [ ] **Step 4: Implement the email handler.** Check the exact recipient alias first. Start the Gmail `message.forward(GMAIL_FORWARD_TO)` operation before parsing so the personal copy is not dependent on Fidexa parsing. Submit the signed parsed payload to `/api/inbox/ingest`; use bounded exponential retry for transient app responses; use `Promise.allSettled` and structured failure records so one destination can succeed when the other fails. Add an authenticated `fetch` branch that accepts only a short-lived, HMAC-signed attachment token from the Fidexa app, validates the R2 key prefix, and streams one private object.

- [ ] **Step 5: Implement cleanup scheduling.** Add a scheduled handler that deletes expired raw/attachment R2 objects by prefix and calls the protected Fidexa cleanup endpoint to remove expired database content and write audit records.

- [ ] **Step 6: Run Worker tests and local type checks.**

Run: `pnpm --dir workers/email-gateway exec vitest run src/mime.test.ts src/index.test.ts`

Expected: PASS.

Run: `pnpm --dir workers/email-gateway exec tsc --noEmit`

Expected: PASS.

- [ ] **Step 7: Commit the Worker separately.**

```bash
git add workers/email-gateway
git commit -m "feat: add Fidexa inbound email gateway"
```

## Task 4: Add signed ingestion and Resend webhook APIs

**Files:**

- Create: `src/lib/email/signatures.ts`
- Create: `src/lib/email/inbound-service.ts`
- Create: `src/lib/email/resend-events.ts`
- Create: `src/app/api/inbox/ingest/route.ts`
- Create: `src/app/api/webhooks/resend/route.ts`
- Create: `src/app/api/admin/inbox/cleanup/route.ts`
- Test: `src/lib/email/signatures.test.ts`
- Test: `src/lib/email/inbound-service.test.ts`
- Test: `src/lib/email/resend-events.test.ts`

- [ ] **Step 1: Write failing service tests.** Test valid/expired/tampered Worker signatures, duplicate idempotency keys, contact creation for unknown senders, thread linking, attachment metadata persistence, safe status transitions, Resend event deduplication, and retention cleanup.

- [ ] **Step 2: Implement signature verification and the inbound service.** Reject missing or stale timestamps, compare HMACs in constant time, validate the alias and schema, check `mail_events`/message unique keys, sanitize content, link or create threads, create unknown contacts, and write an audit event without logging bodies.

- [ ] **Step 3: Implement the Resend webhook.** Verify the Resend signing secret with Svix, accept `email.sent`, `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.failed`, `email.suppressed`, and `email.complained`, and update only valid forward status transitions. Ignore duplicate provider events with a 2xx response.

- [ ] **Step 4: Implement protected cleanup.** Require the Worker cleanup secret, delete database messages, attachments, raw-MIME references, and inactive drafts whose one-year expiry has passed, remove orphaned empty threads, preserve aggregate audit metadata, and return counts without returning message content.

- [ ] **Step 5: Run API/service tests.**

Run: `pnpm exec vitest run src/lib/email/signatures.test.ts src/lib/email/inbound-service.test.ts src/lib/email/resend-events.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the inbound and webhook APIs.**

```bash
git add src/lib/email/signatures.ts src/lib/email/inbound-service.ts src/lib/email/resend-events.ts src/app/api/inbox/ingest src/app/api/webhooks/resend src/app/api/admin/inbox/cleanup src/lib/email/*.test.ts
git commit -m "feat: ingest inbox messages and delivery events"
```

## Task 5: Add Better Auth and the protected admin shell

**Files:**

- Create: `src/lib/auth.ts`
- Create: `src/lib/auth-client.ts`
- Create: `src/app/api/auth/[...all]/route.ts`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/inbox/page.tsx`
- Create: `src/components/admin/admin-shell.tsx`
- Create: `src/components/admin/inbox-shell.tsx`
- Create: `src/components/admin/message-list.tsx`
- Create: `src/components/admin/thread-view.tsx`
- Create: `src/components/admin/inbox-composer.tsx`
- Create: `src/components/admin/inbox-status.tsx`
- Modify: `src/app/globals.css`
- Test: `src/lib/auth.test.ts`
- Test: `src/components/admin/inbox-shell.test.tsx`

- [ ] **Step 1: Write failing auth tests.** Verify the configured administrator allowlist, unauthenticated redirect, authenticated admin access, and rejection of authenticated users outside the allowlist.

- [ ] **Step 2: Configure Better Auth.** Use the Drizzle adapter, magic-link plugin through the existing Resend sender, and passkey plugin. Keep passkey registration and management inside the admin area. Do not store or transmit biometric data; WebAuthn receives only the platform credential response.

- [ ] **Step 3: Add the protected admin shell.** Server-check the Better Auth session and allowlist before rendering `/admin`; redirect unauthenticated users to the Better Auth sign-in flow. Add a small `/admin` landing redirect to `/admin/inbox`.

- [ ] **Step 4: Build the approved three-pane inbox.** Add left-rail folders/aliases/tools, middle searchable message list with unread/status state, and right sanitized thread view with CRM contact/next-action context, quoted history, attachments, Reply, Reply all, Archive, and More actions. Keep the existing Fidexa visual tokens and make the layout responsive.

- [ ] **Step 5: Run auth and component tests.**

Run: `pnpm exec vitest run src/lib/auth.test.ts src/components/admin/inbox-shell.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit the protected UI.**

```bash
git add src/lib/auth.ts src/lib/auth-client.ts src/app/api/auth src/app/admin src/components/admin src/app/globals.css src/lib/auth.test.ts src/components/admin/inbox-shell.test.tsx
git commit -m "feat: add protected Fidexa inbox shell"
```

## Task 6: Implement inbox queries, search, drafts, attachments, and outbound sending

**Files:**

- Create: `src/lib/email/inbox-service.ts`
- Create: `src/lib/email/outbound-service.ts`
- Create: `src/app/api/admin/inbox/route.ts`
- Create: `src/app/api/admin/inbox/threads/[id]/route.ts`
- Create: `src/app/api/admin/inbox/send/route.ts`
- Create: `src/app/api/admin/inbox/drafts/route.ts`
- Create: `src/app/api/admin/inbox/attachments/[id]/route.ts`
- Create: `src/app/api/admin/inbox/contacts/route.ts`
- Modify: `src/components/admin/inbox-shell.tsx`
- Modify: `src/components/admin/inbox-composer.tsx`
- Test: `src/lib/email/inbox-service.test.ts`
- Test: `src/lib/email/outbound-service.test.ts`

- [ ] **Step 1: Write failing service tests.** Cover full-text search, unread/archive actions, draft auto-save, sender alias validation, reply header construction, To/CC/BCC parsing, attachment policy, record-before-send behavior, idempotent retry, and safe access to another administrator’s thread.

- [ ] **Step 2: Implement authenticated inbox queries.** Add cursor pagination, alias/folder/status filters, full-text search over sender/subject/body, thread detail loading, unread/archive updates, and audit events. Return only sanitized content and attachment metadata.

- [ ] **Step 3: Implement drafts and attachment access.** Autosave drafts with debounce-safe upserts, restore them by thread, validate attachment IDs against the draft/message owner, and issue short-lived links signed with `INBOX_ATTACHMENT_SECRET`. The authenticated Next.js attachment route must validate the session, token expiry, message ownership, and database expiry, then proxy the object from the Worker’s authenticated attachment endpoint; the browser must never receive public R2 credentials or a public bucket URL.

- [ ] **Step 4: Implement outbound sending.** Validate the sender against the five aliases, default replies to the receiving alias, preserve `In-Reply-To`/`References`, store pending state before calling Resend, send with an idempotency key, update immediate status, clear the draft only after a successful provider request, and preserve the draft/message on failure.

- [ ] **Step 5: Wire the UI.** Add search, folder/alias filters, unread state, thread actions, composer fields for To/CC/BCC/subject/body/attachments, auto-save status, explicit Send button, pending/delivered/failed/bounced states, and manual retry. Never send on Enter or on page load.

- [ ] **Step 6: Run service tests and type checking.**

Run: `pnpm exec vitest run src/lib/email/inbox-service.test.ts src/lib/email/outbound-service.test.ts`

Expected: PASS.

Run: `pnpm exec tsc --noEmit`

Expected: PASS.

- [ ] **Step 7: Commit the inbox behavior.**

```bash
git add src/lib/email/inbox-service.ts src/lib/email/outbound-service.ts src/app/api/admin/inbox src/components/admin/inbox-shell.tsx src/components/admin/inbox-composer.tsx src/lib/email/inbox-service.test.ts src/lib/email/outbound-service.test.ts
git commit -m "feat: add virtual inbox workflows"
```

## Task 7: Configure and stage the external services

**External surfaces:** Cloudflare dashboard, Cloudflare Worker deployment, Resend Webhooks, Vercel environment variables.

- [ ] **Step 1: Deploy the app to a preview environment and run the database migration against the separate Fidexa Neon database.** Confirm the preview URL, Better Auth callback URL, and `FIDEXA_APP_URL` before routing any mail. Do not point Cloudflare aliases at a preview that is not protected by the same admin/auth and signed-ingestion checks as production.

- [ ] **Step 2: Create or select a private R2 bucket for Fidexa inbox objects.** Configure lifecycle rules for `raw/` at 7 days and `attachments/` at 365 days. Do not expose the bucket publicly.

- [ ] **Step 3: Add production environment variables.** Configure only the required secret values in Vercel and Worker secrets; use `.env.example` and `.dev.vars.example` for names, never values. Confirm `FIDEXA_ADMIN_EMAILS` contains only the intended administrator address.

- [ ] **Step 4: Deploy the Worker and exercise its local/preview test fixture.** Verify that it can parse a fixture, write private R2 objects, call signed ingestion, and forward to the verified Gmail destination without a production alias route enabled.

- [ ] **Step 5: Register the Resend webhook.** Use the production HTTPS endpoint `/api/webhooks/resend` and subscribe only to the approved delivery events. Store the returned signing secret as a secret; never paste it into source control or chat.

- [ ] **Step 6: Change Cloudflare routing one alias at a time.** For each of the five aliases, replace the existing direct Gmail destination with the Worker destination, verify the route is active, and keep the disabled catch-all unchanged. Do not create duplicate direct and Worker routes for the same alias.

- [ ] **Step 7: Run a controlled live verification.** Send one test email to `hello@fidexa.org`, confirm it appears in Gmail and the Fidexa inbox, verify attachment privacy, reply from Fidexa, confirm Resend status updates, and inspect the audit entry. Then enable the remaining four aliases.

- [ ] **Step 8: Record rollback instructions.** Document how to restore each alias to its original verified Gmail destination and how to disable the Worker without deleting stored messages.

## Task 8: Adversarial review, fixes, and browser verification

**Files:**

- Create: `docs/superpowers/reviews/2026-08-29-fidexa-virtual-inbox-plan-review.md`
- Create: `docs/superpowers/reviews/2026-08-29-fidexa-virtual-inbox-implementation-review.md`
- Modify: any implementation files implicated by review findings.

- [ ] **Step 1: Run the independent plan review before implementation.** Check every requirement in `docs/superpowers/specs/2026-08-29-fidexa-virtual-inbox-design.md` against this plan. Specifically inspect raw-MIME/parsed-content retention, Gmail forwarding independence, alias allowlisting, signature replay protection, R2 privacy, Resend event idempotency, Better Auth/passkeys, contact creation, composer restrictions, drafts, status transitions, audit logging, rollback, and no-history-import scope.

- [ ] **Step 2: Record every plan finding and fix the plan.** A plan review is not complete if it only reports risks; update this plan and the review record until each finding is resolved or explicitly scoped out by the approved spec.

- [ ] **Step 3: Run the implementation adversarial review after all feature tests pass.** Inspect the diff and runtime for authorization bypasses, unsanitized HTML, public R2 access, replay/duplicate ingestion, route loops, accidental Gmail history import, sender spoofing, missing status transitions, draft loss, attachment leakage, mobile overflow, and public-route regressions.

- [ ] **Step 4: Fix every material implementation finding and rerun the affected tests.** Do not mark the review complete based only on a clean type check.

- [ ] **Step 5: Run the final automated checks.**

Run: `pnpm exec vitest run`

Expected: all tests PASS.

Run: `pnpm exec tsc --noEmit`

Expected: PASS.

Run: `pnpm build`

Expected: production build succeeds.

- [ ] **Step 6: Manually verify in the browser.** On the preview/production app, verify unauthenticated `/admin/inbox` redirects; complete magic-link/passkey sign-in; load the three-pane inbox; search sender/subject/body; open a sanitized HTML message; download an attachment through an expiring private link; create/restore a draft; reply with the correct alias and threading headers; send a new email with To/CC/BCC; observe pending/delivered/failed states; archive/unread a thread; and confirm the audit log.

- [ ] **Step 7: Run responsive smoke checks.** Verify the inbox at MacBook, iPad portrait/landscape, and iPhone widths. Confirm no horizontal overflow, clipped composer controls, or unreadable thread content.

- [ ] **Step 8: Commit the review records and final fixes.**

```bash
git add docs/superpowers/reviews src
git commit -m "test: review and verify Fidexa virtual inbox"
```

## Rollback and operational guardrails

- Keep the Cloudflare catch-all disabled.
- Route only the five allowlisted aliases.
- Deploy the Worker and app before changing inbound routes.
- Restore direct Gmail forwarding per alias if ingestion or forwarding health checks fail.
- Never make the R2 bucket public.
- Never put `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `INBOX_INGEST_SECRET`, `BETTER_AUTH_SECRET`, database URLs, or R2 credentials in source control.
- Do not import Gmail history.
- Do not send test messages to real recipients from automated tests.
