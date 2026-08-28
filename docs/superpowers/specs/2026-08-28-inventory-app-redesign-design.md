# Inventory App Redesign

## Status

Approved direction recorded on 2026-08-28. The local inventory app was reviewed at `http://localhost:3001/` using the current authenticated admin session. The design deliverable belongs in a separate Penpot file named `Inventory App Redesign`, in the same Penpot project as the existing `fidexa` file, connected to the shared Fidexa library.

## Decision

Keep the Fidexa design system in the existing `fidexa` Penpot file on its `Design System` page. Do not duplicate or move the token and component source. Create a separate inventory application design file so the inventory information architecture can evolve independently while reusing the published Fidexa library.

The inventory experience serves two related audiences with equal priority:

- Admins and supervisors need a calm, information-dense desktop command center for procurement, catalog, warehouse, retail, finance, and administration.
- Sales clerks need a touch-first shop-floor flow for POS, sales history, transfer receipt, offline queue, cart, and checkout on tablet and mobile.

## Visual direction

Use the Fidexa semantic system rather than the inventory app's current Apple-blue starter theme:

- Ink `#101828` for primary text, navigation emphasis, and dark action surfaces.
- Paper `#FCF9F0` and cloud `#F7F2E8` for the canvas and grouped surfaces.
- Violet `#7C5CFC` for primary interactive emphasis and focus.
- Mint `#37D6C0` for positive movement, healthy states, and selected operational highlights.
- Sand `#ECE2C7` for secondary surfaces, filters, and quiet grouping.
- Fidexa Sans with the existing type scale, rounded card language, semantic spacing, visible focus, and restrained elevation.

The redesign should feel more intentional than the current six-card launch grid without making routine operations decorative. Use a persistent navigation rail, a compact command header, strong page-level hierarchy, purposeful metric cards, and tables that make status and next actions obvious.

## Information architecture and Penpot deliverable

Create one page named `Inventory App Redesign` in the new file. The page contains bounded boards organized by route family; it must not be mixed into the existing Fidexa site, Rishi, logo, or case-study pages.

### `00 / System bridge`

Document the connected Fidexa library, semantic token mapping, type scale, spacing scale, status colors, icon sizing, elevation, and the desktop/tablet/mobile grid. Include compact specimens for the app shell, page header, button, input, select, filter chip, metric card, data table, status badge, empty state, confirmation dialog, bottom sheet, and toast.

### `01 / Shell & access`

Cover authenticated admin desktop shell, collapsed navigation rail, tablet shell, mobile shell, sales-clerk POS shell, public landing page, sign-in, request-access dialog, invite acceptance, verification-sent, forgot-password, and reset-password states. Preserve the current role-based navigation model; sales users see POS-focused navigation instead of the admin rail.

### `02 / Dashboard`

Replace the current quick-access-only dashboard with a command center containing:

- Greeting, active shop/location selector, date range, and one primary action.
- KPI row for stock value/units, sales, open movements, and cash position.
- Stock movement chart with period selector.
- Attention queue for low stock, routes due, failed sync, and setup issues.
- Recent activity timeline.
- Quick actions grouped by procurement, warehouse, and retail.

Use realistic values and labels from the captured local session. Any newly proposed metric must be labeled as a proposed dashboard statistic in the design notes and map to an existing or clearly identified future data source.

### `03 / Catalog`

Cover items index with search, date filters, archive filter, create-item action, richer item cards, and list/table view. Add item detail with gallery, article numbers, variants, color swatches, stock by location, pricing, activity, and edit actions. Include create-item, color/variant editor, photo handoff, no-image, empty-search, validation-error, and archived states.

### `04 / Procurement`

Cover supply-route index, new-route entry, route detail, route-entry wizard, receipt-grid editing, expenses, supplier picker, supplier list, create-supplier dialog, open-route resume state, received state, and error/validation states. The route screens should show progress, item cost, expenses, supplier context, and the next action before secondary detail.

### `05 / Warehouse`

Cover store stock overview, opening balance, receiving, transfers, restock requisitions, transfer detail, receive-transfer form, stock filters, low-stock state, no-stock state, split/distribution editing, confirmation, and failure states. Prioritize location, quantity, movement status, due date, and receiving/transfer actions in the first reading path.

### `06 / Retail & POS`

Cover shop overview, shop opening balance, shop restock, sales history, customer list, customer detail/add state, POS item grid, variant picker, cart, checkout, payment selection, receipt success, offline indicator, queued sales sheet, failed-sync recovery, and no-stock state. The POS boards use larger touch targets, persistent cart visibility, clear online/offline status, and a bottom-sheet pattern on mobile while preserving the Fidexa tokens.

### `07 / Finance & reports`

Cover financial overview with cash, bank balance, liquidity, revenue, expenses, net income, period selector, and empty data state. Include general ledger, X report, Z report index, Z report detail/history, shop picker, close-shift dialog, and report error/empty states. Charts and tables should use the same status and numeric typography rules as the dashboard.

### `08 / Administration`

Cover settings overview/setup checklist, users, invite flow, notifications, shop overrides, audit log, expandable audit detail, and permission/empty/error states. Setup blockers should be prominent but not visually overpower the main page content.

### `09 / Responsive review`

Show matched responsive states for the dashboard, items, supply route, stock, POS, reports, and settings at:

- MacBook `1512×982`.
- iPad portrait `834×1194`.
- iPad landscape `1194×834`.
- iPhone `393×852`.
- Narrow overflow guard `390×844`.

Use auto-layout for repeated rows and bounded content frames. Headings and body copy must grow with content. Decorative overlaps must be named `Overlay / ...` and kept separate from content flow.

## Interaction and content rules

- Keep route names, role behavior, and existing user actions recognizable so the redesign is adoptable.
- Add dashboard and stock statistics only where the current data model supports them or where the design note explicitly marks a future metric.
- Use real product language from the current routes instead of invented marketing copy.
- Use semantic status labels: healthy, attention, blocked, pending, received, offline, and archived.
- Every form has default, focus, disabled, validation-error, and success/confirmation treatment where that state exists.
- Every collection has loading, populated, empty, and error treatment where applicable.
- Keep body text at readable contrast and avoid fixed-height text boxes for wrapping copy.

## Penpot file strategy

The existing Fidexa file remains the master for shared system assets. The inventory file is a separate design deliverable in the same Penpot project, connected to the Fidexa library. If the Penpot instance cannot connect the library directly, the fallback is to document the token references in `00 / System bridge` and use the same values without changing the master file; do not copy the entire system into a second source of truth.

## Acceptance criteria

- Existing Fidexa Penpot pages remain unchanged.
- A separate Penpot file named `Inventory App Redesign` exists and contains the named route-family boards.
- The file visibly uses the Fidexa palette, type, spacing, components, and status language.
- All current route families and the required action states are represented, including POS/offline and report/settings areas.
- Dashboard designs add useful, clearly sourced operational statistics rather than only launch cards.
- Desktop, iPad portrait/landscape, iPhone, and narrow overflow states are represented and visually reviewed.
- Text is readable at fit and 100% review; content frames contain their descendants; intentional overlays are named; no obvious sibling collisions remain.
- Local baseline captures are preserved under `/private/tmp/inventory-baseline-*.png` for comparison.
- A fresh adversarial review returns `PASS` for hierarchy, readability, route coverage, responsive bounds, and role-specific workflows.
