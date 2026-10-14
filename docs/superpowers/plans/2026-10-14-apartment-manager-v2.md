# Apartment Manager v2 Implementation Plan

**Goal:** Replace the old Apartment Manager catalog entry and feature v2 using observed product facts and privacy-safe screenshots.

**Architecture:** Extend the shared project model with optional evidence details. Reuse ProjectCard and HeroShowcase; a small client ProjectEvidence component owns the disclosure. Keep catalog totals and stable IDs, so structured data and agent guides update automatically.

**Tech Stack:** Existing Next.js, React, TypeScript, shadcn/Radix, local project data and static PNGs.

- [x] Explore deployed v2 and local README/package; capture public overview, daily collections and report controls without private records.
- [x] Update `src/data/projects.test.ts` to require four featured products and one current v2 record; run `pnpm exec vitest run src/data/projects.test.ts` and confirm expected failures.
- [x] Add typed evidence data and replace the Apartment Manager object in `src/data/projects.ts`; retain ID/category and use year 2026, public `/home` URL, observed features and explicit provisional-accounting limitation.
- [x] Add `src/components/project-evidence.tsx` using Collapsible/Trigger/Content and Button; render workflow explanations and two bounded figures from data. Compose it below the existing story in `project-card.tsx`.
- [x] Add the fourth hero Tab, change the featured introduction and founder proof, and add scoped CSS for Apartment Manager/evidence and a responsive 2/4-column tab index. Update `AGENTS.md` to four featured products.
- [x] Run targeted and full tests, typecheck, build, diff check and scoped detector. Start production preview; inspect new story, detail disclosure, catalog/agent metadata and all five responsive targets.
- [x] Obtain fresh independent screenshot/source review, fix material findings in one batch, record final evidence and preserve the preview. Do not commit or push unless requested.
