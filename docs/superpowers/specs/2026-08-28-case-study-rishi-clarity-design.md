# Case Study — Rishi Clarity Repair

## Problem

The `Case Study — Rishi` Pencil page is visually unclear because its copy is made from independent text layers with mostly `100×100` bounds. Long headings and descriptions are therefore forced into narrow wrapping. The overlap analyzer can report no geometric collision while the page is still unreadable: the failure is text sizing and hierarchy, not only node intersection.

## Decision

Keep the current dark editorial direction, but rebuild the case study as a modular, bounded story page. Every story unit gets a clear container and follows this order:

`eyebrow → heading → supporting copy → proof/media`

Decorative vectors may overlap the background intentionally, but never cross a text or proof container. The page remains a separate `Case Study — Rishi` board and must not modify the `Fidexa Site Redesign`, `Rishi Site Redesign`, `Fidexa Logo`, or `Design System` pages.

## Composition

- One page frame, 1440px wide, with a readable 72px content gutter.
- Header metadata in a compact horizontal row.
- Hero section with the case-study label, one two-line proposition, supporting paragraph, and a bounded product proof frame.
- Three stacked story sections: Problem, Approach, and Result.
- Each story section uses a constrained text column and a separate proof/media area; no story heading is placed over another story’s copy.
- A closing next-step row sits below the result section with enough bottom padding to avoid clipping.

## Text and layout contracts

- Text nodes use width-constrained, height-growing resize (`HEIGHT`), not fixed-height boxes.
- Body copy is capped at a readable measure; headings may wrap but must have enough width for their intended line count.
- Story units use vertical auto-layout with explicit spacing and padding.
- The top-level page frame uses named child sections rather than manual coordinates for every text layer.
- Decorative layers are locked and named; content layers are named by role (`Hero / Heading`, `Problem / Body`, etc.).
- Any intentional overlay must be explicitly named `Overlay / ...` and excluded from normal content flow.

## Review and prevention process

Before saving any design file:

1. Inspect the page tree and confirm each content group has a bounded parent frame.
2. Replace placeholder copy with realistic, longest-case copy before sizing.
3. Run overlap analysis for sibling overlap, parent overflow, and intentional overlays separately.
4. Inspect typography and spacing at desktop and mobile target sizes; check both visual readability and geometric bounds.
5. Export the repaired page and review it at 100% zoom. Do not rely on analyzer output alone.
6. Run a fresh adversarial review that compares the current design to the prior version and lists any regression or unreadable region.
7. Save the `.fig` file only after all material findings are fixed, then record the final decision in a dated spec.

## Acceptance criteria

- No heading or body copy is trapped in a 100×100 text box unless the content is intentionally a short label.
- No content text overlaps another content text node, crosses its parent bounds, or sits underneath decorative artwork unintentionally.
- The hero proposition, Problem, Approach, and Result are legible in one clear reading order.
- The exported page has no accidental clipping at 1440px desktop or the intended mobile review width.
- The process rules above are included in `AGENTS.md` so future agents repeat the same checks.
