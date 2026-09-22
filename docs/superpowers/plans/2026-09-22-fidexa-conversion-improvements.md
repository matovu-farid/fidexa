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
- The owner approved the focused design spec in `docs/superpowers/specs/2026-09-22-fidexa-conversion-design.md` on 2026-09-23. Preserve the broad studio positioning and existing palette. The Penpot MCP is connected. Each material frame/section still has the Penpot AI Kit's Apply-with-review checkpoint.
- The user explicitly requested design before app. Existing Luna worktree changes are provisional until the Penpot milestone and design-to-app review are complete; do not push or deploy from the present worktree state.

## Task 1: Design and proposition contract

**Owner:** main agent, then Penpot design pass. **Files:** `docs/superpowers/specs/2026-09-22-fidexa-conversion-design.md`, Penpot page `Fidexa Site Redesign`.

- [x] Record the audience, primary action, proof hierarchy, factual copy guardrails, and acceptance criteria in the approved spec (`ce85945`).
- [x] Inspect the existing Penpot desktop/iPhone boards and token sets. The old work board uses schematic bars on mobile, the contact board omits the real form, and no iPad boards exist.
- [x] Resolve positioning: retain the approved broad product-studio headline and focused navy/mint/violet identity.
- [ ] Read Penpot AI Kit rules, call `high_level_overview` first, then confirm the current page, boards, token sets, and components before mutation.
- [ ] Create a separately named editorial/topbar landing composition on `Fidexa Site Redesign`; leave the prior review board and all other pages untouched. Build a `1512×982` MacBook screen frame with token-bound surface and flex sections. Export and request review of the frame.
- [ ] Build the hero as one bounded flex section with the approved headline, single primary project-inquiry action, quieter selected-work link, and decorative logo/orbs. Export, self-review, and request review of this section before continuing.
- [ ] Build the selected-work section with copied verified Rishi, Money Lending, and Inventory image fills, factual buyer copy, catalog link, and inquiry handoff. Export, self-review, and request review.
- [ ] Build the two-engine studio section and the actual labeled three-field contact form, including reply expectation, privacy explanation, and success/failure states. Export and review each section separately.
- [ ] Create real `834×1194`, `1194×834`, and `393×852` responsive boards from the same content hierarchy; add only necessary `/projects` catalog/filter and `/sms` route boards. Reuse existing semantic/typography tokens; propose any missing token before creating it.
- [ ] Run structural layout/overflow/token checks, export and inspect each target at 100%, and request a fresh adversarial design review. Fix any material finding and repeat until PASS, then pin/export the approved milestone and record the design decision.

## Task 2: Hero and CTA geometry

**Owner:** Luna worker A. **Files:** `src/components/hero.tsx`, the hero/nav and responsive portions of `src/app/globals.css`.

- [ ] Preserve the full bleed hero and current visual identity, but make its copy, proof, rail, and actions fit in normal content flow at short laptop heights and mobile widths.
- [ ] Ensure the first primary CTA is fully visible and clickable at 1512×982, 1194×834, 834×1194, 393×852, and 390×844, with no horizontal overflow.
- [ ] Use one truthful CTA label for the actual form action. Avoid language that promises an automatically booked call unless booking exists.
- [ ] Verify `.hero-panel` starts at x=0 and equals viewport width; all visible children stay inside its bounds.

## Task 3: Proof and catalog

**Owner:** Luna worker B. **Files:** `src/data/projects.ts`, `src/components/project-card.tsx`, `src/components/featured-projects.tsx`, `src/app/projects/page.tsx`.

- [ ] Keep the three featured projects and media in Rishi, Money Lending, Inventory order.
- [ ] Rewrite short featured descriptions around verified user problem and actual solution. Do not create outcomes or metrics without evidence. Keep full catalog descriptions substantive.
- [ ] Make project labels and actions useful to a buyer; keep technology as supporting detail. Add a clear contact action after featured proof.
- [ ] Make the filtered catalog count reflect the visible number; preserve URL filter and reset behavior, 11 projects at All, and category counts 2/1/5/3.
- [ ] Verify the media crops and external links on desktop and mobile.

## Task 4: Contact and AI handoff

**Owner:** Luna worker C. **Files:** `src/components/contact.tsx`, `src/components/chat-modal.tsx`, `src/app/api/contact/route.ts`, focused tests.

- [ ] Use visible labels, browser autocomplete hints, a clear response expectation, and a short privacy explanation on the contact form.
- [ ] Align the form heading/button with the hero CTA; confirm the form remains short and the sender receives an actionable success/failure state.
- [ ] Give the AI assistant a visible path to send its summary through the existing contact form without asking the visitor to retype the brief. Do not claim a meeting was booked or a lead saved until it is actually submitted.
- [ ] Improve dialog touch/focus behavior and explain how conversation information is handled.
- [ ] Add bounded anti-abuse controls to the contact endpoint that do not block legitimate leads; test validation, failures, and handoff data.

## Task 5: Analytics, metadata, and discovery

**Owner:** Luna worker D. **Files:** `src/lib/analytics.ts` or equivalent focused module, event call sites coordinated with workers, `src/app/layout.tsx`, route metadata, `src/app/sitemap.ts`, `src/app/robots.ts`, and tests where behavior is nontrivial.

- [ ] Add a privacy-conscious analytics adapter that emits named events only when a configured provider exists. Never send form text, chat content, or personal data in events.
- [ ] Measure hero CTA, featured work, outbound project links, contact form start/success/failure, AI open/handoff, and catalog filter use. Keep analytics failure from interrupting conversion.
- [ ] Add canonical and social metadata with a real local share image if available; avoid a broken image reference. Add route-specific `/projects` metadata, sitemap, and robots rules appropriate to public pages.
- [ ] Confirm no secret or private admin route is exposed in the sitemap.

## Task 6: Integration and visual QA

**Owner:** main agent. **Files:** any minimal fixes needed after review.

- [ ] Review every agent diff for conflicts, factual accuracy, accessibility, and scope.
- [ ] Run `pnpm exec tsc --noEmit`, focused tests, `pnpm test`, and `pnpm build`; resolve real failures.
- [ ] Run production server on port 3001 and browser inspect `/`, `/projects`, and `/sms` at 1512×982, 834×1194, 1194×834, 393×852, plus 390×844 overflow guard. Check console errors, image loads, layout bounds, filters/reset, contact states without sending a real inquiry, menu, AI dialog, footer, and SMS.
- [ ] Capture matched old/new screenshots under `/private/tmp/fidexa-media-pass-*.png`; reset browser viewport overrides afterward.
- [ ] Give a fresh reviewer screenshots, geometry, routes, requirements, and diff. Require PASS/FAIL with concrete findings. Fix each material FAIL, rebuild, recapture, and repeat until PASS.
- [ ] Run a final adversarial source review and `git diff --check`; verify only release files are staged.

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
