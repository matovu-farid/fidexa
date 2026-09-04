# Fidexa Consistency Principles

**Consistency handbook for Fidexa studio, product, dashboard, and prototype work**

**Last researched:** 2026-09-04

## How to use this handbook

Consistency lowers the amount people must learn. It makes patterns predictable, lets users transfer knowledge from one screen to another, and gives a product a recognizable voice. Consistency does not mean every screen is identical; it means differences are intentional, legible, and justified by context.

Use this with the [Fidexa UI/UX Design Principles](./ui-ux-design-principles.md), [Fidexa Visual Hierarchy Principles](./ui-visual-hierarchy-principles.md), [Fidexa Typography Principles](./ui-typography-principles.md), [Fidexa Color Principles](./ui-color-principles.md), and the [UI/UX Review Checklist](./ui-ux-design-review-checklist.md).

## 1. Consistency doctrine

### Make familiar actions feel familiar

Controls that look alike should behave alike. Labels that describe the same concept should use the same words. A successful pattern should transfer across routes, devices, and states.

- **Do:** Reuse components, tokens, interaction patterns, terminology, and state behavior.
- **Do:** Keep placement and naming stable for high-frequency actions.
- **Avoid:** Rebuilding a familiar control because a custom version looks more distinctive.
- **Review question:** What can a user learn once and reuse here?

### Internal and external consistency

Internal consistency is coherence within the product. External consistency is alignment with platform conventions and patterns users already know.

- **Do:** Preserve strong platform conventions for navigation, text input, focus, selection, escape/back, and system feedback.
- **Do:** Establish a Fidexa voice where the platform leaves room for expression.
- **Avoid:** Breaking a convention only to be different.
- **Avoid:** Copying a convention that conflicts with the product’s task or platform.

### Consistency is semantic, not merely visual

Matching color, radius, or spacing does not make a pattern consistent if the content, behavior, state, or accessibility name differs.

- **Do:** Review appearance, language, behavior, timing, state, data meaning, keyboard path, and responsive transformation together.
- **Avoid:** Calling a pattern reusable because two screenshots look similar.

## 2. Define the system

### Tokens before components

Use shared tokens for color, typography, spacing, shape, elevation, motion, and breakpoint behavior. Components consume roles; they should not invent local values.

- **Do:** Name tokens by intent and document their supported states and themes.
- **Do:** Keep primitives separate from semantic roles.
- **Avoid:** Duplicating near-identical values because a local screenshot looked slightly better.

### Components with explicit contracts

Every shared component should document anatomy, content, variants, states, responsive behavior, accessibility name, and when not to use it.

- **Do:** Define default, hover, focus, pressed, selected, disabled, loading, success, empty, error, permission, and destructive states as relevant.
- **Do:** Make variant differences intentional and visible in the API and design file.
- **Avoid:** Boolean-prop sprawl or undocumented exceptions that create a second unofficial component.

### Content and terminology

Consistency in words is part of product quality.

- **Do:** Maintain a vocabulary for objects, actions, statuses, roles, filters, and time ranges.
- **Do:** Use the same grammatical form and level of specificity for similar actions.
- **Avoid:** Calling the same object “project,” “workspace,” and “account” depending on the screen.
- **Avoid:** Renaming a familiar action to sound clever.

## 3. Controlled variation

Consistency should not flatten hierarchy, context, or platform adaptation.

- **Do:** Allow a display voice in marketing and a denser type treatment in operational views when their jobs differ.
- **Do:** Allow mobile layouts to transform while preserving semantics and priority.
- **Do:** Use color, shape, motion, or composition to distinguish real states and roles.
- **Avoid:** Making unrelated things identical to satisfy a component inventory.
- **Avoid:** Copying the desktop layout to mobile or the marketing style into high-frequency product UI.

### Exceptions need a reason

Record exceptions in the component or review record: the user problem, the difference, the expected benefit, and the scope.

- **Do:** Make intentional exceptions teachable.
- **Avoid:** Letting one-off decisions become precedent by accident.

## 4. Consistency across surfaces

### Desktop and mobile

- Keep terminology, action semantics, status meaning, focus behavior, and recovery consistent.
- Let layout, density, and navigation transform for reach and viewport.
- Do not move a primary action without preserving a clear equivalent.

### Dashboards

- Keep metric definitions, number formatting, units, freshness, filters, chart conventions, and states consistent.
- Use a shared visual language for positive, negative, warning, stale, and unavailable states.
- Avoid giving each chart a custom legend, scale, or interaction model.

### Prototypes

- Prototype shared patterns where reuse or learning transfer is part of the hypothesis.
- Use the same copy, spacing, type, state, and interaction conventions as the intended product when testing comprehension.
- Avoid creating a beautiful isolated prototype that teaches a behavior the product will not support.

## 5. Accessibility and consistency

- Use semantic HTML and accessible names consistently, not only visual styling.
- Keep keyboard order, focus visibility, touch behavior, and screen-reader announcements predictable.
- Preserve meaning without color alone; use the same non-color cue across equivalent states.
- Ensure text scaling, zoom, reflow, reduced motion, RTL, and localization behavior are consistent with the system.
- Make exceptions equally accessible; a custom component does not receive a reduced standard.

## 6. Mistakes to always avoid

- Reusing visual style but changing behavior or terminology.
- Creating near-duplicate buttons, cards, inputs, or alerts with different hidden rules.
- Treating a component library as proof of consistency without testing rendered states.
- Breaking platform conventions for novelty.
- Using the same density, layout, or navigation on every device.
- Allowing raw colors, font sizes, spacing, radii, or motion values inside components.
- Letting one temporary exception become a new default.
- Using different meanings for the same color, icon, label, or gesture.
- Testing only the happy path and calling the system consistent.
- Hiding variations from engineering, QA, localization, or accessibility documentation.

## 7. Consistency review checklist

- [ ] Equivalent actions, objects, statuses, and controls use stable language.
- [ ] Shared tokens cover color, type, spacing, shape, elevation, motion, and responsive behavior.
- [ ] Components document anatomy, variants, states, accessibility, and non-use cases.
- [ ] Internal consistency and platform consistency were both considered.
- [ ] Exceptions have a named reason, scope, owner, and review condition.
- [ ] Desktop/mobile transformations preserve meaning, priority, and recovery.
- [ ] Dashboard metrics, units, freshness, filters, chart conventions, and states are consistent.
- [ ] Prototype behavior does not teach patterns the product will not support.
- [ ] Keyboard, focus, screen-reader, touch, zoom, text-size, reduced-motion, RTL, and localization behavior are predictable.
- [ ] A rendered cross-screen and cross-state comparison was performed.

## 8. Source map

Sources checked on **2026-09-04**:

| Source | Used for | Link |
| --- | --- | --- |
| Apple Human Interface Guidelines — Foundations | Platform conventions, consistency, system behavior, and user expectations | [Apple HIG Foundations](https://developer.apple.com/design/human-interface-guidelines) |
| Material 3 in Compose | Shared color, typography, shape, component, and state theming | [Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3) |
| Atlassian Design — Foundations | Design tokens, shared foundations, typography, spacing, color, borders, and radius | [Atlassian Foundations](https://atlassian.design/foundations/) |
| IBM Carbon — Overview | Systematic components, tokens, productive patterns, and themes | [Carbon Design System](https://carbondesignsystem.com/) |
| Vercel Geist — Introduction | Modern system primitives and reusable product conventions | [Geist Introduction](https://vercel.com/geist/introduction) |
| Nielsen Norman Group — Consistency and Standards heuristic | Recognizability and predictable conventions as usability principles | [Consistency and Standards](https://www.nngroup.com/articles/ten-usability-heuristics/) |

Fidexa rule: make the right pattern easy to recognize, reuse, and trust—then make exceptions explainable.
