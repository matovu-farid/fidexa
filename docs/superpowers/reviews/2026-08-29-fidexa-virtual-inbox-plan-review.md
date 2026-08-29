# Fidexa Virtual Inbox Plan — Adversarial Review

Date: 2026-08-29
Reviewer: independent checklist pass
Status: PASS after fixes

## Review method

The implementation plan was compared requirement-by-requirement with `docs/superpowers/specs/2026-08-29-fidexa-virtual-inbox-design.md`. The review looked for missing scope, insecure boundaries, hidden provider coupling, non-idempotent operations, retention gaps, and verification steps that could falsely report success.

## Findings and resolutions

### 1. Missing implementation dependencies — fixed

The first plan draft used Drizzle Kit, Svix webhook verification, server-side HTML sanitization types, and Testing Library without naming them in the dependency task. Task 1 now adds all of them explicitly.

### 2. R2 attachment access was underspecified — fixed

The Next.js app cannot use the Worker’s R2 binding directly. The plan now requires an authenticated Worker `fetch` branch, a short-lived HMAC token, a private-key prefix check, and a Next.js session-protected proxy. The browser never receives a public bucket URL or R2 credentials.

### 3. Worker package isolation was underspecified — fixed

The plan now requires Worker-local declarations for PostalMime, Cloudflare Worker types, TypeScript, and Vitest so tests do not depend on accidental root-module resolution.

### 4. Gmail preservation could be lost during parsing — covered

The plan explicitly starts Gmail forwarding before consuming the inbound MIME stream and uses independent results/retries. A live verification step confirms both the Fidexa copy and Gmail copy.

### 5. Route duplication risk — covered

The external configuration task now replaces each existing direct Gmail rule one alias at a time. It explicitly forbids duplicate direct and Worker routes and leaves the catch-all disabled.

### 6. Duplicate and replay delivery — covered

The Worker payload, message IDs, Resend provider event IDs, and signed timestamps all have tests and unique database constraints. Duplicate events return success without creating a second message or send.

### 7. CRM scope ambiguity — fixed

The current Fidexa app has no CRM database. The plan now makes `mail_contacts` the initial CRM contact boundary and keeps opportunity creation manual, matching the approved design rather than assuming an unavailable existing schema.

### 8. Retention and orphan cleanup — fixed

The plan now covers seven-day raw MIME, one-year parsed messages/attachments, one-year inactive drafts, R2 lifecycle cleanup, database cleanup, and orphaned empty threads. Audit metadata survives content deletion.

### 9. Preview-routing safety — fixed

The plan now prohibits routing real aliases to a preview unless the preview has the same authentication and signed-ingestion controls as production.

## Coverage result

The plan covers the approved alias allowlist, Gmail forwarding, Worker ingestion, R2 privacy, Neon persistence, Better Auth magic links/passkeys, sanitization, full-text search, threading, contacts, drafts, attachments, outbound alias restrictions, Resend delivery events, manual retry, audit logging, retention, rollback, automated tests, and browser verification.

## Residual implementation risks to verify

- Cloudflare’s deployed Worker must expose the exact `email` handler and authenticated attachment `fetch` branch.
- The Resend webhook signing secret must be stored as a secret and verified with the provider’s current signature format.
- Passkey origin and Better Auth callback URL must match the final Fidexa hostname.
- The live alias cutover must be performed only after preview ingestion and Gmail forwarding are proven.

These are verification checkpoints, not unresolved plan gaps.
