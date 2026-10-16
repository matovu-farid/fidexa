# Service explanation and case-study access implementation

**Goal:** Clarify existing services and expose existing case-study content in ordinary HTML without changing the route or product scope.

**Architecture:** Keep the current data-driven project cards. Replace only the evidence disclosure with native HTML and reuse the existing Button styles. Share service facts with the plain-text guides rather than maintaining a separate agent-only claim.

**Tech stack:** Next.js, React, TypeScript, existing shadcn styles, Vitest, read-only HTTP audit, in-app browser.

- [x] Extend `scripts/audit-discovery.ts` to require all featured story fields and Apartment Manager workflow headings, descriptions, image sources, and captions in HTML outside scripts. Require a closed native disclosure and summary. Run against the unchanged production preview and confirm the new access checks fail. Independently inspect the built HTML for the unchanged privacy caveat.
- [x] Capture existing studio/evidence presentation at all five required viewport sizes.
- [x] Update `src/components/what-we-do.tsx` with concrete existing service scope and process. Reuse shared service text in `src/lib/agent-guide.ts` through a small public data module; retain current guide privacy constraints.
- [x] Change `src/components/project-evidence.tsx` to server-rendered `details`/`summary` using `buttonVariants`. Remove client-only collapse imports. Keep the same evidence map and lazy media. Update only disclosure marker and open-state CSS in `src/app/globals.css`.
- [x] Run relevant tests, TypeScript, and production build; start the updated preview on port 3001 and require the HTTP discovery audit to pass.
- [x] Capture matched new studio/evidence states, check required bounds/media/interactions/routes, and obtain independent adversarial review. Resolve material findings, reset the viewport, and record outcomes. Keep changes local for review.

Independent final review: **PASS**, no remaining material findings. Corrected PNGs cover all five exact target sizes; expanded workflows and mobile heroes match the previous presentation. After reviewing the local result, the user authorized committing and pushing these scoped changes to trigger the existing automatic deployment.
