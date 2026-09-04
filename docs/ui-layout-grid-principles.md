# Fidexa Layout and Grid Principles

**Layout and grid handbook for Fidexa studio, product, dashboard, and prototype work**

**Last researched:** 2026-09-04

**Status:** Principles are normative. The starter values are recipes, not a final design-system contract.

## How to use this handbook

Layout is the visible logic of an experience. It establishes reading order, grouping, navigation, scale, comparison, and the space in which interaction happens. A grid is a tool for making relationships repeatable; it is not a cage that every screen must obey.

Use this with the [Fidexa UI/UX Design Principles](./ui-ux-design-principles.md), [Fidexa Spacing Principles](./ui-spacing-principles.md), [Fidexa Visual Hierarchy Principles](./ui-visual-hierarchy-principles.md), and the [UI/UX Review Checklist](./ui-ux-design-review-checklist.md).

### Status markers

- **Requirement** — accessibility, platform, or product gate.
- **Principle** — default Fidexa guidance.
- **Recipe** — repeatable starting pattern.
- **Craft heuristic** — strong convention to validate against content and task.
- **Provisional** — starter value awaiting rendered review.
- **Inference** — Fidexa synthesis from research and product context.

## 1. Layout doctrine

### Structure before decoration

The layout should make the task legible before color, imagery, motion, or polish is added.

- **Do:** Define the view’s purpose, primary action, reading path, content groups, and responsive transformation first.
- **Do:** Use alignment and containment to show what belongs together.
- **Avoid:** Starting from an empty canvas and arranging attractive objects without a task model.
- **Review question:** If all decoration disappeared, would the structure still be understandable?

### Use the grid to reveal relationships

A grid is a shared coordinate system for content, not a collection of visible lines.

- **Do:** Establish content edges, columns, gutters, rows, and a maximum reading field where they help comparison and rhythm.
- **Do:** Let related components share axes or a bounded container.
- **Avoid:** Forcing unrelated modules into equal boxes only to satisfy a grid.
- **Avoid:** Treating every gap as a grid failure.

### Prefer alignment over symmetry

Symmetry can look tidy but alignment communicates relationships more reliably. Shared left edges, baselines, columns, or control widths often create more useful order than centered repetition.

- **Do:** Align content to intentional axes and let the content determine height.
- **Avoid:** Centering every heading, card, metric, and button by default.

## 2. Grid and container recipes

### Semantic containers

Name containers by role: canvas, reading field, navigation rail, workspace, inspector, card, dialog, or overlay. A named container makes its bounds and behavior reviewable.

- **Do:** Give each content unit a bounded parent and explicit overflow behavior.
- **Do:** Record the container’s minimum, maximum, and responsive behavior.
- **Avoid:** Positioning layers by coincidence or letting an invisible parent determine the reading order.

### Provisional Fidexa web recipe

Use as a starting point, then tune against content:

| Context | Starting recipe | Purpose |
| --- | --- | --- |
| Marketing or editorial page | fluid outer gutters, bounded reading field, wide media rail | Give narrative copy a comfortable measure while letting proof breathe |
| Product workspace | persistent navigation plus flexible work area, optional inspector | Preserve orientation and make the core task dominant |
| Dashboard | summary band, comparison/diagnosis region, detail region | Move from decision to explanation to action |
| Mobile | one primary column with explicit secondary transformations | Preserve priority, reachability, and reading order |

Do not freeze a numeric column count until the content, breakpoint behavior, and minimum supported window are tested.

### Choose constraints over coordinates

Prefer max-width, min-width, flexible tracks, intrinsic sizing, and auto-layout. Absolute positioning is for intentional overlays, not normal content flow.

- **Do:** Let containers grow with text and media.
- **Do:** Name deliberate overlays as overlays and test them separately.
- **Avoid:** Hard-coding every x/y coordinate or tying a content block to a neighboring block’s accidental height.

## 3. Responsive layout

Responsive design is a change in composition, not only a smaller scale.

- **Do:** Preserve task, content priority, scope, reading order, action semantics, and recovery across breakpoints.
- **Do:** Reflow when the composition stays useful; transform when density, reach, or reading path must change.
- **Do:** Test wide, narrow, short, tall, portrait, landscape, zoomed, and text-enlarged states.
- **Avoid:** Compressing a desktop grid into tiny mobile cards.
- **Avoid:** Hiding essential content merely to preserve a desktop silhouette.

### Desktop

- Use extra width for comparison, context, definitions, and detail.
- Give panes a role, minimum width, boundary, and single-pane fallback where relevant.
- Keep navigation and inspectors from stealing task focus.
- Avoid full-bleed content when a readable field or stable edge is needed.

### Mobile

- Prioritize one main job per view.
- Stack or transform secondary panels, tables, and filters intentionally.
- Respect safe areas, keyboard changes, thumb reach, and orientation.
- Keep primary actions in a reachable and visible location.

### Fidexa target matrix

Review the implemented result at iPhone 393×852, narrow guard 390×844, iPad portrait 834×1194, iPad landscape 1194×834, and MacBook 1512×982 where the surface is in scope. The layout contract must also hold at the documented minimum supported window.

## 4. Dashboards and prototypes

### Dashboard composition

- Put audience, active scope, time range, and primary decision near the beginning of the layout.
- Place summary before diagnosis, and diagnosis before action or drill-down.
- Use alignment to support comparison; do not make every card visually independent.
- Preserve units, freshness, filters, and data-state context near the values they qualify.
- On mobile, reduce and prioritize before stacking; do not merely scale the desktop grid.

### Prototype composition

- Prototype the smallest layout slice that answers the learning question.
- Use realistic content and the actual target frame; placeholder geometry is not evidence.
- Show the states and transitions that the layout hypothesis depends on.
- Do not polish a grid before testing whether the information order is useful.

## 5. Accessibility and layout resilience

- **Requirement:** The meaningful reading sequence remains correct when visual layout changes.
- **Requirement:** Web content reflows at the WCAG equivalent of 320 CSS px without unnecessary two-dimensional scrolling, except where two dimensions are essential.
- **Requirement:** Text enlargement and zoom do not hide controls, overlap content, or remove functionality.
- Keep focus order, keyboard order, touch order, and visual order aligned.
- Make overflow intentional and discoverable; do not let it happen accidentally.
- Test localization, long names, large text, reduced motion, and fallback fonts before approval.

## 6. Mistakes to always avoid

- Designing a grid before defining the task and content hierarchy.
- Using equal cards for unequal importance.
- Centering everything and losing a stable reading edge.
- Stretching prose to fill a wide screen.
- Using absolute coordinates for content that wraps or grows.
- Hiding essential content at breakpoints instead of transforming the composition.
- Treating a desktop screenshot inside a mobile frame as responsive design.
- Allowing parent overflow, clipping, or fixed overlays to decide the layout accidentally.
- Using a dense dashboard grid without a clear summary-to-action reading path.
- Approving a layout with placeholder copy, missing states, or only one viewport.

## 7. Layout review checklist

- [ ] The view’s job, reading path, content groups, and primary action are named.
- [ ] Containers have semantic roles, bounds, minimums, maximums, and overflow behavior.
- [ ] Alignment axes are intentional and shared relationships are visible.
- [ ] Layout uses constraints and auto-layout where content can grow.
- [ ] Desktop makes useful comparison/context easier rather than merely adding empty space.
- [ ] Mobile preserves task priority and uses intentional transformations.
- [ ] Dashboard layout moves from summary to diagnosis to action.
- [ ] Prototype layout tests a stated hypothesis with realistic content.
- [ ] Reading, focus, keyboard, touch, zoom, text enlargement, RTL, and localization order remain meaningful.
- [ ] All in-scope Fidexa target sizes were rendered and reviewed.

## 8. Source map

Sources checked on **2026-09-04**:

| Source | Used for | Link |
| --- | --- | --- |
| Apple Human Interface Guidelines — Layout | Adaptable layouts, platform-aware composition, content organization, safe areas, and device context | [Apple Layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| Apple Human Interface Guidelines — Spatial layout | Spatial relationships, depth, scale, orientation, and readable placement in spatial contexts | [Apple Spatial Layout](https://developer.apple.com/design/human-interface-guidelines/spatial-layout) |
| Material 3 adaptive layouts | Window size classes, responsive composition, and adapting layouts to available space | [Android adaptive layouts](https://developer.android.com/develop/ui/compose/layouts/adaptive) |
| Atlassian Design — Grid | Shared grid language, layout primitives, and responsive structure | [Atlassian Grid](https://atlassian.design/foundations/grid/) |
| Atlassian Design — Spacing | Consistent spacing scale as the foundation for layouts and responsive density | [Atlassian Spacing](https://atlassian.design/foundations/spacing/) |
| IBM Carbon — Grid | Productive grid systems, columns, margins, and responsive behavior | [Carbon Grid](https://carbondesignsystem.com/elements/grid/overview/) |
| W3C WAI — Reflow | 320 CSS px reflow and avoiding unnecessary two-dimensional scrolling | [WCAG Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) |
| W3C WAI — Meaningful Sequence | Preserving reading order when presentation changes | [WCAG Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html) |

This handbook is opinionated about one thing: let layout make the product’s purpose obvious before style asks for attention.
