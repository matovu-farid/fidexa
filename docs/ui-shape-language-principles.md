# Fidexa Shape Language Principles

**Shape language handbook for Fidexa studio, product, dashboard, and prototype work**

**Last researched:** 2026-09-04

## How to use this handbook

Shape language is the geometry vocabulary of a product: corner radii, silhouettes, borders, containers, icons, pills, dividers, and the relationship between hard and soft forms. It creates recognition and rhythm, communicates containment and affordance, and gives a product a point of view.

Shape must support content, interaction, and hierarchy. Roundedness is not automatically friendly; sharpness is not automatically serious. The right shape is the one whose geometry matches the role.

Use this with the [Fidexa Layout and Grid Principles](./ui-layout-grid-principles.md), [Fidexa Spacing Principles](./ui-spacing-principles.md), [Fidexa Contrast Principles](./ui-contrast-principles.md), [Fidexa Color Principles](./ui-color-principles.md), and the [UI/UX Review Checklist](./ui-ux-design-review-checklist.md).

## 1. Shape doctrine

### Shape communicates role

Geometry tells people whether something is a container, control, tag, status, overlay, surface, or decoration.

- **Do:** Give repeated roles a repeated shape family.
- **Do:** Let interactive shapes look actionable and non-interactive shapes remain quiet.
- **Avoid:** Adding a radius because a component feels empty or because every design trend uses one.
- **Review question:** What does this shape tell the user about the object’s role?

### Use a scale, not a bag of radii

A small radius scale creates coherence and makes components compose. A shape token should have a role and a size relationship, not just a number.

- **Do:** Define tokens for control, card, panel, dialog, container, and pill shapes.
- **Do:** Use larger radii for larger or more expressive containers only when the hierarchy supports it.
- **Avoid:** Mixing arbitrary radii in a single screen or rounding every edge independently.

### Let content determine the silhouette

Shapes should accommodate real text, touch, data, and media. A fixed pill or card radius is not a license to clip its contents.

- **Do:** Let height grow with content and keep internal padding balanced.
- **Do:** Use aspect ratios and object-fit rules for media rather than forcing content into an ornamental shape.
- **Avoid:** Fixed-height rounded cards that clip text or make the interaction target ambiguous.

## 2. Shape vocabulary

| Shape role | Typical use | Caution |
| --- | --- | --- |
| Square or low radius | Dense tables, technical surfaces, grouped fields | Can feel severe when used everywhere |
| Small radius | Inputs, compact controls, list items | Keep the radius subordinate to the control role |
| Medium radius | Cards, menus, toolbars, standard surfaces | Avoid making every surface look like a floating card |
| Large radius | Hero panels, editorial containers, prominent sheets | Needs generous space and should not hide structure |
| Full pill | Tags, compact status, segmented controls, short filters | Long copy and mixed actions can become awkward |
| Circle | Avatars, icon buttons, status marks | Circle does not explain an unfamiliar action |
| Organic or expressive | Brand moments, illustrations, marketing atmosphere | Do not use for dense operational controls |

This is a semantic vocabulary, not a requirement to use every shape on every page.

## 3. Shape and interaction

- Keep hit areas larger than the visible glyph or border.
- Ensure focus indicators remain outside or clearly distinct from the shape.
- Use shape change sparingly for hover, pressed, selected, and disabled states; do not make state feel like a different component.
- Make menus, popovers, dialogs, and sheets visually distinct from the surface behind them.
- Avoid a card silhouette that implies the whole card is clickable when only one text link is actionable.
- Use borders, fills, and shape together to communicate containment; do not rely on radius alone.

## 4. Shape across surfaces

### Desktop and mobile

- Desktop can support larger container shapes and multi-pane boundaries; mobile needs clear edge-to-edge and sheet behavior.
- Keep control shapes and interactive semantics consistent while letting panel shapes adapt to viewport.
- Do not preserve an ornamental desktop radius when it reduces mobile content width or touch clarity.

### Dashboards

- Use shape to group a metric, not to turn every metric into a separate visual island.
- Keep table and chart containers quiet enough for data contrast and comparison.
- Use pills for short filters/statuses, not for long definitions or primary actions.

### Prototypes

- Prototype shape only where it tests affordance, brand expression, density, or component language.
- Do not spend time tuning radii before the task, layout, and state behavior are understood.

## 5. Accessibility and shape

- Shape is not a substitute for labels, text, contrast, focus, or accessible names.
- Do not communicate status only through a corner radius, border shape, or outline.
- Make focus indicators visible against every surface and outside rounded clipping where needed.
- Preserve touch-target size and separation when shapes become pills or circles.
- Test large text, localization, content expansion, zoom, and high contrast; shape must not clip the result.
- Respect reduced-motion preferences when shape changes are animated.

## 6. Mistakes to always avoid

- Using one giant radius everywhere as a generic personality.
- Mixing four or five unrelated radius families on one screen.
- Making non-interactive surfaces look like buttons or cards look clickable by accident.
- Using pills for long text, complex actions, or content that needs to wrap.
- Letting rounded clipping hide focus rings or text.
- Making radius do the work that contrast, label, or hierarchy should do.
- Preserving desktop shapes on mobile when they damage content width or reach.
- Using an expressive organic shape in a dense table or critical form.
- Treating a shape inventory as proof of a coherent shape language.
- Tuning corners while ignoring padding, alignment, content growth, and states.

## 7. Shape review checklist

- [ ] Each shape has a named role and interaction meaning.
- [ ] Radius and silhouette values come from a small semantic scale.
- [ ] Containers, controls, tags, sheets, dialogs, and decorative shapes are distinguishable.
- [ ] Real content grows without clipping or awkward empty space.
- [ ] Hit areas, focus rings, borders, fills, and selected/pressed states remain clear.
- [ ] Desktop and mobile transformations preserve role and task.
- [ ] Dashboard shapes support grouping without turning every metric into a visual island.
- [ ] Prototype shape choices answer a stated affordance or brand hypothesis.
- [ ] Shape does not carry essential meaning alone.
- [ ] Localization, zoom, large text, high contrast, and reduced motion were considered.

## 8. Source map

Sources checked on **2026-09-04**:

| Source | Used for | Link |
| --- | --- | --- |
| Material 3 in Compose | Shape scale, role-based shapes, component theming, and shape as emphasis/attention | [Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3) |
| Atlassian Design — Radius | Radius tokens, consistency, and role-based roundedness | [Atlassian Radius](https://atlassian.design/foundations/radius/) |
| Atlassian Design — Border | Borders, emphasis, and component separation | [Atlassian Border](https://atlassian.design/foundations/border/) |
| Apple Human Interface Guidelines — Materials | Surfaces, depth, environmental context, and restrained material treatment | [Apple Materials](https://developer.apple.com/design/human-interface-guidelines/materials) |
| Vercel Geist — Materials | Layering, surface hierarchy, and using the lowest effective visual treatment | [Geist Materials](https://vercel.com/geist/materials) |

Fidexa rule: make shape recognizable, role-appropriate, and generous to real content.
