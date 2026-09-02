# Inventory App Redesign — Route Fidelity Review

Date: 2026-08-28

## Review finding

The first Penpot pass drifted into a concept sheet. It introduced proposed dashboard surfaces without representing the running Inventory app's complete navigation, including Supply Routes, Suppliers, Items, and the existing sidebar hierarchy. The imported composition also rendered its reusable sidebar shell once outside the route boards, which made the Penpot canvas appear to contain overlapping screens.

## Correction

The visible layer on the `Inventory App Redesign` page is now `Inventory / Actual Route Redesign · Exact Sidebar`. It preserves the existing product scope and redesigns the following route families without changing functionality:

- Dashboard and its existing Quick Access modules.
- Procurement: Supply Routes and Suppliers.
- Catalog: Items and item detail preview.
- Warehouse: Stock, Receiving, and Transfers.
- Retail: Shop, Sales, and Customers.
- Finance: Reports, Ledger, X Report, and Z Reports.
- Administration: Users, Audit log, Notifications, and Settings.

The reusable visual shell is now defined in the SVG definitions area, so it is only rendered through each board that uses it. Previous concept/composite layers remain in the file as hidden archive layers for reversibility; only the corrected route sheet is visible.

## Validation

- The running app DOM was checked at `http://localhost:3001/`; its navigation links match the route labels above.
- The Penpot page has exactly one visible top-level redesign layer; previous overlapping layers are hidden and labelled as archives.
- The corrected Penpot layer was exported at full size and reviewed. The eight route boards are separated, and the standalone shell artifact is gone.
- Penpot file: http://localhost:9001/#/workspace?team-id=37d9105f-5a52-815f-8008-8d1783166971&file-id=552ccd81-c898-804d-8008-8d46ce2fb84a&page-id=552ccd81-c898-804d-8008-8d46ce2ff67a
