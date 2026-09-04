# Fidexa Contrast Principles

**Contrast handbook for Fidexa studio, product, dashboard, and prototype work**

**Last researched:** 2026-09-04

## How to use this handbook

Contrast is difference that makes meaning perceivable. It includes lightness and color, but also size, weight, spacing, shape, texture, motion, position, and sound. Great contrast creates hierarchy without noise; poor contrast hides content or makes everything compete.

Use this with the [Fidexa Color Principles](./ui-color-principles.md), [Fidexa Typography Principles](./ui-typography-principles.md), [Fidexa Visual Hierarchy Principles](./ui-visual-hierarchy-principles.md), and the [UI/UX Review Checklist](./ui-ux-design-review-checklist.md).

## 1. Contrast doctrine

### Make differences intentional

Contrast should answer a question: what is primary, what is selected, what changed, what is disabled, what is interactive, or what is dangerous?

- **Do:** Give each contrast relationship a semantic reason.
- **Do:** Test the relationship in context, not as isolated swatches.
- **Avoid:** Adding stronger contrast simply because the composition feels flat.
- **Review question:** What meaning does this difference carry?

### Accessibility is the floor, not the ceiling

WCAG thresholds establish a minimum for text and meaningful controls. Passing ratios do not automatically mean a thin font, a busy background, or a low-quality display feels readable.

- **Do:** Meet the applicable WCAG threshold, then evaluate weight, size, rendering, distance, glare, motion, and context.
- **Avoid:** Treating the contrast ratio as permission to use fragile type or noisy surfaces.

### Contrast is a budget

If everything has maximum contrast, nothing has priority. Use strong contrast for the task, active state, or real alert; use lower contrast for supporting material without hiding essential content.

- **Do:** Reserve the strongest differences for primary actions, current scope, key values, and real errors.
- **Avoid:** High-contrast borders around every card, saturated labels everywhere, or constant inverse sections.

## 2. Contrast dimensions

| Dimension | Useful for | Do not use alone for |
| --- | --- | --- |
| Lightness/color | Text, surfaces, status, selection | Meaning that must survive color-vision differences |
| Size | Page level, metric priority, display moments | A small control’s only affordance |
| Weight | Emphasis, selected state, hierarchy | Essential status without another cue |
| Spacing | Grouping and separation | Making a control discoverable when it has no other affordance |
| Shape/border | Container, focus, selected, interactive affordance | Decorative distinction with no role |
| Position/alignment | Reading order and comparison | A status that disappears when layout transforms |
| Motion | Change, continuity, feedback | The only way to know a state |
| Texture/pattern | Data series and categories | Dense content without a legend or explanation |

Combine dimensions intentionally. Never make essential meaning depend on one fragile signal.

## 3. Text and surface contrast

- Use strong text contrast for primary content and action labels.
- Test muted text against the actual surface, including dark mode and disabled states.
- Test text over images, gradients, translucency, shadows, and animation at the least favorable frame.
- Use robust weights for small or distant text; avoid light strokes on low-contrast surfaces.
- Do not use a shadow or glow as the primary readability strategy.
- Keep focus indicators distinct from both the component and the surrounding surface.

### WCAG reference thresholds

- Normal text: at least 4.5:1 for WCAG 2.2 AA.
- Large text: at least 3:1 for WCAG 2.2 AA.
- User-interface components and meaningful graphics: at least 3:1 where the applicable criterion covers them.
- Do not round 4.499:1 up to 4.5:1.

These are compliance thresholds, not a substitute for testing the chosen typeface and environment.

## 4. UI, dashboards, and prototypes

### Components and states

- Default, hover, focus, pressed, selected, disabled, loading, success, warning, and error must be distinguishable.
- Pair color with labels, icons, shapes, or position for status and selection.
- Make disabled text quieter without making it indistinguishable from missing or unavailable content.
- Keep focus visible even when a component already has a border or colored fill.

### Dashboards

- Use contrast to guide summary → diagnosis → action.
- Highlight exceptions, targets, and meaningful deltas rather than every series.
- Keep chart marks, labels, legends, axes, and selected states distinct.
- Preserve context for low-contrast or muted data; do not make uncertainty look like zero.
- Provide text/table alternatives for important analytical information.

### Prototypes

- Prototype contrast where the learning question concerns hierarchy, status, focus, or legibility.
- Use real content and realistic surfaces; a clean white prototype can hide failures.
- Test grayscale, color-vision variation, zoom, dark mode, and low-light/high-glare context where relevant.

## 5. Desktop and mobile

### Desktop

- Use scale, alignment, pane boundaries, and whitespace to support comparison before adding more color.
- Ensure focus and selection remain clear with pointer, keyboard, and window movement.
- Avoid a dashboard whose many panels all use strong borders and saturated headers.

### Mobile

- Increase separation between adjacent touch actions and make focus/pressed states obvious.
- Avoid relying on hover or tiny contrast changes.
- Test contrast under outdoor brightness, dim conditions, motion, and one-handed use.
- Keep essential labels and recovery instructions visible when text grows or the keyboard changes the viewport.

## 6. Mistakes to always avoid

- Using contrast as decoration instead of meaning.
- Passing a ratio check but using a thin font, tiny size, or busy background.
- Reducing contrast for “premium” muted text below a readable level.
- Using red/green, light/dark, or color alone to communicate status.
- Making focus only a subtle tint change.
- Applying one foreground color to every surface, gradient, and theme.
- Using high-contrast borders and shadows on every container.
- Making data values available only through hover.
- Testing only light mode and one display.
- Treating grayscale or reduced-color settings as someone else’s problem.

## 7. Contrast review checklist

- [ ] Every contrast relationship has a semantic purpose.
- [ ] Text meets the applicable WCAG contrast threshold at the actual size and weight.
- [ ] Meaningful controls, focus indicators, and graphics are distinguishable.
- [ ] Contrast survives dark mode, increased contrast, grayscale, color-vision differences, zoom, and text enlargement.
- [ ] Gradients, images, translucency, and motion were tested at the least favorable point.
- [ ] Focus, selected, pressed, disabled, loading, success, warning, and error states are distinct.
- [ ] Meaning does not rely on color, lightness, size, weight, hover, or motion alone.
- [ ] Dashboard highlights, chart marks, labels, and alternatives remain interpretable.
- [ ] Desktop and mobile tests include pointer, keyboard, touch, glare, and dim conditions where relevant.
- [ ] Contrast measurements and rendered evidence are recorded.

## 8. Source map

Sources checked on **2026-09-04**:

| Source | Used for | Link |
| --- | --- | --- |
| W3C WAI — Contrast Minimum | Text contrast thresholds and rationale | [WCAG Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) |
| W3C WAI — Non-text Contrast | User-interface components, focus indicators, and meaningful graphics | [WCAG Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) |
| W3C WAI — Use of Color | Avoiding color as the only means of conveying meaning | [WCAG Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) |
| Apple Human Interface Guidelines — Color | Contextual contrast, system colors, dark mode, increased contrast, and testing environments | [Apple Color](https://developer.apple.com/design/human-interface-guidelines/color) |
| Radix Colors | Purpose-built scales, accessible text colors, alpha colors, dark mode, APCA, and P3 | [Radix Colors](https://www.radix-ui.com/colors) |
| Vercel Geist — Colors | Semantic background, component, border, text, and high-contrast roles | [Geist Colors](https://vercel.com/geist/colors) |

Fidexa rule: contrast should make the right difference visible, not make every difference loud.
