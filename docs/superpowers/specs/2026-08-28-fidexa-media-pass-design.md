# Fidexa Media Pass Design

## Decision

The Fidexa site will use the updated `Fidexa Site Redesign` page in `fidexa-logo.fig` as the visual source of truth. The hero becomes full-bleed across the viewport. Selected work becomes proof-led: Rishi, Money Lending Management System, and Inventory and Trade Management System use real UI captures from their deployed public products instead of synthetic CSS snapshot panels.

## What the comparison found

The old deployed site had a simpler centered hero, clearer explanatory copy for Client Solutions and Innovation Lab, and denser catalog proof. The redesign has the stronger identity and hierarchy, but its synthetic snapshots make the portfolio feel less credible. This pass keeps the redesign’s visual system and restores tangible product proof without bringing back unnecessary standalone pages.

## Media treatment

- Rishi: live library/reader capture from `https://rishi.fidexa.org/`.
- Money Lending: live Kaks Credit dashboard capture from `https://money-lending.fidexa.org/home`.
- Inventory: live dashboard capture from `https://inventory.fidexa.org/`.
- Screenshots are stored as local public assets so the site remains deterministic and does not depend on third-party image delivery at runtime.
- Cards use a consistent media frame with `object-fit: cover`, readable alt text, and a visible live-product link.

## Layout

- Hero panel spans the full viewport width with internal padding preserved for readable copy.
- Home selected work and the `/projects` index share the same featured set.
- The full 16-project catalog and existing filter behavior remain intact.
- At mobile widths, hero media and project media stack vertically without horizontal overflow.

## Verification

Review at 1440×900 and 390×844. Confirm the hero is edge-to-edge, the three featured cards show real media, the old site’s useful explanatory clarity remains, all project filters still work, and no route or contact/AI behavior regresses.
