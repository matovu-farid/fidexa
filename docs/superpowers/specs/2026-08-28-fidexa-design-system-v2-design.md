# Fidexa design system v2

## Status

Implemented in the Penpot file `fidexa`, page `Design System`, on 2026-08-28.

## Decision

Keep the existing `Fidexa Studio System — Tokens & Components` board as the brand overview and extend the same `Design System` page with three bounded boards:

- `Foundations / Tokens & Accessibility`
- `Components / States`
- `Patterns / Responsive & Handoff`

This keeps the design-system deliverable organized without creating separate pages for arbitrary screens or mixing the Fidexa site and Rishi site deliverables.

## Implemented foundations

Penpot’s native local library now contains:

- `Fidexa Primitives` token set: brand colors, dimensions, spacing, radii, font sizes/weights/family, motion numbers, and card elevation.
- `Fidexa Semantic` token set: surface, content, action, border, focus, status, gutter, control-height, and card-radius roles.
- `Color mode / Light` theme containing both token sets.
- Seven reusable library colors, four typography styles, and four library components.

The values are based on the existing production CSS in `src/app/globals.css`. Semantic tokens are preferred in future work; raw primitive values are reserved for token definitions.

## Coverage added

The page now documents:

- primitive-to-semantic color mapping;
- typography scale and spacing scale;
- radius and elevation guidance;
- contrast and focus examples;
- Fidexa Studio and Rishi Product theme boundaries;
- button, input, project-card, filter, and dialog specimens;
- default, focus, disabled, and error examples;
- desktop/mobile responsive contracts;
- motion timing and icon-grid guidance;
- design-to-code handoff checks.

## Acceptance evidence

- Exported each new board at full resolution and inspected the actual image.
- Browser-reviewed the complete Penpot page after the update; browser console contained no errors or warnings.
- Structural review found zero text-to-text collisions and zero out-of-bounds descendants in all three new boards.
- Penpot page list remains unchanged: `Rishi Site Redesign`, `Fidexa Logo`, `Design System`, `Fidexa Site Redesign`, `Case Study — Rishi`, and `Portfolio Site Redesign`.
- The Open Pencil `.fig` source and unrelated worktree changes were not modified by this design-system update.

## Follow-up

When the Rishi product acquires a distinct mode or new interaction patterns, add them as semantic token themes or component variants on this page and update the implementation mapping. Do not create a new page for a single screen.
