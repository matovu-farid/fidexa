# Fidexa visual amplification implementation plan

**Goal:** Ship a more distinctive, product-led Fidexa site while retaining its approved studio proposition, product truth and existing functionality.

**Architecture:** Focused component and CSS changes using the existing data model, typography and palette. Product media stays deterministic under `public/projects/`. The user expanded scope to admin and outreach presentation; retain their workflows and existing user edits.

**Tech stack:** Next.js 16, React 19, TypeScript, CSS/Tailwind, shadcn/ui, browser review.

- [x] Inspect current implementation, design history and Artcraft reference; identify first-fold and media hierarchy problems.
- [x] Record direction, scope and quantified acceptance criteria.
- [x] Record the user's explicit instruction to redesign directly without Penpot, and use shadcn/ui throughout public, admin and outreach UI.
- [x] Update the hero with phrase grouping, both actions and real product folio links; keep the supplied logo and proposition.
- [x] Adapt the reusable featured project card into a lead Rishi story and two web-product stories, preserving full index descriptions and destinations.
- [x] Improve studio/accountability/contact/footer rhythm and catalog responsiveness; adapt admin/outreach presentation while preserving application behavior.
- [x] Run typecheck/build and start the production review server.
- [x] Capture old/new evidence and verify the complete primary viewport and route/interaction matrix.
- [x] Run the Impeccable detector once, obtain a fresh independent adversarial review, and fix material findings.
- [x] Record source-design state, actual verification results and final screenshots; show the improved site to the user.

Stay on the currently checked-out branch. Do not reset or stage unrelated changes. Recording, Money Lending demo operations, deployment, campaign sends and data changes are outside this task.

Authenticated live-data review is a recorded limitation: routes remain guarded and the user sign-in is pending. Admin visual checks use isolated fixtures and do not verify live saves.
