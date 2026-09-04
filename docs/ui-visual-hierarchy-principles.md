# Fidexa Visual Hierarchy Principles

**Visual hierarchy handbook for Fidexa studio, product, dashboard, and prototype work**

**Last researched:** 2026-09-04

## How to use this handbook

Visual hierarchy is the attention path through an interface. It answers: where do I start, what is related, what changed, what can I do, and what can wait? Hierarchy is created by size, position, spacing, contrast, color, shape, motion, imagery, and interaction state working together.

Use this with the [Fidexa UI/UX Design Principles](./ui-ux-design-principles.md), [Fidexa Layout and Grid Principles](./ui-layout-grid-principles.md), [Fidexa Typography Principles](./ui-typography-principles.md), [Fidexa Color Principles](./ui-color-principles.md), and the [UI/UX Review Checklist](./ui-ux-design-review-checklist.md).

## 1. Hierarchy doctrine

### Make the first useful thing obvious

The first visual signal should help the user orient or act, not compete for admiration.

- **Do:** Define the primary question, decision, action, and current scope before styling.
- **Do:** Make the first useful content visible at the expected viewport and state.
- **Avoid:** Multiple equal heroes, competing primary buttons, or decorative treatments that outrank the task.
- **Review question:** What should a first-time user notice in three seconds, and is it actually first?

### Hierarchy follows importance, not component type

A card is not automatically important because it is a card. A heading is not automatically important because it is large. Visual weight should track user consequence, frequency, urgency, and sequence.

- **Do:** Rank elements by task importance, risk, frequency, and context.
- **Avoid:** Giving every module the same border, background, shadow, label weight, and color.

### Quiet is a hierarchy level

Supporting text, whitespace, neutral surfaces, and low-emphasis controls create room for the important signal to work. A page where everything shouts has no hierarchy.

- **Do:** Establish a calm base and reserve strong emphasis for a few moments.
- **Avoid:** Saturating every card, using all-caps labels everywhere, or making every metric visually dominant.

## 2. The hierarchy toolkit

| Signal | Strong use | Common failure |
| --- | --- | --- |
| Position | Start point, sequence, relation, current scope | Important content pushed below decoration |
| Size | Level, scale, primary value | Everything enlarged until scale loses meaning |
| Weight | Emphasis, selection, action | Everything bold |
| Contrast | Salience, focus, state | Low contrast hides content or high contrast creates noise |
| Color | Brand, action, status, selection | Color used without semantic meaning |
| Spacing | Grouping, separation, pace | Equal spacing implies false equality |
| Alignment | Shared relationship, scan path | Centered or inconsistent axes |
| Shape and depth | Container, state, plane, affordance | Decoration mistaken for interaction |
| Motion | Change, continuity, feedback | Motion steals attention or hides status |
| Imagery | Evidence, emotion, orientation | Stock decoration outranks product proof |

Use no more signals than the meaning requires. Strong hierarchy is coordinated, not maximal.

## 3. Reading paths

### Design for scanning and reading

Users scan before they commit to reading. Headings, labels, values, controls, whitespace, and media should make the intended path discoverable.

- **Do:** Arrange content in a predictable sequence: orientation, primary content, decision, action, detail, recovery.
- **Do:** Use headings, grouping, and short explanatory text to expose structure.
- **Avoid:** Relying on visual novelty, diagonal layout, or hidden hover states to teach the path.

### Preserve hierarchy across states

Loading, empty, error, permission, selected, disabled, and success states should retain the same conceptual hierarchy.

- **Do:** Keep the state title, affected scope, explanation, and next action associated.
- **Do:** Make current selection and completion unmistakable.
- **Avoid:** Replacing the primary content with a spinner that provides no orientation or recovery.

### Preserve hierarchy across devices

Responsive design may transform the composition, but it must not silently change what matters.

- **Do:** Define invariant priority and intentionally reorder or collapse secondary content.
- **Avoid:** Letting a mobile menu, sticky footer, banner, or keyboard cover the primary task.

## 4. UI, UX, dashboards, and prototypes

### Product UI

- Give each screen one primary job and one dominant action when possible.
- Make navigation, scope, status, and completion visible.
- Use progressive disclosure for secondary detail; do not hide essential context.
- Make focus, selection, error, and destructive states visually distinct.

### Dashboards

- Build a reading path from summary to diagnosis to action/detail.
- Use type and position to establish metric importance before color.
- Keep scope, units, comparison, and freshness next to the value.
- Highlight exceptions or decisions, not every data point.
- On mobile, prioritize and stack; do not preserve equal visual weight for every tile.

### Prototypes

- Prototype the hierarchy that the hypothesis depends on, not just the surface styling.
- Use realistic content and enough surrounding context to test the reading path.
- Ask users to find, compare, decide, or recover; do not only ask whether the screen looks good.
- Avoid polishing secondary detail before the first useful signal has been validated.

## 5. Accessibility and hierarchy

- Do not make color, size, weight, position, or motion the only way to understand meaning.
- Keep semantic headings and programmatic order aligned with visual order.
- Make keyboard focus visible and stronger than ordinary decoration.
- Ensure hierarchy remains understandable at larger text sizes, zoom, reduced motion, high contrast, and grayscale.
- Test contrast for text and meaningful controls against their actual surfaces.
- Do not let truncation remove the word that explains the action, value, or status.

## 6. Mistakes to always avoid

- Designing by visual loudness instead of user importance.
- Giving every section a hero treatment.
- Using the primary color for every interactive element.
- Treating card borders and shadows as hierarchy by default.
- Making a dashboard’s decorative header larger than its decision-making content.
- Using motion as the only indication that something changed.
- Hiding the active scope, selected state, or completion signal in a subtle color shift.
- Reordering mobile content without preserving the task sequence.
- Using tiny muted text for the only explanation or recovery path.
- Approving hierarchy from a static screenshot without testing the real task.

## 7. Visual hierarchy review checklist

- [ ] The screen’s primary job, first useful signal, and primary action are named.
- [ ] Visual weight follows user importance, consequence, frequency, and sequence.
- [ ] The reading path is discoverable through position, headings, grouping, and spacing.
- [ ] Quiet surfaces and low-emphasis elements create room for priority.
- [ ] State changes retain orientation, scope, explanation, and next action.
- [ ] Desktop and mobile preserve priority while transforming secondary content intentionally.
- [ ] Dashboard hierarchy moves summary → diagnosis → action/detail.
- [ ] Prototype tasks test finding, comparing, deciding, and recovering.
- [ ] Meaning survives without color, size, weight, position, hover, or motion alone.
- [ ] Hierarchy remains usable at zoom, larger text, grayscale, high contrast, and reduced motion.

## 8. Source map

Sources checked on **2026-09-04**:

| Source | Used for | Link |
| --- | --- | --- |
| Apple Human Interface Guidelines — Typography | Weight, size, color, and text-style hierarchy; preserving hierarchy as text scales | [Apple Typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| Material 3 in Compose | Emphasis through color roles, on-color pairings, weight, component prominence, and state | [Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3) |
| Atlassian Design — Typography | Readability, visual harmony, hierarchy, and spacing working together | [Atlassian Typography](https://atlassian.design/foundations/typography/) |
| Vercel Geist — Colors and Materials | Layered emphasis, component states, high-contrast roles, and restrained depth | [Geist Colors](https://vercel.com/geist/colors), [Geist Materials](https://vercel.com/geist/materials) |
| Linear Method | Purpose, clarity, speed, craft, and reduction of product noise | [Linear Method](https://linear.app/method/introduction) |
| W3C WAI — Meaningful Sequence | Maintaining the intended order when presentation changes | [WCAG Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html) |

Fidexa rule: hierarchy is successful when a person notices the right thing, understands why it matters, and knows what to do next.
