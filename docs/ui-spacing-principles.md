# Fidexa Spacing Principles

**Spacing handbook for Fidexa studio, product, dashboard, and prototype work**

**Last researched:** 2026-09-04

## How to use this handbook

Spacing is the invisible structure that explains relationships. It separates concepts, groups controls, establishes rhythm, sets density, gives touch room, and lets a design breathe. Good spacing is not “more whitespace”; it is the right amount of space for the relationship and task.

Use this with the [Fidexa Layout and Grid Principles](./ui-layout-grid-principles.md), [Fidexa Typography Principles](./ui-typography-principles.md), [Fidexa Color Principles](./ui-color-principles.md), and the [UI/UX Review Checklist](./ui-ux-design-review-checklist.md).

## 1. Spacing doctrine

### Space communicates relationship

Elements that are close read as related; elements with a larger gap read as separate. Spacing is therefore semantic, not leftover room after components are placed.

- **Do:** Put related content closer than unrelated sections.
- **Do:** Keep labels, fields, values, and actions close enough to read as one unit.
- **Avoid:** Equal gaps everywhere when the relationships are unequal.
- **Review question:** What relationship does this gap explain?

### Use rhythm, not randomness

A small spacing scale makes interfaces feel intentional and allows components to compose without visual noise.

- **Do:** Use named tokens for component padding, internal gaps, section gaps, and page gutters.
- **Do:** Allow content and density modes to use the same underlying rhythm.
- **Avoid:** Local values chosen by nudging until a screenshot looks aligned.

### Density is a product decision

Dense interfaces help experienced users compare and operate quickly; spacious interfaces help people orient and read. Neither is inherently better.

- **Do:** Choose density based on task frequency, risk, content volume, input mode, and viewport.
- **Do:** Offer a sensible compact or comfortable mode when the product has sustained operational use.
- **Avoid:** Compressing everything to fit more on screen or adding whitespace only to make a screenshot feel expensive.

## 2. Build a spacing scale

Atlassian uses an 8-pixel base and a limited token scale; Carbon also treats spacing as a system of reusable values. The exact base is less important than consistency, semantic naming, and a clear reason for exceptions.

### Provisional Fidexa scale

Use as a starting recipe:

| Token | Value | Starting use |
| --- | ---: | --- |
| space.0 | 0 | Intentional adjacency |
| space.1 | 4px | Tiny icon/text or optical correction |
| space.2 | 8px | Compact internal gap, small control padding |
| space.3 | 12px | Related control/content gap |
| space.4 | 16px | Default component padding and body group gap |
| space.5 | 24px | Card or subsection separation |
| space.6 | 32px | Section gap or larger container padding |
| space.7 | 48px | Major section separation |
| space.8 | 64px | Page rhythm or hero separation |
| space.9 | 80px+ | Editorial or major page transition |

The values are provisional. Preserve the token roles even if the values change.

### Nested spacing

Use smaller values inside a component and larger values between components. A card’s internal gaps should not accidentally equal the page’s section gap.

- **Do:** Define layers: glyph-to-label, field-to-field, component-to-component, section-to-section, page-to-page.
- **Avoid:** Applying one global gap to every level of the hierarchy.

## 3. Spacing in UI components

### Component anatomy

- Keep icon and label close enough to read as one action.
- Keep a field label visually associated with its input and error.
- Give a button enough horizontal and vertical padding for legibility and touch.
- Keep helper text and validation close to the field they qualify.
- Separate a card’s content from its actions, but do not let the action float as if unrelated.

### Layout and grids

- Use page gutters, container padding, column gaps, and row gaps as separate roles.
- Let content grow; do not preserve spacing by clipping text.
- Use negative space to reveal grouping, not as a substitute for a layout model.
- Avoid margin collapse or nested padding that creates unpredictable rhythm.

### Tables and dashboards

- Use row height that supports scanning, focus, touch, and text enlargement.
- Make related values close and unrelated metric groups separated.
- Keep units, freshness, scope, and definitions near the values they qualify.
- Avoid shrinking row height until descenders, focus rings, or error messages collide.

## 4. Desktop, mobile, and responsive spacing

### Desktop

- Use extra space for comparison, context, definitions, and recovery.
- Keep a bounded reading field even when the viewport grows.
- Allow panes and inspectors to breathe without pushing the primary task out of view.
- Avoid stretching every card and gap to fill the window.

### Mobile

- Respect safe areas, thumb reach, keyboard changes, and touch-target separation.
- Increase separation when neighboring actions could be mis-tapped.
- Stack related metadata when a row would become cramped.
- Preserve the primary action and keep the path vertically scannable.

### Responsive transformation

Spacing may scale or transform, but relationships must remain stable.

- **Do:** Reduce decorative gaps before reducing touch or readable content space.
- **Do:** Define how page gutters, card padding, grid gaps, and row density change at breakpoints.
- **Avoid:** Using the desktop spacing scale unchanged when it produces either cramped mobile controls or huge empty bands.

## 5. Accessibility, motion, and user settings

- **Requirement:** Text spacing overrides must not remove content or functionality. WCAG 2.2 specifies increased line height, paragraph spacing, letter spacing, and word spacing as a meaningful resilience test.
- **Requirement:** Text enlargement and zoom must not cause overlap, clipping, or inaccessible controls.
- Maintain visible focus separation; do not let focus rings collide with neighboring controls.
- Make motion respect reduced-motion preferences and never use a spacing animation as the only status signal.
- Test localization, long labels, error messages, large text, and right-to-left layouts.

## 6. Mistakes to always avoid

- Using spacing as decoration instead of relationship.
- Choosing a new arbitrary value for every component.
- Equal spacing between every item when groups have different meanings.
- Making an entire page spacious while its controls remain cramped.
- Compressing dashboard rows until values and labels lose context.
- Letting nested padding create accidental double gaps.
- Fixing wrapping by reducing type or removing content.
- Ignoring touch-target separation and keyboard focus clearance.
- Treating mobile as desktop with every gap divided by two.
- Hiding overflow or using negative margins without a bounded reason.

## 7. Spacing review checklist

- [ ] Every major gap has a relationship or rhythm reason.
- [ ] Components use named spacing tokens rather than unexplained local values.
- [ ] Internal, between-component, section, and page spacing are distinct roles.
- [ ] Density matches frequency, risk, content volume, and input mode.
- [ ] Labels, fields, values, errors, actions, and icons are grouped correctly.
- [ ] Dashboard spacing supports scan, comparison, scope, and freshness.
- [ ] Desktop uses extra space for useful context rather than stretched emptiness.
- [ ] Mobile preserves reachability, safe areas, keyboard visibility, and separation.
- [ ] Text growth, text spacing overrides, localization, RTL, and focus rings remain usable.
- [ ] The rendered result was reviewed at every in-scope target.

## 8. Source map

Sources checked on **2026-09-04**:

| Source | Used for | Link |
| --- | --- | --- |
| Atlassian Design — Spacing | Base unit, limited scale, semantic tokens, density ranges, and responsive foundation | [Atlassian Spacing](https://atlassian.design/foundations/spacing/) |
| IBM Carbon — Spacing | Spacing tokens, productive layout rhythm, and component relationships | [Carbon Spacing](https://carbondesignsystem.com/elements/spacing/overview/) |
| Atlassian Design — Grid | Grid/layout primitives and spacing relationships | [Atlassian Grid](https://atlassian.design/foundations/grid/) |
| Apple Human Interface Guidelines — Layout | Device-aware layout, readable organization, and platform context | [Apple Layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| Material 3 in Compose | Theming and component systems where spacing composes with type, color, and shape | [Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3) |
| W3C WAI — Text Spacing | User-controlled line, paragraph, letter, and word spacing resilience | [WCAG Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) |

Fidexa rule: use space to explain what belongs together, what deserves attention, and where a person can safely act.
