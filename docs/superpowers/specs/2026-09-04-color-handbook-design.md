# Fidexa Color and Modern UI Handbook Design

**Date:** 2026-09-04
**Status:** Proposed for implementation

## Goal

Create a practical, research-backed color handbook that helps Fidexa produce modern, expressive interfaces without color noise, accessibility regressions, or arbitrary palette decisions.

The handbook will complement the existing [UI/UX Design Principles](../../ui-ux-design-principles.md) handbook. It will focus on color as a system for hierarchy, meaning, personality, depth, interaction, and data communication—not on choosing attractive swatches in isolation.

## User intent and design decision

The user wants modern UI that is not boring. “Not boring” is defined as distinctive visual personality, intentional contrast, and memorable accent moments, not maximal saturation or decoration. The handbook will therefore recommend a calm neutral foundation plus a controlled expressive system that earns attention through purpose.

It will include a **draft Fidexa starter palette** derived from the current production CSS and approved logo direction. Draft values will be labeled as provisional: they provide a usable starting point for design work, but do not silently replace the existing design-system source of truth or constitute final brand approval.

## Research basis

The handbook will synthesize these direct sources, checked on 2026-09-04:

- Apple Human Interface Guidelines — [Color](https://developer.apple.com/design/human-interface-guidelines/color): communication, brand personality, continuity, status, dynamic/system colors, inclusive alternatives, light/dark/increased-contrast contexts, lighting, translucency, and restrained emphasis.
- Google Material 3 — [Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3): key colors, tonal palettes, primary/secondary/tertiary expression, dynamic color, on-color pairs, emphasis, themes, and tonal elevation.
- Atlassian Design — [Color](https://atlassian.design/foundations/color): neutral and saturated colors, semantic roles, emphasis levels, interaction states, tokens, themes, and accessible inverse colors.
- IBM Carbon — [Color](https://carbondesignsystem.com/elements/color/overview/): neutral-dominant surfaces, purposeful primary color, layer models, theme values, role-based tokens, and light/dark behavior.
- Vercel Geist — [Colors](https://vercel.com/geist/colors) and [Materials](https://vercel.com/geist/materials): background/component/border/text roles, default/hover/active states, high-contrast surfaces, alpha/P3 scales, and restrained elevation.
- Radix — [Colors](https://www.radix-ui.com/colors): purpose-built scales, accessible text, alpha variants, dark mode, APCA, and P3 support.
- shadcn/ui — [Theming](https://ui.shadcn.com/docs/theming): semantic CSS variables, foreground/background pairs, component roles, chart tokens, and theme overrides.
- W3C WAI — [Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), and [Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html): testable contrast thresholds and non-color alternatives.
- Linear — [Principles & Practices](https://linear.app/method/introduction) and [product surface](https://linear.app/): purpose-built design, clarity, speed, craft, and noise reduction as an industry reference for modern product UI.
- Tableau Blueprint — [Visual Best Practices](https://help.tableau.com/current/blueprint/en-us/bp_visual_best_practices.htm): neutral-first dashboard palettes, semantic color types, consistency, context, and accessible data communication.

## Handbook architecture

Create `docs/ui-color-principles.md` with these sections:

1. **The Fidexa color doctrine** — a short, opinionated definition of modern expression: quiet base, distinctive accents, clear hierarchy, meaningful states, and no visual noise.
2. **Color roles and semantic tokens** — background, surface, elevated surface, foreground, muted content, primary action, secondary action, accent, focus, success, warning, danger, information, border, overlay, and chart roles. Explain why roles are preferable to raw hex values.
3. **Palette construction** — neutral ramps, brand ramps, accent ramps, tonal steps, light/dark pairs, `on-*` foreground pairs, and how to choose values for text, borders, components, and overlays.
4. **How to make UI expressive without making it loud** — accent budgeting, focal moments, high-contrast moments, color + typography + shape combinations, brand personality, gradients, translucency, and imagery.
5. **Surface, depth, and layering** — tonal elevation, alpha, borders, shadows, and when not to stack effects.
6. **Themes and environments** — light mode, dark mode, increased contrast, system preferences, color profiles, real-world lighting, colorful backgrounds, and P3/sRGB considerations.
7. **Component and interaction states** — default, hover, pressed, selected, focus-visible, disabled, loading, success, warning, danger, empty, stale, and error. Include state-token recipes and warnings against overloaded colors.
8. **Accessibility and inclusive color** — WCAG 2.2 ratios, non-color cues, color-vision differences, gradients, focus indicators, links, charts, and test requirements.
9. **Dashboards and data visualization** — neutral-first composition, categorical/sequential/diverging/highlight/alert palettes, labels, legends, tables, thresholds, and color consistency.
10. **Draft Fidexa starter palette** — current CSS and logo colors mapped to draft primitive and semantic roles, with contrast notes, theme gaps, and explicit “provisional” status.
11. **Mistakes to always avoid** — rainbow UI, arbitrary hex values, one color with multiple meanings, color-only status, low-contrast text, overuse of gradients/glass, saturated backgrounds behind controls, and every-card-is-a-color layouts.
12. **Color review checklist** — concise do/don’t and evidence gates for design reviews.
13. **Source map** — direct links and the claim area each source supports.

Each major principle will use the same working format as the existing UI/UX handbook: **Meaning**, **Do**, **Avoid**, and **Review question**. Recipes will include a small “why it works” note and a failure mode so the handbook teaches judgment rather than prescribing a single aesthetic.

## Draft Fidexa palette scope

Use the current implementation and logo spec as inputs only:

| Draft primitive | Current value | Intended role | Status |
| --- | --- | --- | --- |
| Ink | `#101828` | Primary dark surface, primary text, high-emphasis action | Existing production value; draft semantic mapping |
| Paper | `#FCF9F0` | Warm light surface and reversed text | Existing production value; draft semantic mapping |
| Cloud | `#F7F2E8` | Page/background neutral | Existing production value; draft semantic mapping |
| Violet | `#7C5CFC` | Brand accent, focus, selected emphasis | Existing logo/design-system value; draft semantic mapping |
| Mint | `#37D6C0` | Expressive secondary accent, positive/selected emphasis | Existing logo/design-system value; draft semantic mapping |
| Muted ink | `#667085` | Secondary text | Existing production value; must be contrast-tested by context |
| Sand | `#ECE2C7` | Warm secondary surface | Existing production value; draft semantic mapping |

The handbook will not invent a final palette from these values alone. It will document where they are safe, where they require a darker/lighter tonal partner, and which semantic roles still need explicit success/warning/danger/information values.

## Integration

Modify the existing documentation only after the new handbook is written:

- Add a color-handbook link and a short cross-reference to the UI section of `docs/ui-ux-design-principles.md`.
- Add color-specific review gates to `docs/ui-ux-design-review-checklist.md`, including token usage, contrast, non-color cues, state semantics, theme coverage, dashboard palette, and expressive-accent restraint.
- Add the color handbook to the pre-edit and browser-review gates in `docs/penpot-design-process.md`.
- Do not modify `src/app/globals.css`, Penpot files, or the current design-system values in this documentation task. Production token changes require a separate approved implementation task.

## Verification and acceptance

The handbook is complete when:

- It has the 13 sections above and direct source links.
- It distinguishes approved principles from provisional Fidexa palette values.
- Every color recommendation has an actionable do, avoid, and review question.
- It documents light, dark, increased-contrast, component-state, dashboard, and accessibility behavior.
- The existing UI/UX handbook and review checklist link to it without duplicating the full content.
- All local Markdown links and fragments resolve.
- `git diff --check` passes.
- Only the new handbook, the existing UI/UX handbook, the review checklist, the Penpot process, and this spec are touched; no product code or design files change.

## Non-goals

- Choosing a final new Fidexa brand palette.
- Replacing the current production CSS tokens.
- Creating Penpot color swatches or changing the Penpot design-system page.
- Giving universal color-psychology rules detached from context, culture, accessibility, or product meaning.
- Treating trends, gradients, glass, or saturation as substitutes for hierarchy and product purpose.
