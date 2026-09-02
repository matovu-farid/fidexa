# Farid Matovu Portfolio Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one complete, reviewed Pencil redesign page for the personal portfolio app while preserving the existing Fidexa and Rishi design pages.

**Architecture:** Treat the portfolio as one route-family system rather than a collection of disconnected pages. Build one top-level Pencil board with five desktop sections and one mobile section; use a single case-study template plus an explicit eight-project route matrix for the generated detail routes.

**Tech Stack:** Open Pencil MCP, existing `fidexa-logo.fig`, portfolio source at `/Users/faridmatovu/projects/portfolio/apps/portfolio`, browser route inspection, PNG renders, and independent adversarial review agents.

---

## File map

- Create: `docs/superpowers/specs/2026-08-27-portfolio-site-redesign-design.md` — approved design contract and route coverage.
- Create: `docs/superpowers/plans/2026-08-27-portfolio-site-redesign-implementation.md` — this executable plan.
- Modify through Open Pencil MCP: `/Users/faridmatovu/projects/fidexa/fidexa-logo.fig` — add only the `Portfolio Site Redesign` page and its board.
- Preserve before/after page IDs: `0:3` Rishi Site Redesign, `0:164` Fidexa Logo, `0:185` Design System, `0:206` Fidexa Site Redesign, and `0:296` Case Study — Rishi.
- Read-only source: `/Users/faridmatovu/projects/portfolio/apps/portfolio/src/app/page.tsx` — home content and anchors.
- Read-only source: `/Users/faridmatovu/projects/portfolio/apps/portfolio/src/app/projects/page.tsx` — index filtering/search/pagination behavior.
- Read-only source: `/Users/faridmatovu/projects/portfolio/apps/portfolio/src/app/projects/[id]/page.tsx` and `case-study-content.tsx` — shared case-study anatomy and generated routes.
- Read-only source: `/Users/faridmatovu/projects/portfolio/apps/portfolio/src/app/experience/page.tsx` — employment content.
- Read-only source: `/Users/faridmatovu/projects/portfolio/apps/portfolio/src/app/contact/page.tsx` — contact form fields and state.
- Read-only source: `/Users/faridmatovu/projects/portfolio/apps/portfolio/src/data/projects.ts` — project names, categories, technologies, and narrative availability.

## Task 1: Confirm the route inventory before drawing

**Files:**
- Read: `/Users/faridmatovu/projects/portfolio/apps/portfolio/src/app`
- Read: `/Users/faridmatovu/projects/portfolio/apps/portfolio/src/data/projects.ts`

- [ ] **Step 1: Verify the public route families.**

Confirm the route set is `/`, `/projects`, the eight generated case-study routes `rishi`, `money-lending`, `inventory-trade`, `maria`, `scrap-platform`, `case-medinsurance`, `painter`, `apartment-manager`, `/experience`, and `/contact`. Record any source change before drawing; do not add a design for a route that is not present. Confirm the source catalog contains these 18 projects: Rishi, Money Lending Management System, Inventory and Trade Management System, Maria, AI Scraping Ecosystem, CaseMedInsurance, Painter, Apartment Manager, Book Reader, Proxy Service, Realtime Analytics, RC-Textfield, Pearl of Africa Tour, Case Dashboard, Sophie Website, Stocks App, Space Travellers, and Apartment Manager (Rails).

- [ ] **Step 2: Verify the shared case-study states.**

Confirm `generateStaticParams()` filters on `project.narrative` and that all eight names above have narrative content. Use the shared template anatomy from `case-study-content.tsx`; do not make eight duplicated full-page designs.

## Task 2: Add the organized Pencil page and board

**Files:**
- Modify: `/Users/faridmatovu/projects/fidexa/fidexa-logo.fig` through Open Pencil MCP.

- [ ] **Step 1: Create the page.**

Create exactly one page named `Portfolio Site Redesign`. Do not rename or delete `Rishi Site Redesign`, `Fidexa Logo`, `Design System`, `Fidexa Site Redesign`, or `Case Study — Rishi`.

- [ ] **Step 2: Create the board.**

Create one board named `Farid portfolio redesign board` at `x=80`, `y=320`, `width=1800`, `height=5900`. Use `#F7F4EE` as the board surface and a rounded corner radius of 28. Every design section is a direct child of this board and receives a unique route-facing name. The five existing page IDs and their direct-child IDs/counts must be captured before this step and compared after Task 7.

- [ ] **Step 3: Place sections on a non-overlapping vertical grid.**

Use these exact page-coordinate positions and sizes: Home `(80,370,1640,820)`, Projects `(80,1260,1640,1040)`, Case Study `(80,2380,1640,1160)`, Experience `(80,3620,1640,620)`, Contact `(80,4340,1640,620)`, Responsive `(80,5060,1640,1120)`. The resulting gaps are 70px, 80px, 80px, 100px, and 100px. Verify sibling overlap count is zero and the final section ends at y=6180, inside the board ending at y=6220.

## Task 3: Build the five desktop route designs

**Files:**
- Modify through Open Pencil MCP: the six sections inside `Farid portfolio redesign board`.

- [ ] **Step 1: Build Home.**

Use a dark hero surface with the headline `I build complete systems that ship.`, `Farid Matovu`, the current role line, the existing supporting sentence, `View projects`, and `Get in touch`. Add four capability cards, three featured project cards for the exact titles `Rishi`, `Money Lending Management System`, and `Inventory and Trade Management System`, and a three-row experience preview. Keep primary text at 48–56px desktop and body text at 16–18px.

- [ ] **Step 2: Build Projects Index.**

Use `Work with a point of view.` and the current category/filter labels. Create a featured row for the exact titles `Rishi`, `Money Lending Management System`, `Inventory and Trade Management System`, and `Maria` with compact product evidence panels. Add a secondary grid for the exact titles `AI Scraping Ecosystem`, `CaseMedInsurance`, `Painter`, and `Apartment Manager`, plus a compact full-catalog strip naming the remaining ten exact titles: `Book Reader`, `Proxy Service`, `Realtime Analytics`, `RC-Textfield`, `Pearl of Africa Tour`, `Case Dashboard`, `Sophie Website`, `Stocks App`, `Space Travellers`, and `Apartment Manager (Rails)`. Represent the default `All` filter, one selected category state, the empty search field, and first-page pagination as static visual states; Pencil cannot implement runtime filtering, searching, or pagination. Ensure the card text is legible on every surface.

- [ ] **Step 3: Build the shared Case Study template.**

Include the actual route anatomy from the source: back link, category/year, title, description, hero image or fallback, optional demo/screenshots slot, narrative, optional evolution block, technologies, key decisions, external links, and previous/next navigation. Add an eight-row route matrix using the exact eight generated case-study names. For the mobile primary action, show `View source` when a GitHub URL exists, the first available live/App Store/product link when one exists, and a truthful `No public link` state for Maria, which has none.

- [ ] **Step 4: Build Experience.**

Use the existing three entries and periods, with one featured current role and two supporting roles. Add a small capability strip using only the existing capability themes; do not invent employers, dates, or credentials.

- [ ] **Step 5: Build Contact.**

Use `Let’s build the useful part.`, the current Name/Email/Message fields, a `Send message` button, and a side card reading `Tell me what you are building.`. Show the form in its empty/default state and include visible `Message sent` and `Unable to send` state chips as static examples without claiming a changed backend or response-time promise.

## Task 4: Build and size the mobile route frames

**Files:**
- Modify through Open Pencil MCP: `06 Responsive check / mobile`.

- [ ] **Step 1: Create four actual mobile frames.**

Create `Mobile Home`, `Mobile Projects`, `Mobile Case Study`, and `Mobile Contact`, each exactly `390×844`. Place them at page x positions 90, 500, 910, and 1320, giving 20px gaps and 10px side margins inside the 1640px responsive section. Do not use measurement labels as footer copy.

- [ ] **Step 2: Fit the mobile content to the viewport.**

Use 16px side padding, 28–32px headlines, 13–15px body copy, full-width actions, and cards no wider than 358px. Home must show its CTA and proof card; Projects must show filter chips plus at least two project cards; Case Study must show title, hero evidence, narrative start, and one primary action; use `View source` when a GitHub URL exists and otherwise use the first available live/App Store/product link; Contact must show all three fields and the submit button without clipping. Run parent-overflow analysis and inspect each frame edge in the PNG render.

- [ ] **Step 3: Add product-facing footer labels.**

Use `FARID MATOVU`, `PROJECT INDEX`, `CASE STUDY`, and `CONTACT`. Remove any visible strings matching `390×844`, `390 x 844`, `RESPONSIVE CHECK`, `LAYOUT NOTES`, `SAFE AREA`, or `NOT IN PRIMARY NAV` from the product-facing frames.

## Task 5: Review the plan adversarially before implementation

**Files:**
- Review: `docs/superpowers/specs/2026-08-27-portfolio-site-redesign-design.md`
- Review: `docs/superpowers/plans/2026-08-27-portfolio-site-redesign-implementation.md`

- [ ] **Step 1: Ask an independent reviewer to challenge the plan.**

Give a separate reviewer the spec and plan. Require it to check route completeness, preservation of the existing five pages, exact board geometry, whether the case-study route matrix is sufficient, mobile acceptance criteria, and whether any step is ambiguous or impossible through Pencil MCP. The reviewer must return `PASS` or `FAIL` with concrete findings and must not edit files.

- [ ] **Step 2: Correct every concrete plan finding.**

If the reviewer returns `FAIL`, edit the plan/spec with `apply_patch`, re-read the changed sections, and repeat the independent review. Do not begin Pencil implementation until the reviewer returns `PASS`.

## Task 6: Render and review the implementation

**Files:**
- Modify: `/Users/faridmatovu/projects/fidexa/fidexa-logo.fig` through Open Pencil MCP.
- Create review renders under `/private/tmp/portfolio-*.png`.

- [ ] **Step 1: Export desktop section renders.**

Export Home, Projects, Case Study, Experience, Contact, and Responsive sections to PNG. Inspect each image for overlap, clipping, unreadable type, inconsistent spacing, and stale design metadata.

- [ ] **Step 2: Run an independent adversarial visual review.**

Send the exported renders to a separate reviewer with a strict PASS/FAIL request covering route fidelity, visual hierarchy, contrast, mobile sizing, viewport fit, and accidental canvas notes. The reviewer must not edit the document.

- [ ] **Step 3: Fix and repeat until PASS.**

For every FAIL finding, apply the smallest concrete Pencil MCP change, re-export the affected render, and send the fresh render to a new independent review cycle. Continue until the reviewer returns PASS.

## Task 7: Final structural audit and save

**Files:**
- Modify: `/Users/faridmatovu/projects/fidexa/fidexa-logo.fig` through Open Pencil MCP.

- [ ] **Step 1: Verify page preservation and new-page structure.**

List the document pages and confirm the exact existing five plus `Portfolio Site Redesign`. Confirm the new page has exactly one top-level board named `Farid portfolio redesign board`. Compare the five preserved page IDs and each preserved page's direct-child IDs/counts against the preflight capture.

- [ ] **Step 2: Verify geometry and text invariants.**

Confirm the six desktop section sizes/positions, zero sibling overlaps, four mobile frames at exactly `390×844`, no parent overflow, and no forbidden metadata strings. Confirm all eight case-study names and all 18 project names occur in the new board.

- [ ] **Step 3: Save and confirm the artifact.**

Save through Open Pencil MCP to `/Users/faridmatovu/projects/fidexa/fidexa-logo.fig`. Confirm the tool reports `saved: true` and verify the file modification time and non-zero size on disk.
