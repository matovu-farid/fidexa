# Inventory App Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create and verify a complete Inventory App Redesign Penpot deliverable that reuses the Fidexa design system across admin, supervisor, and sales-clerk workflows.

**Architecture:** Keep the existing `fidexa` Penpot file and its `Design System` page as the shared library source. Create one separate `Inventory App Redesign` file in the same Penpot project, connect the Fidexa library, and organize all app screens on one page named `Inventory App Redesign` using bounded route-family boards. Use the local inventory app at `http://localhost:3001/` and its authenticated seeded data as the content reference; do not modify inventory source code during this design pass.

**Tech Stack:** Penpot 2.17 local instance at `http://localhost:9001/`, Penpot MCP when connected, in-app Browser for UI inspection and screenshots, local inventory Vite app, Fidexa semantic tokens, and Lucide icon language already used by the inventory app.

---

### Task 1: Confirm source evidence and preserve the baseline

**Files / artifacts:**
- Read: `/Users/faridmatovu/projects/fidexa/docs/superpowers/specs/2026-08-28-inventory-app-redesign-design.md`
- Read: `/Users/faridmatovu/projects/fidexa/docs/penpot-design-process.md`
- Read: `/Users/faridmatovu/projects/inventory/src/routes/` and `/Users/faridmatovu/projects/inventory/src/components/`
- Review: `/private/tmp/inventory-baseline-dashboard.png`, `/private/tmp/inventory-baseline-items.png`, `/private/tmp/inventory-baseline-supply.png`, `/private/tmp/inventory-baseline-reports.png`

- [ ] **Step 1: Verify route coverage from source**

Confirm the design inventory contains these route families and nested flows: access/auth, dashboard, catalog, procurement, warehouse, retail/POS, finance/reports, and administration. Treat the route files and visible authenticated navigation as authoritative; do not invent a new top-level product area.

- [ ] **Step 2: Verify the baseline captures**

Open the four named PNGs and record the concrete problems to solve: excessive unused canvas, launch-card-only dashboard, weak KPI hierarchy, compressed item cards, table-first pages without clear action emphasis, and insufficient visual distinction between operational states.

- [ ] **Step 3: Verify the shared Fidexa references**

Use the values recorded in the spec: ink `#101828`, paper `#FCF9F0`, cloud `#F7F2E8`, violet `#7C5CFC`, mint `#37D6C0`, sand `#ECE2C7`, Fidexa Sans, rounded cards, visible focus, semantic spacing, and restrained elevation.

- [ ] **Step 4: Record the baseline before Penpot mutation**

Do not delete or overwrite any existing Fidexa page. Confirm the existing file still contains `Rishi Site Redesign`, `Fidexa Logo`, `Design System`, `Fidexa Site Redesign`, `Case Study — Rishi`, and `Portfolio Site Redesign` before creating the inventory file.

### Task 2: Create the separate inventory Penpot file and connect the shared library

**Files / artifacts:**
- Create in Penpot: file `Inventory App Redesign` in the existing `New Project 1` project
- Create in Penpot: page `Inventory App Redesign`
- Connect in Penpot: the published library from the existing `fidexa` file

- [ ] **Step 1: Create the file without touching `fidexa`**

From the Penpot project view, create a new file named exactly `Inventory App Redesign`. Confirm the file opens with its own canvas and that the existing `fidexa` file remains present in the project.

- [ ] **Step 2: Connect the Fidexa library**

Open the new file’s libraries panel and connect the available Fidexa library. Confirm the connected library exposes the semantic colors, typography, and components documented in `2026-08-28-fidexa-design-system-v2-design.md`. If the library is unavailable, document the failure in the `00 / System bridge` board and use the exact recorded values without creating a competing master library.

- [ ] **Step 3: Create the deliverable page**

Create one page named exactly `Inventory App Redesign`. Keep all inventory boards on this page; do not create one page per route or rename existing Fidexa pages.

- [ ] **Step 4: Add the page index**

Create a small, bounded index board at the top-left of the page with links/labels for `00 / System bridge`, `01 / Shell & access`, `02 / Dashboard`, `03 / Catalog`, `04 / Procurement`, `05 / Warehouse`, `06 / Retail & POS`, `07 / Finance & reports`, `08 / Administration`, and `09 / Responsive review`.

### Task 3: Build the system bridge and shared shell boards

**Penpot boards:** `00 / System bridge`, `01 / Shell & access`

- [ ] **Step 1: Build `00 / System bridge` at 1440×980**

Use bounded sections with these names and order: `Foundations / Tokens`, `Type / Spacing`, `Components / Controls`, `Components / Data`, `Patterns / States`, and `Handoff / Responsive`. Show the Fidexa semantic mapping and include button, input, select, filter chip, metric card, table row, status badge, empty state, dialog, bottom sheet, and toast specimens.

- [ ] **Step 2: Build the admin desktop shell at 1512×982**

Use a left navigation rail with grouped sections `Overview`, `Procurement`, `Catalog`, `Warehouse`, `Retail`, `Finance`, and `Administration`. Use a compact command header with page title, context/location selector, search or date control where relevant, and one primary action. Use ink for the rail/header emphasis, paper/cloud for the canvas, and violet only for interactive focus/active emphasis.

- [ ] **Step 3: Build collapsed, tablet, and mobile shell variants**

Create matched shell specimens at `834×1194`, `1194×834`, and `393×852`. Collapse the rail into a top bar or sheet on narrow widths. Keep all touch targets at least 44px high and keep content inside the viewport.

- [ ] **Step 4: Build access and role variants**

Add public landing, sign-in, request-access dialog, invite acceptance, verification-sent, forgot-password, and reset-password states. Add a separate sales-clerk POS shell with only `POS`, `Sales history`, and `Receive transfers` navigation, matching the source role behavior.

### Task 4: Build the manager/admin route-family screens

**Penpot boards:** `02 / Dashboard`, `03 / Catalog`, `04 / Procurement`, `05 / Warehouse`, `07 / Finance & reports`, `08 / Administration`

- [ ] **Step 1: Build `02 / Dashboard` at 1512×982**

Use the source session’s realistic labels and values. Include a greeting/context header, location selector, period selector, KPI cards for stock value/units, sales, open movements, and cash position, a seven-day stock-movement chart, attention queue, recent activity timeline, and grouped quick actions. Label any metric with a future data source as `Proposed statistic` in a small design note.

- [ ] **Step 2: Build the catalog boards**

Show the items index in card and table modes with search, return-date filters, archive filter, count, and `Create item`. Show item detail with gallery, article numbers, variants, color swatches, stock by location, price, activity, and edit actions. Add bounded states for no image, empty search, validation error, archived item, color/variant editor, and photo handoff.

- [ ] **Step 3: Build procurement boards**

Show supply-route index, resume-open-route banner, new-route entry, route detail, route-entry wizard, receipt grid, supplier picker/list, create-supplier dialog, expenses, open status, received status, and validation/error states. Place route status, supplier, item cost, expenses, progress, and the next action before secondary detail.

- [ ] **Step 4: Build warehouse boards**

Show stock overview, low-stock and no-stock states, opening balance, receiving, transfers, restock requisitions, transfer detail, receive-transfer form, split/distribution editing, confirmation, and failure states. Use quantity, location, due date, status, and action as the primary row hierarchy.

- [ ] **Step 5: Build finance/report boards**

Show financial overview with cash on hand, bank balance, liquidity, revenue, expenses, net income, period selector, and empty data state. Add general ledger, X report, Z report index, Z report detail/history, shop picker, close-shift dialog, and report error/empty states. Use tabular numeric alignment and the same chart/status rules as the dashboard.

- [ ] **Step 6: Build administration boards**

Show settings overview/setup checklist, users, invite flow, notifications, shop overrides, audit log, expandable audit detail, permission-denied, empty, and error states. Make hard setup blockers visible in a bounded attention panel without pushing the page’s primary action below the fold.

### Task 5: Build retail/POS, responsive, and interaction-state boards

**Penpot boards:** `06 / Retail & POS`, `09 / Responsive review`

- [ ] **Step 1: Build retail screens**

Show shop overview, shop opening balance, shop restock, sales history, customer list, customer add/detail, and the related empty/error states. Use the same page header and table/card language as the manager route families.

- [ ] **Step 2: Build the POS desktop/tablet screen at 1194×834**

Use a touch-first item grid with prominent search, product image/placeholder, quantity, and variant affordance. Keep a persistent cart panel visible on tablet/desktop. Include the online/offline indicator, queued sales count, and user menu.

- [ ] **Step 3: Build POS mobile and action sheets at 393×852**

Show item grid, variant picker sheet, cart sheet, checkout sheet, payment selection, receipt success, offline indicator, queued sales sheet, failed-sync recovery, and no-stock state. Keep the primary cart/checkout action reachable without horizontal scrolling.

- [ ] **Step 4: Build the responsive review matrix**

For dashboard, items, supply route, stock, POS, reports, and settings, place matched frames at MacBook `1512×982`, iPad portrait `834×1194`, iPad landscape `1194×834`, iPhone `393×852`, and narrow guard `390×844`. Use auto-layout for repeated rows and `auto-height` text for any wrapping copy.

- [ ] **Step 5: Add interaction state specimens**

Show default, hover/focus, disabled, loading, empty, error, success, blocked, pending, received, offline, and archived states where the source route supports them. Name intentional decorative overlaps `Overlay / ...`; no other content siblings may overlap.

### Task 6: Run Penpot structural and visual QA

**Artifacts:**
- Export: `/private/tmp/inventory-penpot-system-bridge.png`
- Export: `/private/tmp/inventory-penpot-dashboard.png`
- Export: `/private/tmp/inventory-penpot-catalog.png`
- Export: `/private/tmp/inventory-penpot-procurement.png`
- Export: `/private/tmp/inventory-penpot-warehouse.png`
- Export: `/private/tmp/inventory-penpot-retail-pos.png`
- Export: `/private/tmp/inventory-penpot-reports-admin.png`
- Export: `/private/tmp/inventory-penpot-responsive.png`

- [ ] **Step 1: Verify the file/page inventory**

Confirm the new file contains exactly one page named `Inventory App Redesign`, all ten named boards, and no changes to the original Fidexa page names. Confirm the Fidexa library remains connected or the fallback token note exists.

- [ ] **Step 2: Verify containment and collisions**

Use Penpot structural inspection to check every content board for out-of-bounds descendants, text-to-text intersections, and media/text collisions. Review every intersection; only names beginning with `Overlay /` are intentional.

- [ ] **Step 3: Verify text and media legibility**

Export each listed board, inspect at fit and 100%, and verify realistic route labels wrap without clipping, status text has readable contrast, tables remain legible, and product/media placeholders do not cover controls.

- [ ] **Step 4: Verify responsive bounds**

Review the five viewport sizes in `09 / Responsive review`. Confirm there is no horizontal overflow, shell content stays inside the viewport, mobile sheets do not cover their primary action, and the first fold presents the page purpose and next action.

### Task 7: Perform adversarial review and record the milestone

**Files / artifacts:**
- Review: all eight exported Penpot PNGs plus the four local baseline PNGs
- Modify if needed: Penpot file `Inventory App Redesign`
- Record: `/Users/faridmatovu/projects/fidexa/docs/superpowers/specs/2026-08-28-inventory-app-redesign-review.md`

- [ ] **Step 1: Run a fresh adversarial review**

Ask an independent reviewer to return `PASS` or `FAIL` across hierarchy, Fidexa-system fidelity, route coverage, dashboard usefulness, admin workflow clarity, POS usability, readability, responsive bounds, and state completeness. Provide matched baseline/new screenshots and the exact viewport sizes.

- [ ] **Step 2: Resolve every material finding**

For each `FAIL` finding, make the smallest Penpot correction that addresses the concrete issue, re-export the affected board, and repeat the review. Do not accept a geometry-only pass when the screenshot still has low contrast, weak hierarchy, unreadable wrapping, or poor crop/spacing.

- [ ] **Step 3: Write the milestone record**

Record the Penpot file name, page name, board names, connected-library result, exports, viewport review matrix, adversarial verdict, known tradeoffs, and the unrelated Fidexa pages/files intentionally left untouched.

- [ ] **Step 4: Save and verify the final Penpot state**

Save the Penpot file, confirm the file remains visible from the project view, reopen the deliverable page, and verify that all named boards and the final review state are still present.
