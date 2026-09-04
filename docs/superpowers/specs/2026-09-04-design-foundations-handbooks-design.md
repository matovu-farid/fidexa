# Design Foundations Handbooks

**Date:** 2026-09-04

**Status:** Approved by the request to research and create each remaining principle handbook

## Scope

The existing Fidexa library has handbooks for color and typography. This batch adds standalone, researched handbooks for the remaining areas named in the design-principles reference:

1. Layout and grid
2. Visual hierarchy
3. Spacing
4. Consistency
5. Contrast
6. Polish and details
7. Shape language
8. Imagery and icons

## Common handbook structure

Each handbook has:

- a short doctrine and operating guidance;
- principles with practical do/avoid/review guidance;
- component, desktop, mobile, dashboard, prototype, and accessibility implications where relevant;
- mistakes to always avoid;
- a review checklist;
- a source map with direct links to strong platform and industry authorities.

## Research basis

Use Apple Human Interface Guidelines, Material Design 3, Atlassian Design, IBM Carbon, Vercel Geist, Linear Method, Radix where relevant, and W3C WCAG 2.2. Treat Fidexa-specific recommendations as synthesis or provisional recipes, and keep accessibility requirements explicit.

## Files

- docs/ui-layout-grid-principles.md
- docs/ui-visual-hierarchy-principles.md
- docs/ui-spacing-principles.md
- docs/ui-consistency-principles.md
- docs/ui-contrast-principles.md
- docs/ui-polish-details-principles.md
- docs/ui-shape-language-principles.md
- docs/ui-imagery-icons-principles.md

Integrate all eight with the existing UI/UX handbook, review checklist, color and typography handbooks, and Penpot process. Do not change product code, font files, or Penpot pages.

## Acceptance criteria

- Every principle from the referenced list has a named standalone handbook.
- Every handbook includes principles, dos/don’ts, recurring mistakes, a review checklist, and a source map.
- The guidance is useful for product UI, responsive desktop/mobile design, dashboards, prototypes, and accessibility where applicable.
- Each handbook distinguishes platform/accessibility requirements from Fidexa synthesis and craft heuristics.
- Local Markdown links resolve, the intended files are committed on main, and unrelated user changes remain untouched.
