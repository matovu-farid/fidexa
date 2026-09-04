# Typography Handbook Design

**Date:** 2026-09-04

**Status:** Approved by the request to research and create the handbook

## Intent

Create a standalone, opinionated typography authority for Fidexa UI, UX, prototypes, dashboards, desktop, mobile, and responsive work. The handbook must make typography actionable: designers and engineers should be able to choose typefaces, create a named scale, review real content, avoid recurring mistakes, and verify accessibility.

## Design

The handbook is organized as a practical reference rather than a history of typography:

1. Doctrine: legibility, hierarchy, restraint, personality, and content resilience.
2. Typeface selection: UI, display, mono, numeric, system, fallback, licensing, and language roles.
3. Named type scale: semantic tokens, a provisional Fidexa starter scale, and implementation guidance.
4. Hierarchy and rhythm: weight, case, tracking, headings, measure, line-height, spacing, and wrapping.
5. Component guidance: navigation, buttons, forms, metadata, tables, icons, and data.
6. Desktop, mobile, responsive, dashboard, and accessibility-specific rules.
7. Provisional Fidexa contract, recurring mistakes, review checklist, and source map.

Each major principle uses a meaning, do, avoid, and review-question pattern where useful. Normative rules, craft heuristics, provisional values, and Fidexa synthesis are labeled so they are not confused with platform or accessibility requirements.

## Research basis

Use current guidance from Apple Human Interface Guidelines, Material 3, Atlassian Design, IBM Carbon, Vercel Geist, and W3C WCAG 2.2. Treat these as the authoritative basis for interaction, scaling, typography tokens, hierarchy, and accessibility. Use Fidexa-specific rules as an opinionated synthesis that can evolve after rendered design review and product evidence.

## Integration

- Link the handbook from the typography section of `docs/ui-ux-design-principles.md`.
- Add typography-specific review gates to `docs/ui-ux-design-review-checklist.md`.
- Make the Penpot handoff require typography guidance for typeface, scale, wrapping, fallback, responsive, and dashboard decisions.
- Do not change product code, font files, Penpot pages, or final brand values as part of the handbook task.

## Acceptance criteria

- The handbook has explicit dos and don’ts and a recurring-mistakes section.
- Desktop, mobile, responsive, dashboard, prototype, and accessibility guidance are present.
- The starter scale is clearly provisional and uses semantic roles rather than arbitrary component values.
- WCAG thresholds and text-scaling/reflow requirements link to direct W3C sources.
- The source map records checked authorities and what each contributed.
- All local Markdown links resolve and the working tree preserves unrelated user changes.
