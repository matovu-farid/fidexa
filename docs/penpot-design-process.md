# Fidexa Penpot design process

Last updated: 2026-08-28

This document is the handoff for agents working on Fidexa designs in the self-hosted Penpot file. It complements `AGENTS.md`; it does not replace the repository, product, or route rules there.

## Scope and source of truth

The Penpot server is available at `http://localhost:9001/`. The working file is named `fidexa`.

Keep these design areas separate:

- `Fidexa Site Redesign` — the Fidexa studio/portfolio site.
- `Rishi Site Redesign` — the Rishi product site.
- `Fidexa Logo` — logo, favicon, and app-icon variants.
- `Design System` — shared visual tokens and component specimens.
- `Case Study — Rishi` — the Rishi case-study presentation.

Do not delete, merge, or repurpose a page because it looks like a related screen. A page should represent a coherent deliverable, not an arbitrary slice such as “Home”, “Contact”, or one project screenshot. Keep the Open Pencil source file at `/Users/faridmatovu/projects/fidexa/fidexa-logo.fig` intact as the historical source and fallback. Penpot is the current collaborative design surface; the implemented Next.js site remains the implementation source of truth.

Before changing anything:

1. Read `AGENTS.md` and the latest relevant dated spec/plan under `docs/superpowers/`.
2. Run `git status --short --branch` and preserve unrelated user changes.
3. Open the `fidexa` file and confirm the intended page is active.
4. Compare the current Penpot page with the old Fidexa site and the deployed product surfaces when deciding what to retain.

## Connecting and using the Penpot MCP

The Penpot MCP operates through the Penpot plugin connected to the currently open workspace. The green `MCP` indicator in Penpot is the important connection check. If the indicator is absent, do not attempt mutations: reconnect the plugin or reload Penpot and use `Retry` until the workspace is available again.

Use the MCP in two modes:

- Read/inspect: page lists, shape trees, names, bounds, fills, text properties, and relationships.
- Mutate: focused edits to the active page, followed by export and visual review.

A reliable inspection sequence is:

```js
const pages = penpotUtils.getPages();
const page = penpotUtils.getPageByName("Design System");
const structure = penpotUtils.shapeStructure(page.root);
```

The critical Penpot rule is that mutations only work on `penpot.currentPage`. A page returned by `getPageByName` is not necessarily active. Before editing it, explicitly open it:

```js
const page = penpotUtils.getPageByName("Design System");
await penpot.openPage(page);
const root = penpot.currentPage.root;
```

After opening the page, inspect the target by semantic name or id. Prefer `findShapes`, `findShape`, and `shapeStructure` over blind coordinate edits. Use one hypothesis per mutation so that a bad result can be understood and reverted.

Useful mutation patterns:

- `resize(width, height)` for dimensions; `width`, `height`, `parentX`, and `parentY` are not general-purpose setters.
- `penpotUtils.setParentXY(shape, x, y)` for parent-relative movement.
- `setParentIndex`, `bringToFront`, `sendToBack`, `bringForward`, and `sendBackward` for stacking order.
- `growType = "auto-height"` for body copy and headings that may wrap.
- `lineHeight` as a ratio string such as `"1.25"`, not a raw pixel value.
- `addFlexLayout` or vertical auto-layout for repeated content units.
- Stable semantic names such as `Surface / Canvas`, `Token / Ink swatch`, `Project / Media`, and `Overlay / ...`.

Make edits idempotent. Search for an existing named shape before creating one, and use guards so a retry does not duplicate specimens or overlays. Keep backgrounds/decorative artwork separate from content flow and lock them when appropriate. Do not use the MCP to modify an inactive page, and do not continue editing while the Penpot connection is reporting an internal error.

## Import and design-file QA

Imported files need a visual and structural pass before they are considered usable. In particular, check:

- Full-page and section surfaces are behind content, not covering it in z-order.
- SVG marks and logos retain the intended light/dark/mint fills after vector expansion.
- Text boxes have realistic content, readable contrast, and the correct `growType`.
- Line-height and font size produce the expected text bounds.
- Every content unit has a bounded parent frame with a clear order: eyebrow, heading, body, proof/media.
- Decorative overlaps are named `Overlay / ...`; all other sibling overlaps are treated as suspect.
- Realistic, longest-case copy fits before approval. Placeholder copy is not a layout test.
- MacBook, iPad, and iPhone compositions are separate checked states where their geometry differs. The narrowest viewport is a regression guard, not the primary artboard.
- Mobile deliverables must be real Penpot boards using the Apple preset dimensions (currently `393 × 852` for iPhone). Do not wrap a mobile board in a larger decorative phone shell, bezel, ribbon, or “device” board; presentation mockups belong on a separate presentation page and must never replace the implementation-sized board.

For a logo or favicon, inspect every contextual variant: light surface, dark surface, reversed lockup, standalone mark, and app icon. A mark that becomes visible only when selected is not a successful design. Verify its actual fill against its background rather than relying on selection outlines.

## Browser review workflow

The browser is the visual review surface. MCP is used to inspect and edit Penpot; browser automation is used to confirm what a person can actually see. Do not treat an MCP tree dump as proof of legibility.

1. Open the Penpot workspace in the in-app browser at `http://localhost:9001/`.
2. Navigate to the target file and activate the same page edited through MCP.
3. Review at fit-to-screen and at 100% zoom. Use matched MacBook, iPad portrait/landscape, and iPhone viewport sizes when the page has responsive variants.
4. Capture screenshots under `/private/tmp/` with a descriptive name such as `fidexa-penpot-design-system-desktop.png`.
5. Inspect the screenshot itself, not only the selected layer: first fold, heading wraps, contrast, media crops, empty space, clipping, and visual hierarchy.
6. Re-run the structural checks after any visual correction.

For the implemented site, use the production build and the route checks in `AGENTS.md`. At minimum review the homepage, project catalog, project media, SMS disclosures, and mobile layout. Do not rely on a stale development tab after changing implementation code.

The minimum visual matrix is:

| Surface | MacBook | iPad portrait / landscape | iPhone |
| --- | --- | --- | --- |
| Fidexa homepage / hero | 1512×982 | 834×1194 / 1194×834 | 393×852 |
| Project catalog and media | 1512×982 | 834×1194 / 1194×834 | 393×852 |
| SMS disclosures | 1512×982 | 834×1194 / 1194×834 | 393×852 |
| Narrow overflow guard | — | — | 390×844 |
| Each Penpot deliverable page | fit + 100% | fit + 100% where applicable | fit + 100% where applicable |

Reset temporary browser viewport overrides after review. If a separate reviewer cannot read a screenshot because its sandbox cannot access `/private/tmp`, provide the reviewer with the exact screenshot findings plus structural geometry and text diagnostics; then perform the visual check yourself in the browser.

## Structural checks

Run geometry checks as a separate pass from the visual pass. For each content board:

- Check that content rectangles are contained by their intended board/frame.
- Detect sibling intersections and review every intersection that is not an intentional `Overlay / ...` relationship.
- Check text bounds after wrapping, not just the original box coordinates.
- Check that media is inside its fixed aspect-ratio frame and is not clipped unexpectedly.
- Verify that required pages exist and that no redundant page was introduced.

For the implemented site, also verify the layout contracts in `AGENTS.md`, including zero document overflow at the MacBook, iPad, and iPhone targets (with 390×844 as a guard), the three homepage media items in the required order, the complete 16-project catalog, and the absence of synthetic `.project-snapshot` UI.

A clean intersection report is necessary but not sufficient: low contrast, incorrect z-order, bad cropping, or a fixed-height text box can still make a page unusable.

## Independent adversarial review loop

Every material design change gets a fresh review from a separate reviewer/agent. Give it:

- matched old and new screenshots when comparing a redesign;
- the target page name and intended audience/action;
- viewport and zoom used for each capture;
- structural overlap/containment results;
- the exact acceptance criteria.

Ask for a concrete `PASS` or `FAIL` across:

- proposition and hierarchy;
- readability, contrast, and text wrapping;
- media authenticity and crop quality;
- bounds, clipping, and responsive behavior;
- page coverage and discoverability;
- route, filter, contact, disclosure, and external-link regressions for the site.

If the reviewer returns `FAIL`, treat each material finding as required work. Fix it in Penpot or code, export/capture again, and repeat the review until the result is `PASS`. Do not close the task on the basis of an opinion that does not inspect the actual rendered output.

## Versioning, approvals, and handoff

Penpot server history is useful for recovering prior states, but it is not a substitute for a repository record. At an approved milestone:

- pin or otherwise preserve the Penpot version if the deployment supports it;
- export a `.penpot` backup when the design is a significant milestone;
- record the decision, page names, screenshots, reviewer verdict, and known tradeoffs in a dated spec under `docs/superpowers/specs/`;
- keep implementation changes in the existing reusable components and data model;
- stage only files belonging to the current task.

The Open Pencil `.fig` is a separate source/backup and must not be silently overwritten or deleted. Do not replace the Fidexa site design with Rishi pages, and do not turn separate deliverables into a single overloaded canvas. In the final handoff, state which Penpot pages changed, which browser captures were reviewed, whether the adversarial loop passed, and which unrelated files were intentionally left untouched.

## Known failure modes

| Symptom | Likely cause | Recovery |
| --- | --- | --- |
| MCP calls cannot see or edit the workspace | Plugin is disconnected | Reload Penpot, use `Retry`, and wait for the green `MCP` indicator |
| `Cannot modify a page that is not currently active` | Target page was looked up but not opened | `await penpot.openPage(page)` before mutation |
| Imported page looks blank or text disappeared | Surface paths are above content | Inspect sibling order and send background surfaces to the back |
| Logo/fav icon appears only when selected | Mark fill is too dark for its surface | Set contextual fills explicitly and export the unselected page |
| Text is enormous or overlaps after editing | Raw line-height value or fixed-height box | Use a ratio line-height such as `"1.25"` and `auto-height` growth |
| Review says geometry is clean but page still feels broken | Structural-only review missed contrast/hierarchy/crops | Perform browser screenshot review at 100% and run the adversarial loop |
| Browser shows stale or internal-error content | Old tab or lost connection | Reload the workspace, confirm the active page, and recapture |
