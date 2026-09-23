# Fidexa Conversion Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` for independent code tasks and review each slice before integration. Steps use checkbox (`- [ ]`) syntax for tracking. Keep existing product facts, routes, and media provenance intact.

**Goal:** Make the Fidexa studio site clearer, more credible, and easier to contact, then verify and publish the revised production site.

**Architecture:** Design the approved focused revision in the Penpot `Fidexa Site Redesign` page first, preserving the prior board as history. Then align the existing Next.js routes and components to the reviewed design, verify the production build and browser behavior, run a fresh adversarial loop, and publish only after PASS. The rendered site remains the implementation source of truth; the Penpot milestone is the visual source.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vitest, Penpot MCP, production browser review, Vercel Git deployment.

---

## Boundaries and approval facts

- The user requested this plan, Luna implementation agents, adversarial review until material issues are resolved, redeployment, and a final push. This authorizes the release workflow after checks pass.
- Do not invent testimonials, client logos, outcomes, numbers, meeting bookings, or financial claims. Reuse only facts already present in `src/data/projects.ts` and current approved specs. Any additional proof requires verified source material.
- Keep the 11 project catalog, route scope, featured order, SMS disclosures, and the Client Solutions / Innovation Lab distinction.
- Preserve unrelated dirty campaign files in the original checkout. Work on `codex/fidexa-conversion` in the isolated worktree and stage only this release's files.
- The owner approved the focused design spec, frame, and subsequent design work on 2026-09-23. Preserve the broad studio positioning and existing palette. The Penpot milestone is pinned and recorded in `docs/superpowers/specs/2026-09-23-fidexa-conversion-penpot-milestone.md`.
- The user explicitly requested design before app. Existing Luna worktree changes are provisional until the Penpot milestone and design-to-app review are complete; do not push or deploy from the present worktree state.

## Task 1: Design and proposition contract

**Owner:** main agent, then Penpot design pass. **Files:** `docs/superpowers/specs/2026-09-22-fidexa-conversion-design.md`, Penpot page `Fidexa Site Redesign`.

- [x] Record the audience, primary action, proof hierarchy, factual copy guardrails, and acceptance criteria in the approved spec (`ce85945`).
- [x] Inspect the existing Penpot desktop/iPhone boards and token sets. The old work board uses schematic bars on mobile, the contact board omits the real form, and no iPad boards exist.
- [x] Resolve positioning: retain the approved broad product-studio headline and focused navy/mint/violet identity.
- [x] Read Penpot AI Kit rules, call `high_level_overview` first, then confirm the current page, boards, token sets, and components before mutation.
- [x] Create a separately named editorial/topbar landing composition on `Fidexa Site Redesign`; leave the prior review board and all other pages untouched. Build the full-scroll 1512px MacBook composition with token-bound surface and flex sections. Export and review the frame under the owner's blanket design approval.
- [x] Build the hero as one bounded flex section with the approved headline, primary project-inquiry action, quieter selected-work link, and decorative logo/orbs. Export and review it.
- [x] Build the selected-work section with verified Rishi, Money Lending, and Inventory image fills, factual buyer copy, catalog link, and inquiry handoff. Export and review it.
- [x] Build the two-engine studio section and the actual labeled three-field contact form, including reply expectation, privacy explanation, and success/failure state annotations. Export and review them.
- [x] Create real `834×1194`, `1194×834`, and `393×852` responsive boards from the same content hierarchy; add `/projects` catalog/filter and `/sms` route boards. Reuse existing semantic/typography tokens.
- [x] Run structural layout/overflow/token checks, export and inspect each target, correct the found mobile overflow, pin the approved milestone, and record the design decision. The independent rendered-site review remains a release gate in Task 6.

## Task 2: Hero and CTA geometry

**Owner:** Luna worker A. **Files:** `src/components/hero.tsx`, the hero/nav and responsive portions of `src/app/globals.css`.

- [x] Preserve the full bleed hero and current visual identity, but make its copy, proof, rail, and actions fit in normal content flow at short laptop heights and mobile widths.
- [x] Ensure the first primary CTA is fully visible and clickable at 1512×982, 1194×834, 834×1194, 393×852, and 390×844, with no horizontal overflow.
- [x] Use one truthful CTA label for the actual form action. Avoid language that promises an automatically booked call unless booking exists.
- [x] Verify `.hero-panel` starts at x=0 and equals viewport width; all visible children stay inside its bounds.

## Task 3: Proof and catalog

**Owner:** Luna worker B. **Files:** `src/data/projects.ts`, `src/components/project-card.tsx`, `src/components/featured-projects.tsx`, `src/app/projects/page.tsx`.

- [x] Keep the three featured projects and media in Rishi, Money Lending, Inventory order.
- [x] Rewrite short featured descriptions around verified user problem and actual solution. Do not create outcomes or metrics without evidence. Keep full catalog descriptions substantive.
- [x] Make project labels and actions useful to a buyer; keep technology as supporting detail. Add a clear contact action after featured proof.
- [x] Make the filtered catalog count reflect the visible number; preserve URL filter and reset behavior, 11 projects at All, and category counts 2/1/5/3.
- [x] Verify the media crops and external links on desktop and mobile.

## Task 4: Contact and AI handoff

**Owner:** Luna worker C. **Files:** `src/components/contact.tsx`, `src/components/chat-modal.tsx`, `src/app/api/contact/route.ts`, focused tests.

- [x] Use visible labels, browser autocomplete hints, a clear response expectation, and a short privacy explanation on the contact form.
- [x] Align the form heading/button with the hero CTA; confirm the form remains short and the sender receives an actionable success/failure state.
- [x] Give the AI assistant a visible path to place its conversation in the existing contact form without asking the visitor to retype the brief. Do not claim a meeting was booked or a lead saved until it is actually submitted.
- [x] Improve dialog touch/focus behavior and explain how conversation information is handled.
- [x] Add bounded anti-abuse controls to contact and chat using shared Postgres counters; test validation and failure states. The preview deployment must prove the additive table setup before production.

## Task 5: Analytics, metadata, and discovery

**Owner:** Luna worker D. **Files:** `src/lib/analytics.ts` or equivalent focused module, event call sites coordinated with workers, `src/app/layout.tsx`, route metadata, `src/app/sitemap.ts`, `src/app/robots.ts`, and tests where behavior is nontrivial.

- [x] Add a privacy-conscious analytics adapter that emits named events only when a configured provider exists. Never send form text, chat content, or personal data in events.
- [x] Measure hero CTA, featured work, outbound project links, contact form start/success/failure, AI open/handoff, and catalog filter use. Keep analytics failure from interrupting conversion.
- [x] Add canonical and social metadata with a real local share image if available; avoid a broken image reference. Add route-specific `/projects` metadata, sitemap, and robots rules appropriate to public pages.
- [x] Confirm no secret or private admin route is exposed in the sitemap.

## Task 6: Integration and visual QA

**Owner:** main agent. **Files:** any minimal fixes needed after review.

- [x] Review every agent diff for conflicts, factual accuracy, accessibility, and scope.
- [x] Run `pnpm exec tsc --noEmit`, focused tests, `pnpm test`, and `pnpm build`; resolve real failures. Latest local run: 182 tests in 38 files, TypeScript clean, production build clean.
- [x] Run production server on port 3001 and browser inspect `/`, `/projects`, and `/sms` at 1512×982, 834×1194, 1194×834, 393×852, plus 390×844 overflow guard. No horizontal overflow; CTA within hero; all three product images load; filters/reset, mobile menu, AI dialog opening, footer/SMS links, and rendered SMS canonical checked. Contact submission was deliberately not sent.
- [ ] Capture matched old/new screenshots under `/private/tmp/fidexa-media-pass-*.png`; reset browser viewport overrides afterward.
- [x] Give a fresh Luna reviewer the geometry, routes, requirements, and diff. It found public endpoint abuse, a stale QA server, then SMS canonical and error announcement issues. Fix each material FAIL, rebuild, and repeat until the focused re-review returns PASS. The reviewer could not independently access the local browser; the main agent repeated browser checks against the rebuilt production server.
- [x] Run a final adversarial source review and `git diff --check`; verify only release files are staged.

## Task 7: Publish

**Owner:** main agent.

- [ ] Confirm Vercel project linkage, target branch, and deployment method. The linked project ID is already present in `.vercel/project.json` in the original checkout.
- [ ] Commit the verified conversion release on the isolated branch. Push the branch, verify the preview deployment, and promote or deploy to production only after the adversarial PASS and production checks.
- [ ] Verify the public site after deployment, record the deployment URL and commit SHA, and report any remaining external proof or Penpot limitations accurately.

## Release gate

The release passes only if the primary CTA is visible at all target sizes, the three product images load in order, the catalog and category counts match, contact and AI handoff are usable, no material accessibility or console error remains, the Penpot checkpoint is complete, the fresh adversarial reviewer returns PASS, and the production deployment serves the new commit.

## 2026-09-22 implementation checkpoint

- Four Luna implementation slices have landed in the isolated `codex/fidexa-conversion` worktree. An adversarial FAIL on the public chat endpoint was fixed and retested. The subsequent CTA wording finding was resolved by distinguishing the invitation to reach the form from its explicit submit action. The second reviewer cleared the code/site findings but did not clear the Penpot gate.
- `pnpm test` passed (34 files, 161 tests), `pnpm exec tsc --noEmit` passed, `pnpm build` passed, and `git diff --check` passed. Production-browser QA found no horizontal overflow at the specified 1512, 1194, 834, 393, or 390 widths; the hero CTA was inside the hero; three real images loaded; filters returned 11/2/1/5/3 and reset the URL; and mobile project-link tap targets measured 44px.
- Penpot cloud file `fidexa`, page `Fidexa Site Redesign`, is connected and inspected. Desktop/mobile boards still show the prior `Request a fit call` CTA. On 2026-09-23 the owner approved the focused design spec: keep broad positioning, improve the inquiry path and authentic proof, and design before any further app/release work. Penpot section checkpoints remain pending.
- Vercel CLI is not authenticated on this host. GitHub authentication and Git-triggered production deployments are available. Confirm Vercel Web Analytics dashboard enablement and plan eligibility for custom events separately; the SDK is wired in code, but dashboard reporting cannot be verified locally.

## 2026-09-23 release checkpoint

- Penpot version `Fidexa conversion revision / approved design / 2026-09-23` is pinned; see the milestone spec for board IDs, token use, structural QA, exports, and design decisions.
- Postgres-backed contact/chat quotas and a narrow idempotent Vercel build hook for the new limiter table were added after adversarial review. Local builds skip database setup because this checkout has no `DATABASE_URL`; a preview/production build must configure it and pass the hook. A simulated `CI=1` build without it fails safely.
- Final local suite: 182 tests in 38 files, TypeScript and production build pass. Browser review at the five target sizes shows no overflow; the CTA remains in the hero and all three featured images load. Catalog counts and reset, SMS, AI dialog opening, and console were checked. The independent reviewer returned PASS on the source findings after the `/sms` canonical and contact error alert fixes.
- Git push, Vercel preview, production promotion, and public post-deploy verification are still pending. A preview failing the database setup is a release stop, not a production bypass.
