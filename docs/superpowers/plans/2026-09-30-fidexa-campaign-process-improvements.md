# Implementation Plan: Fidexa Campaign Process Improvements

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to carry out this plan. Work in small tasks with verification after each task. This plan is not authorization to send email or change production integrations.

**Goal:** Make campaign learning timely, attributable, comparable, and actionable while increasing qualified conversations through evidence-led targeting and specific reviewed messages.

**Design reference:** [Fidexa campaign process improvement design](../specs/2026-09-30-fidexa-campaign-process-improvement-design.md)

**Constraints:** Zoho Free is used through the signed-in browser only. Do not add Zoho API/OAuth/webhook mailbox sync. Keep campaign sends in Zoho browser; keep Resend disabled for campaigns. Preserve all qualification, exact-message review, suppression, deliverability, daily-cap, legal, and opt-out safeguards. Do not change production state without separate authorization.

## Master campaign-improvement roadmap — 2026-10-01 (updated 2026-10-02)

This roadmap consolidates the user's campaign-process decisions across the handoff, design, learning log, and current engineering plan. It is the operating order for future agents. Checkpoints below are not permission to bypass a gate; an unmet or unknown requirement remains a hold. “Automatic” means the campaign agent carries out the next safe research/review/learning step and applies threshold-supported low-risk playbook changes. It does not mean the web app reads Zoho, sends email in the background, or overrides action-time safety checks.

### Phase 1 — Establish a trustworthy, usable contact path

- Keep Zoho Mail Free as the sole campaign mail surface, used in the user's signed-in browser as `Farid Matovu <farid@fidexa.org>`. Keep Resend, mailbox APIs, OAuth, webhooks, and other senders out of this workflow.
- Use a restrained, accurate identity. The user's current preference is to omit a signature block; the visible From identity supplies the sender name/address. Do not insert an unverified logo or claim an unverified title. If branding is used later, verify its rendering and destination.
- Every eligible message offers three distinct paths: reply to the email, clickable `mailto:farid@fidexa.org`, and clickable Fidexa website. Include the Zoho Bookings appointment link as an optional next step, not the only CTA. Create all anchors with Zoho Insert Link and inspect all rendered destinations.
- Keep opt-out language brief and conversational while unambiguous. Do not remove, weaken, or silently rewrite required opt-out or other legal copy. Keep the website, email, and booking links as natural anchor text; do not paste raw URLs into body copy.
- Verify the public Zoho Bookings page and its availability before inserting it. Do not promise that the founder is “always available”; offer only slots the booking service actually exposes.

**Done when:** an operator can compose a message in the signed-in Zoho UI, confirm sender/recipient/subject/body and three link targets plus booking link, and see a natural reply and opt-out path. The appointment destination is `https://fidexa.zohobookings.com/fidexa`; the current availability configuration still requires live account verification before use.

### Phase 2 — Build a small, evidence-backed decision-maker pipeline

- Continue research without waiting for a completed campaign to be re-authorized. Keep discovering replacement opportunities until at least three *distinct, qualified* prospects are available when possible; never fill the number with weak or duplicate records.
- Prioritize explicit paid software/product requests, warm referrals, and verified unresolved buyer workflows. Treat expansion, hiring, funding, launches, and technology news only as research clues. Keep public tenders in a separate bid-qualification lane.
- For each company and person, record public facts separately from hypotheses: offering/customers/scale, workflows and systems, current trigger, named person's remit and authority, public work, why they own the proposed workflow, one narrow Fidexa-fit use case, credible proof, and likely objections.
- Verify a public, professional, company-linked individual contact. Do not guess an email, use a personal address, substitute a generic inbox, or infer need from company growth. Search prior campaigns, aliases, parent/group names, deliveries, replies, and suppressions before counting a company/person as new.
- Score fit and document counter-evidence. Exclude competitors, poor-fit targets, closed opportunities, active suppressions, and recipients without current evidence of a relevant buyer-side need.

**Done when:** every active opportunity has an evidence-linked person/company brief, timely trigger, eligible professional contact, prior-outreach check, fit rationale, and a recorded next action; rejected or held targets have a reason and any actionable research gap.

### Phase 3 — Devil's-advocate review, repair, then draft

- Compose one person-specific email using a verifiable fact, a clearly labeled narrow workflow hypothesis, a small honest offer, one clear response action, direct reply path, website/email/booking links, and natural opt-out.
- Independently challenge relevance, timing, authority, business understanding, existing software/team, urgency, trust, vendor-spam/automated tone, overpromising, contact provenance, and do-not-contact risk. The reviewer answers why this person might respond now, what exact fact makes it personal, why it does not read as spam, and what smallest useful offer Fidexa can make.
- A failed review is a repair task, not an automatic rejection. Preserve the failed version/findings; repair copy defects or research missing facts; create a successor immutable packet; get a fresh independent review. Repeat until the exact version passes or a specific hard safety/eligibility blocker remains after reasonable research.
- Do not create a CRM or Zoho send draft before the complete exact message passes independent pre-review. A material edit invalidates the old PASS. Preserve version, evidence, reviewer, findings, and result.

**Done when:** each sendable message has a fresh PASS bound to its exact recipient, subject, rendered body, link manifest, and supporting evidence; no failed/unreviewed copy exists as a saved send draft.

### Phase 4 — Send in Zoho, verify, and continue the campaign

- User has authorized sending of qualifying messages and requested automatic continuation to the next campaign. That standing intent does not make an unqualified prospect safe or waive action-time checks.
- Immediately before each send, inspect the signed-in Zoho message, sender, destination, exact rendering and all links; refresh recipient history/suppression/opt-out/bounce status, delivery state, and remaining UTC daily-cap allowance. The configured user-authorized ceiling is 100/day; never increase it, and never infer remaining capacity from a stale ledger.
- Send only through Zoho's final Send control after every recipient, evidence, exact-version review, suppression, deliverability, and cap gate passes. Verify the Sent record/provider identifier and delivery state before counting the message. Do not retry a permanent bounce or resend a duplicate.
- Continue the same campaign's safe sequence (research → evidence → recipient verification → exact-copy review → Zoho draft/send when eligible → reconciliation) and move on to the next campaign when done. A full queue is not a reason to stop researching; a failed lead is a replacement signal only after its repairable review/evidence work is completed.

**Done when:** each sent attempt is reconciled to one Zoho message identifier and exact approved-version hash; every unresolved or unavailable attempt remains unknown and blocks a definitive no-reply result.

### Phase 5 — Check replies and close out every campaign

- Inspect the signed-in Zoho Inbox and Spam for replies/opt-outs, Sent for complete send identity/status, and Outbox for queue state. Record what was actually visible and what was unavailable. Zoho Free grants no assumed automatic mailbox ingestion; never call an uninspected state “no reply.”
- Apply opt-outs/suppressions immediately in the authorized records/process and stop further outreach to that recipient. Record bounces as permanent ineligibility unless fresh authoritative evidence establishes a safe correction; never guess an alternate address. Treat a request for later contact as a dated reminder requiring refreshed evidence and a newly reviewed message, not an automatic send.
- At campaign close and the chosen response-check date, log factual counts and missingness. For a no-reply result, verify the complete send set and the required Inbox/Spam/Sent views. If any send attempt cannot be resolved, leave the campaign unresolved.
- Compare outcomes with the original hypothesis. Label explanations as hypotheses, not facts. Measure researched → qualified → reviewed → sent → delivered → attributable reply → positive reply/booking/attendance, plus bounce, opt-out, and follow-up outcomes, using only comparable cohorts and exact reviewed message variants.

**Done when:** every campaign has a dated evidence-backed close-out and due response check; deferred replies, opt-outs, bounces, unknown mail state, and no-reply observations are accurately distinguished.

### Phase 6 — Turn accumulated learning into measured process changes

- Keep an append-only factual learning log and a concise experiment/action register. For each proposed change, record the supporting cohort/signals, current and proposed rule, expected metric, measurement window, decision, and rollback condition.
- With at least three comparable signals or ten relevant records, the agent may apply a low-risk reversible change (research ordering, proof checklist, targeting emphasis, message framing/subject, bounded offer, or follow-up timing) to the versioned playbook and use it in the next eligible campaign without asking for routine re-approval.
- Below threshold, keep the change as a recommendation. Measure the comparable cohort at its checkpoint, then retain, refine, or roll back the change and record the result. Never infer causality from one no-reply.
- Sender identity, legal/opt-out language, recipient-domain policy, suppression policy, provider, and send-limit changes remain user decisions. No learning result overrides individual prospect or deliverability gates.

**Done when:** each process improvement has traceable evidence, before/after wording, expected and observed measure, checkpoint, and rollback/retention decision; underpowered hypotheses remain explicitly tentative.

### Phase 7 — Complete and release the supporting local system

1. [x] Implement an append-only workflow to resolve an earlier uncertain Zoho send using current-browser evidence and exact reviewed-message identity. Verified-sent requires a visible Sent record; verified-not-sent requires Sent, Outbox, and Drafts checks. Incomplete or unavailable evidence remains unresolved.
2. [x] Implement an evidence-linked append-only company-alias registry, exact identity lookup, and evidence-backed identity adjudication. Same-entity names/domains are separated from related brands/groups/subsidiaries. A distinct-entity decision authorizes only its exact NFKC-normalized name/domain pair, is recorded on the resulting company, and cannot be reused. Legacy canonical names are lazily backfilled with the same application normalization before lookup/resolution/creation; database triggers block inserts until the backfill is complete and make populated keys immutable. No rows are merged. A review correction added a pre-migration Unicode legacy regression test.
3. Finish authenticated browser lifecycle QA (pre-review to Zoho handoff, send reconciliation, close-out, due response check, learning action), and obtain a fresh independent review of the latest identity-resolution and unresolved-send protections.
4. Only after these gates, request authorization for production migration/deployment; then verify production schema/config and observe a full campaign lifecycle manually. Local tests or disposable databases are not production authorization.

**Current status (2026-10-02):** exact-message pre-review boundary, local browser-only learning ledger, cohort threshold/action register, manual Zoho observation model, research hold/reopen history, send-resolution path, and identity-resolution workflow are locally implemented. The alias and resolution migrations are exercised by SQLite integration tests only. Authenticated Zoho/browser lifecycle QA remains outstanding. The user authorized committing/pushing the code on `main` to trigger Vercel production deployment; production database migrations remain a separate, unapproved operation, and no campaign message is authorized by this release request.

**QA update (2026-10-02):** the signed-in Zoho browser was checked read-only. A recipient has a deferred follow-up request; recipient identity and details remain in the private operational ledger, and no send is authorized by that request. Spam's visible messages were account/deliverability notices. Local admin lifecycle QA was attempted against the production build, but the route redirects to `/admin-auth`, whose only visible option sends a one-time sign-in link. No sign-in email or token was requested or sent, and no production write was attempted. Authenticated admin-browser QA therefore remains outstanding pending an authorized test-session sign-in path. Final local verification passed `pnpm exec vitest run` (42 files / 255 tests), root and gateway TypeScript checks, the Webpack production build, `pnpm exec drizzle-kit check`, and `git diff --check`. A fresh independent review of the latest identity-resolution and unresolved-send protections found no actionable issue. The production database schema has not been migrated.

## Cross-conversation acceptance checklist

### Latest implementation checkpoint — 2026-10-02

- Fixed two findings from the preceding independent review: a final no-reply check now conflicts if a verified Zoho reply/qualified reply is already recorded; a send-resolution must match both the attempt's registered review hash and its existing visible message ID when one was recorded.
- A second independent pass found two additional edge cases, now fixed and covered by regression assertions: send resolution is disallowed unless the uncertain attempt already carries its own Zoho message ID (and the UI no longer offers unidentified attempts); after the no-reply retrospective snapshot, verified factual delivery/bounce/reply/opt-out/booking/attendance events can still be appended, but no new send, close-out, response check, or send resolution is allowed.
- Focused campaign-learning/API tests pass (42 tests); full `pnpm exec vitest run` passes 42 files / 255 tests. Root and outreach-gateway TypeScript checks, `pnpm exec drizzle-kit check`, and `git diff --check` pass.
- `pnpm exec next build --webpack` succeeds and includes the learning page and API. Default `pnpm build` remains blocked by the sandbox denying Turbopack's child-process port binding (`Operation not permitted`); this is an environment limitation, not a source compilation failure.
- Migrations through 0015 were applied and the new migration constraints were checked in an isolated disposable local PostgreSQL cluster. No configured/production database was contacted. A follow-up runtime-store probe was not completed because the temporary PostgreSQL server could not be restarted after shutdown; the schema/API tests and SQL-level migration checks remain the available evidence.
- Authenticated admin lifecycle QA remains outstanding: the local page redirects to `/admin-auth`, and its visible sign-in path sends a one-time email link. No sign-in email/token was requested or sent. Production migration/deployment remains a separate approval gate.
- Fresh independent follow-up review passed with no actionable P1/P2 findings. The pass specifically checked the original-message-ID requirement and the narrow post-retrospective event allow-list. No campaign email was sent or edited, and no production state was changed.

- [ ] At least three distinct eligible prospects are actively researched when available; the minimum never overrides quality gates.
- [ ] Every recipient is an individually identified decision-maker with a verified public professional contact and a current, evidenced reason for outreach.
- [ ] Failed message reviews are repaired and independently repeated; no CRM/Zoho draft exists pre-PASS.
- [ ] Approved messages use Zoho Mail Free in the signed-in browser, with correct sender and verified clickable website, email, and booking paths plus an honest opt-out.
- [ ] Each send is verified and attributable; duplicates, bounces, suppression, cap, and unresolved attempts are handled correctly.
- [ ] Each campaign receives factual close-out and due-date reply checks; weekly retrospective compares only valid cohorts.
- [ ] Threshold-backed low-risk improvements automatically enter the versioned playbook and next eligible campaign; high-impact changes remain with the user.
- [ ] No background email read/send, non-Zoho sender, production mutation, or weakened safety/legal gate is introduced.

## Implementation checkpoint — 2026-10-01

Local implementation is underway; production remains untouched and migrations are unapplied. Completed in the working tree: a browser-only campaign-learning ledger and admin page; campaign/cohort hypothesis and user-selected future response-check date; manual Zoho-only outcome entries; close-out then due-date response-check lifecycle; “no reply observed” requires Inbox, Spam, and Sent checks, a verified send, and the exact complete set of identified send observations; any unverified/unavailable send attempt blocks a no-reply conclusion; server-assigned event times; append-only registration of manually handed-off independent PASS packet IDs and exact hashes; verified sends require visible Zoho message IDs and registered PASS hashes; hash-attributed events and action evidence must reference a registered hash; unknown/unavailable outcomes stay unknown; unmatched replies do not count as campaign wins; low-risk action threshold; append-only learning-action status history with evidence, decision, measurement windows, and measured-result gates; payload-bound idempotency for campaigns, observations, actions, and action transitions; campaign-row locking for lifecycle updates; visible-message/event uniqueness to prevent re-entry under a new request ID; action thresholds derived from selected, one-message, verified, attributable deliveries in the same cohort and reviewed version; server-side session, same-origin, bounded-body checks; no message-body or recipient-email fields; outreach dashboard clarifies that its gateway data is not signed-in Zoho state. The date input is interpreted explicitly as Kampala time. PASS/hash registration remains a manual operator attestation because the Free-plan browser workflow and separate review store are not programmatically joined. The learning page reports comparable-cohort outcomes only for the same declared cohort and exact reviewed-message SHA-256; unmatched versions and legacy multi-message aggregates remain visible as unknown, outside response rates; matched-wave counts exclude those records. **The campaign operating contract now explicitly makes threshold-supported low-risk improvements automatic for the agent:** update the versioned playbook and apply the change to the next eligible campaign, with expected measure, checkpoint, and rollback condition recorded; below threshold retain a recommendation, and preserve user decisions for high-impact changes. This is an operating instruction, not a background executor in the web app.

Still outstanding: authenticated Zoho/browser lifecycle QA, the full canonical alias/history graph (pending approval of the proposed registry), automatic reminder delivery (not assumed), fresh independent review of the latest close-out/hash delta and unverified-send guard, and separately approved production migration/deployment. **Local implementation update — 2026-10-01:** an append-only send-resolution path now exists in the campaign-learning model and admin form. It links one unresolved manual Zoho attempt to one resolution record, requires the exact registered reviewed hash and visible message/draft ID, distinguishes verified-sent from verified-not-sent, and requires Sent/Outbox/Drafts evidence for the latter. It cannot alter or delete the original attempt, does not access Zoho, and leaves attempts without a reviewed hash unresolved. Unverified/unavailable attempts continue to block no-reply conclusions until validly resolved; unavailable/unverified response checks no longer prematurely mark a campaign retrospected. Schema and API tests plus TypeScript pass; migration 0015 has not yet been applied or validated against PostgreSQL. Authenticated browser QA, fresh independent code review, migration validation, and separately approved production rollout are still required. All migrations through 0014 have been applied to a disposable local PostgreSQL cluster from empty schema; registered-PASS, identified-send, and no-reply valid inserts passed. A second disposable cluster was upgraded from migrations 0000–0011 with legacy verified-send and incomplete no-reply rows already present. Migrations 0012–0014 preserved those historical rows, while equivalent malformed new verified-send and no-reply inserts were rejected by the new constraints. No configured or production database was contacted. This still does not verify runtime concurrency. The local learning page surfaces due Zoho response checks and requires a factual close-out note; reminders remain visible tasks, not notifications or mail actions. Exact-message pre-review linkage is implemented locally: the CRM draft API accepts only a packet ID; packet versions are immutable and SHA-256-bound over subject/body/link manifest; a separate reviewer must read the evidence and exact copy, then record a complete PASS or actionable failure; required booking/email/website anchors and destinations are validated; raw URLs in the body are rejected; a failure requires a successor packet and fresh review. A SQLite service test covers failure → repair → PASS → CRM draft, with no draft after failure. Company intake reuses normalized-domain records without overwriting facts, same-company contact matches preserve verified facts, and a database trigger blocks new ambiguous same-name cases involving a domainless company. The gateway MCP policy has no send tool, consistent with Zoho-browser-only operations. Migrations 0008–0015 and code are unapplied to production; do not claim deployment. Action recommendations are backed by selected persisted observations; low-risk changes require at least three comparable campaigns or ten individually identified deliveries, while high-impact changes require a separate recorded user decision. Status entries are append-only records, not a background executor. Do not present the page as production-ready until applicable migrations are applied through a separately approved release and operator QA gates pass.

### Qualification history update — 2026-10-01

Update to the outstanding-work note above: durable hard-disposition/reopen history is implemented locally in gateway migration `0010_qualification_history.sql`, not deployed. Each hold records a reason and company-linked evidence supporting that decision. Reopening records the exact new evidence, requires a lane-specific buyer-need finding from a completed post-hold research run, and requires all seven deep-research categories to be refreshed before pre-review/draft. Formal procurement and unclassified records cannot enter cold-email pre-review or send gates. A full canonical alias graph remains outstanding. The signed-in Zoho browser remains the only authorized campaign mail surface; no production migration or email action occurred.

### PostgreSQL migration verification update — 2026-10-01

This update supersedes the earlier status saying migrations 0012–0014 were unvalidated. I created isolated clusters under `/private/tmp`, applied every checked-in `drizzle/*.sql` migration through 0014 with `ON_ERROR_STOP=1`, and verified the valid registered-PASS/identified-send/no-reply chain. On a separate database migrated only through 0011, I inserted legacy records that fail the new evidence rules, applied 0012–0014, and confirmed the old records remained queryable while equivalent new malformed rows were rejected. No configured or production database was contacted. This verifies clean application and the intended additive legacy-upgrade behavior, but not concurrent runtime behavior. Authenticated browser QA, latest-delta independent review, canonical alias/history completion, and separately authorized production rollout remain outstanding.

### Pre-review boundary implementation — 2026-09-30

- [x] Replace CRM-draft-first review with an immutable, versioned pre-review packet. Only post-PASS CRM draft creation can persist a draft record.
- [x] Bind review to exact subject/body/link-manifest hash and reviewer identity; require a reviewer read receipt for the exact packet and supporting evidence; validate the appointment, email, and website link destinations and anchors; preserve `needs_changes` and require a fresh successor review.
- [x] Remove legacy review-after-draft and approval-on-draft tools from the MCP role surfaces. No MCP send tool is exposed; campaign mail remains Zoho-browser-only.
- [x] Add SQLite integration coverage for fail → repair → independent PASS → exact CRM draft, and add migration 0008 locally.
- [x] Make company intake reuse normalized-domain records without rewriting prior company facts; atomically block ambiguous same-name cases when either company lacks a domain; preserve normalized-email uniqueness and existing contact facts.
- [ ] Apply/validate the migration in a disposable remote-compatible environment, run the complete repo checks and fresh adversarial review, then request separately approved deployment before production use.

### Verification checkpoint

- **Fresh rerun — 2026-10-01:** `pnpm exec vitest run` passed 41 files / 233 tests; `pnpm exec tsc --noEmit -p workers/outreach-gateway/tsconfig.json` passed; `pnpm exec next build --webpack` passed; and root `pnpm exec tsc --noEmit` passed when rerun after the build regenerated `.next/types`. The first root typecheck overlapped the build's `.next` cleanup and failed only on missing generated files; it passed on the post-build rerun. Documentation edits also pass `git diff --check`.
- `pnpm exec vitest run`: latest run passed 41 test files / 233 tests after the unresolved-send no-reply guard and warning; earlier checkpoint counts below are historical.
- `pnpm exec tsc --noEmit` and `pnpm exec tsc --noEmit -p workers/outreach-gateway/tsconfig.json`: passed.
- `pnpm exec next build --webpack`: passed after the current local changes and includes `/admin/outreach/learning` plus its API route.
- `pnpm build` (default Turbopack) hit a sandbox “operation not permitted” while spawning a CSS worker; no source error was reported. The Webpack production build above succeeded.
- Fresh adversarial review of the earlier idempotency/cohort delta: no actionable P1/P2 findings. The latest reviewer pass confirmed the false no-reply path is closed, but left the missing append-only resolution UI as an explicit blocker before production reliance. A fresh independent review after the resolution design/implementation, authenticated browser interaction QA, and separately approved production rollout remain outstanding. Disposable PostgreSQL validation passed locally, including legacy-row preservation; this and SQLite tests do not replace runtime/browser QA. No configured database was contacted; migrations remain unapplied to production. No production deployment or mail action occurred.

## Workstream 0 — Preserve the approved operating contract

This documentation workstream is complete in the current change set:

- `docs/superpowers/specs/2026-09-22-fidexa-campaign-agent-handoff.md` records campaign close-out and due-dated no-response review.
- `docs/superpowers/specs/fidexa-campaign-learning-log.md` records the user's direction append-only.
- This design and plan define the follow-on engineering and operations work.

Verify these changes with `git diff --check` and inspect only these requested files. Do not stage/commit the workspace's unrelated existing changes.

## Workstream 1 — Campaign identity, deduplication, and event provenance

**Files:** `workers/outreach-gateway/migrations/`, `workers/outreach-gateway/src/`, `workers/outreach-gateway/test/` (confirm actual test layout before edits); `src/app/admin/outreach/` and `src/app/api/admin/outreach/` only if the read-only view is intentionally extended.

1. Inspect the existing D1 schema and service invariants. Map company/contact uniqueness and current messages, reviews, evidence, suppressions, follow-ups, and reporting before proposing a migration.
2. Design an additive campaign/cohort identity and event provenance model. Each event must retain channel/source (`manual_zoho_browser` versus historical gateway channel), observed timestamp, visible provider/message identifier where available, confidence, exact message/review version, and attribution status.
3. Make company/contact dedup checks explicit in research workflows. Store hold/rejection reasons and a `reopen_reason` for materially new evidence; never erase prior history or count repeats as new opportunities.
4. Add migration and repository/service tests for normalized company/contact uniqueness, idempotent event ingestion including duplicate visible Zoho message/event identities, serialized campaign lifecycle changes, cross-channel cohort isolation, ambiguous attribution staying unknown, and append-only history.
5. Verify migrations against a disposable local D1/test database, run the gateway's full typecheck/test commands from its README/package configuration, and confirm no production binding or send setting changed.

**Local partial completion:** normalized-domain collisions are reused without overwriting saved company facts; a SQLite insert trigger atomically blocks ambiguous same-name cases when either identity is domainless, and intake returns the existing ID for research resolution. Normalized email remains unique, existing contact facts are not overwritten on duplicate intake, and cross-company reassignment is rejected. The manual outcome ledger now requires a visible Zoho identifier and 64-hex content hash of the approved message for attributable events; the hash remains operator-entered and is not automatically joined across the separate stores. Campaign/action/transition retries now reject changed payloads, and visible-message/event duplicates are blocked, but PostgreSQL concurrency behavior still needs disposable-database validation. Durable reason-coded hold/reopen history now exists locally in migration 0010, with evidence citations required for both the hold basis and new reopening signal; formal procurement and unclassified lanes are excluded from cold-email gates. A complete alias graph and unified gateway-versus-manual event model remain outstanding.

**Acceptance:** historical Resend/gateway rows cannot be mistaken for Zoho browser-verified sends; duplicate contact/company attempts are blocked or surfaced for review; unknown source/attribution remains explicit.

## Workstream 2 — Browser-only Zoho reconciliation and reporting

**Files:** `src/app/admin/outreach/page.tsx`, `src/app/api/admin/outreach/route.ts`, and any new narrowly scoped manual-reconciliation UI/API modules; gateway schema/service only as justified by Workstream 1.

1. Preserve the current signed-in Zoho browser as the only campaign-mail observation surface. Do not build mailbox polling, API access, OAuth, or webhooks.
2. Design a manual reconciliation record that captures only operator-observed fields: Zoho folder/view, visible recipient, subject, observed status, observation time, and message/thread identifier if visible. Include operator/source provenance and an explicit `unknown` option.
3. Protect any write endpoint with the existing admin-session/authorization pattern, validate fields server-side, and make re-entry idempotent by visible Zoho identifier and event type. A uniqueness conflict with different campaign or outcome data returns a conflict for manual reconciliation rather than double-counting. Do not store full mailbox contents or unrelated personal messages.
4. Keep reporting read-only for sending. Display channel/cohort filters, numerators and denominators, observation date, attribution confidence, and incomplete-state warnings. Do not label a manually noted draft as approved/sent.
5. Test unauthorized writes, duplicate reconciliation, unknown status preservation, separation of channel cohorts, and all existing GET report behavior. Verify no endpoint sends mail or edits Zoho.

**Acceptance:** a campaign operator can record what Zoho visibly confirms without implying broader mailbox access; inaccessible folders and unclear matches remain unknown; campaign reports exclude unattributed replies from reply-rate numerators.

## Workstream 3 — Evidence-led discovery and qualified pipeline

**Files:** outreach research/policy modules under `workers/outreach-gateway/src/`, the decision-maker-first policy, and focused tests; exact implementation locations to be chosen only after code inspection.

1. Convert source classes into explicit lanes: paid direct build/project requests, warm referrals, verified unresolved operator workflow, and formal procurement (separate bid assessment only).
2. Treat expansion, funding, facility launches, and hiring as research clues only. Require a current buyer-side need and evidence of an eligible individual contact before qualification.
3. Add a duplicate/history check before opening a research wave and a targeted supplemental-research path for held candidates when new evidence appears.
4. Preserve hard rejection/suppression reasons and counter-evidence (in-house teams, existing vendor, completed implementation, closed procurement, platform-only contact request). Do not turn these into inferred cold-email leads.
5. Test lane classification, duplicate suppression, hold reopening on genuinely new evidence, and unchanged decision-maker/fit/review gates.

**Acceptance:** discovery prioritizes actual buying intent, while no signal type or minimum pipeline count can bypass existing eligibility gates.

## Workstream 4 — Message experiments and outcome measurement

**Files:** campaign/review schema and reporting modules from Workstreams 1–2, plus the decision-maker-first outreach policy and test fixtures.

1. Define a small set of message dimensions to compare only when enough comparable records exist, such as problem framing, bounded offer, or CTA. Assign a variant ID and retain exact reviewed copy/version; change one dimension per comparison.
2. Require one verified company/person fact, one explicitly hypothetical narrow workflow, one small honest offer, and one CTA. Preserve sender identity, reply email, website, Zoho Bookings link, and natural opt-out.
3. Record reviewed/sent version linkage and classify replies by attribution, relevance, positive/neutral/negative/deferred/opt-out, with manual evidence source. Do not use opens as a conversion metric or introduce tracking pixels.
4. [x] Report outcomes grouped by the same declared cohort and exact reviewed-message hash, including verified sent/delivered/bounce/reply/qualified-reply/booking/attendance/opt-out counts, delivered denominator, qualified-reply and attended rates, and visible unknown counts. Keep unmatched versions separate and suppress rates where the exact version or delivered denominator is unavailable.
5. Add tests proving exact-version edits invalidate prior review and that unknown outcomes never become negative responses.

**Acceptance:** any claimed improvement names its cohort, evidence threshold, expected measure, and observed result; the system does not declare a winner from incomparable or underpowered data.

## Workstream 5 — Close-out, response-check, and experiment/action register

**Files:** campaign lifecycle and follow-up reminder code from Workstream 1, admin reporting from Workstream 2, `docs/superpowers/specs/fidexa-campaign-learning-log.md`, and the campaign handoff.

1. [x] Require a campaign's response-check due date to be recorded before first send; allow the operator to choose a campaign-appropriate date rather than hard-coding a universal interval. Implemented locally; campaign/send integration still requires the approved browser workflow.
2. [x] On campaign close, require a factual checkpoint note; verified sent/delivery/bounce/reply/opt-out/booking/follow-up counts, source, cohort, missingness, and reviewed variant remain visible from the event ledger. The close-out note must not be used to assert unverifiable totals.
3. [x] When the recorded date arrives, prominently list due campaigns with a shortcut to the operator form; inspect signed-in Zoho folders and record attributable outcome, no reply observed in checked folders, or unavailable/unverified mailbox state. A final no-reply result requires Inbox + Spam + Sent checks and the complete persisted set of identified sends; every possible send attempt must be verified, otherwise the campaign remains unresolved. Observation timestamps are server-assigned. This is an in-page task, not an automatic notification. An append-only resolution event now supports exact reviewed-hash and visible-message evidence for earlier uncertain attempts; “not sent” requires Sent + Outbox + Drafts checks. Without sufficient evidence, the original attempt remains unresolved.
4. [x] Complete the append-only experiment/action register with status history, hypothesis, supporting comparable signals, expected result, measurement window/checkpoint, decision, and observed result. Campaign, observation, action-creation, and action-transition submissions use stable client request IDs for retry idempotency. Supporting counts are computed server-side from selected persisted one-message Zoho delivery observations sharing the same cohort and exact reviewed-version hash, then re-checked before applying a low-risk change. Pending actions remain visible to carry into the next comparable cohort.
   - Each exact pre-review PASS packet/hash must first be registered as an immutable manual handoff. Any message outcome that carries a reviewed-version hash is rejected unless that campaign has a matching registered PASS hash. The app cannot automatically query the separate gateway packet store, so correctness of the initial copy remains an explicit operator attestation—not mailbox or gateway integration.
5. [x] Make learning operational: when a low-risk reversible change meets at least three comparable signals or ten relevant records, the campaign agent updates the versioned operating playbook and applies it to the next eligible campaign without asking for routine re-approval. Record the before/after rule, evidence, expected metric, measurement window, and rollback condition. Below threshold, create a recommendation only. High-impact/legal/sender/domain/cap/provider decisions remain user decisions. This is agent-directed execution, not a background executor.
6. Test due-date handling, no fabricated fixed interval, inaccessible mailbox classification, hypothesis/fact separation, evidence thresholds, and action carry-forward.

**Acceptance:** every campaign has a close-out and a due-date review; silence is not asserted until the appropriate Zoho folders are actually checked, and no-reply is never assigned a causal explanation as fact.

## Workstream 6 — Follow-up safety and operational readiness

**Files:** follow-up lifecycle/service code and operator handoff; deployment documentation for `workers/outreach-gateway/` after checking current settings.

1. Keep follow-ups as dated reminders/review tasks, not background sends. At due time, refresh recipient status, suppression, evidence, and current policy; create/review a new exact message before manually composing in Zoho.
2. [x] Inspect scheduler/cron behavior. `scheduleFollowUp()` only persists a row; `scheduled()` does not query or dispatch follow-ups. The Wrangler config requests a 15-minute cron, but an earlier Cloudflare registration was rejected at the Free-plan five-trigger limit and current deployed trigger state is unverified. Keep follow-ups as visible manual review tasks; never describe them as queued emails or automatic notifications.
3. [x] Audit stale README/config language describing Resend enabled or Zoho sync. Historical Resend/Zoho-OAuth plans and runbooks now carry explicit supersession warnings; the gateway README distinguishes checked-in flags from unverified live state; the Worker scheduler no longer invokes legacy Zoho API sync, even if `SYNC_ENABLED=true`. No production configuration was changed or deployed.
4. [x] Run security and operational tests confirming no unattended sender, no scheduled API mailbox sync, no production mutations, no change to authorized daily cap, and no relaxation of send gates. Tests confirm the MCP roles expose no send tool and the scheduler performs no mailbox fetch even with the legacy flag true; local config remains unchanged for the authorized cap. Live production state remains unverified and must not be inferred.

**Acceptance:** the documented operating mode matches deployable behavior; overdue follow-up reminders cannot silently become sends; the campaign remains Zoho-browser-only.

## Final verification and rollout gates

Before any engineering change is considered complete:

1. Run targeted unit/integration tests and the repository's documented typecheck/build/test commands for each touched subsystem.
2. Run `git diff --check`, inspect the complete diff, and have an independent reviewer verify deduplication, attribution, review invalidation, browser-only operation, no auto-send, and non-regression of all existing policy gates. Independent review exposed a false “no reply” path and an unregistered-hash path; server-side guards and regression tests close both. Later reviews verified all manual send observations are considered and uncertainty blocks a no-reply result. An append-only, Zoho-evidence-linked resolution path has now been implemented locally; fresh independent review is pending. The PASS packet/hash handoff is explicitly registered and immutable, while cross-store automatic validation remains out of scope.
3. [x] Validate migrations on disposable local data and verify production configuration is unchanged. Migrations through `0014` applied from empty schema and upgraded a separate `0011` legacy dataset; legacy rows survived and malformed new rows were rejected. Migration `0015` now passes Drizzle snapshot consistency but has not been applied to PostgreSQL: sandbox startup was denied at shared-memory creation. No configured/production DB was contacted. Concurrent runtime behavior remains unverified.
4. Roll out only after user approval of the implementation scope; observe one campaign lifecycle manually in Zoho from pre-review through close-out and due-date retrospective before relying on the new reporting.

**Not part of this plan:** sending current drafts, starting another live campaign, raising the daily cap, switching providers, accessing Zoho outside the signed-in browser, automatically reading/sending email, or changing legal/opt-out text.

### Implementation checkpoint — send-resolution workflow — 2026-10-01

- Added a separate `send_resolution` event and database migration `0015`; the original uncertain `sent` observation is never updated or deleted. A resolution must link one same-campaign manual attempt, match its exact previously registered 64-character reviewed hash, and include a visible Zoho message/draft identifier. `verified_sent` requires the Sent folder. `verified_not_sent` requires Sent, Outbox, and Drafts. A partial or conflicting record cannot clear the no-reply gate.
- No-reply checks now include direct verified sends and linked verified-sent resolution records, excluding verified-not-sent resolutions. Unknown/unavailable response checks leave the campaign open for further evidence rather than marking it retrospected.
- **Verified locally:** TDD red→green for the resolution schema/helper, 41 test files / 235 tests, root and worker TypeScript checks, Webpack production build, `drizzle-kit check`, and `git diff --check` passed on 2026-10-01. The first independent review found PostgreSQL's NULL-passing CHECK edge case; migration/schema now explicitly require a non-null resolution status and hash. A follow-up independent review is pending. An isolated PostgreSQL startup attempt failed before migrations because the sandbox denied shared-memory creation, so migration `0015` still needs disposable-database validation. Authenticated admin/browser interaction QA and approved production migration/release remain required.
- Zoho Free remains signed-in-browser-only; no Zoho mail was changed or sent by this feature. Current live suppression/cap state and mailbox outcomes are still not inferred by the app.

### Implementation checkpoint — company identity alias registry — 2026-10-02

- Added gateway migration `0011_company_alias_registry.sql` and two operator-only tools: exact `lookup_company_identity` and evidence-linked `record_company_alias`.
- Same-entity aliases are limited to legal/trading/former names and website domains. Brands, parent groups, subsidiaries, and divisions are returned as related-entity matches and never auto-merged. Exact cross-company matches remain visibly ambiguous; same-entity aliases trigger `possible_duplicate` instead of opening a new company.
- Alias rows require evidence tied to the same company and workflow, have database-enforced relation/type consistency, reject email-like alias values, and are append-only. Company detail reporting includes bounded safe alias fields; it does not expose R2 object keys.
- TDD red→green and focused validation: alias tests cover ambiguous cross-company matches, same-vs-related classification, evidence scoping, append-only constraints, domain normalization, related-entity creation, and legacy canonical-name normalization (including accented names and repeated spaces). Full verification passed: 42 files / 245 tests, root/worker TypeScript, Webpack build, Drizzle check, and diff check. Independent review's two normalization findings were fixed; final review found no actionable issue. The D1 migration was exercised through SQLite fixtures, not applied to any configured/production database. Authenticated UI/browser QA and separately approved production release remain outstanding.
