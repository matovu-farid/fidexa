# Fidexa Site Design Repair Plan

## Objective

Repair the Fidexa Site Redesign in Penpot so it uses the approved folded-F identity, keeps every control label inside its control, uses authentic project proof, and provides complete desktop and mobile coverage that follows the Fidexa design system.

## Plan

1. Inspect the current Fidexa Site Redesign, Fidexa Logo, Design System, and Rishi responsive boards. Compare the current Penpot export with the OpenPencil reference capture and the repository’s deterministic product media.
2. Restore the folded-F as one atomic SVG lockup using the geometry from the Fidexa Logo page. Use the correct light/dark mark treatment and mint fold on the hero, navigation, and mobile screens.
3. Replace synthetic featured-card snapshots with the repository’s real Rishi, Money Lending, and Inventory captures. Keep each capture inside a fixed, rounded media frame with a predictable crop.
4. Audit button and filter geometry. Size labels from the control bounds, center them vertically, and keep touch controls above the design-system minimum.
5. Complete responsive review coverage. Convert the existing phone screens into actual iPhone device frames at `393×852`, add missing mobile states for every existing Rishi and Fidexa desktop section, and retain the iPad/MacBook targets in the shared responsive specimen.
6. Run separate structural and visual review passes. Check text collisions, descendant containment, device-frame placement, media presence, logo geometry, and browser-visible rendering. Fix every concrete finding before approval.

## Adversarial review of the plan

The initial plan was not sufficient because it treated the mobile strip as complete and assumed the vector snapshot cards were acceptable. The adversarial check identified these required additions:

- Real media restoration must be a first-class task, not an optional polish pass.
- A phone-sized board inside a desktop strip is not a proper device frame; every mobile state needs a bezel and safe-area treatment.
- Responsive coverage must include missing routes, not only Home, Work, and Contact.
- Logo geometry must be imported as one SVG lockup; independently resized path fragments distort the folded mark.
- Verification must include manual Penpot/browser screenshots in addition to geometry checks.

## Acceptance criteria

- Fidexa hero, nav, and Fidexa mobile screens use the folded-F lockup from the Fidexa Logo page.
- Rishi, Money Lending, and Inventory featured cards show real captures.
- Every button and filter label is fully contained by its control bounds.
- Rishi and Fidexa responsive sections contain proper iPhone device frames for every existing route/state.
- No text-to-text collisions or out-of-bounds descendants remain in the repaired responsive sections.
- Penpot exports and the in-app browser show no obvious logo, media, clipping, or overlap regression.
