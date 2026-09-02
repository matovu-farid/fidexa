# Fidexa Responsive Target Sizes

## Decision

The Fidexa and Rishi design work should be judged primarily on the devices people are expected to use, rather than on the smallest viewport available. The Penpot system now treats these as the primary responsive targets:

- iPhone: `393×852`
- iPad portrait: `834×1194`
- iPad landscape: `1194×834`
- MacBook: `1512×982`

`390×844` remains a narrow overflow and clipping regression guard. It is not the target artboard for visual direction.

## Penpot changes

- Updated `Patterns / Responsive & Handoff` with explicit MacBook, iPad, and iPhone specimens.
- Added breakpoint tokens to `Fidexa Primitives` for the four target dimensions.
- Renamed the Rishi and Fidexa responsive review sections to identify the iPhone target and resized their phone boards to `393×852`.
- Added the full target matrix to both product-site responsive review sections.

## Review contract

Review each surface at 100% in the in-app browser and export representative Penpot captures. Check:

1. MacBook first-fold hierarchy and full-bleed hero behavior.
2. iPad portrait and landscape column transitions.
3. iPhone stacking, heading wrapping, media crops, and touch-target spacing.
4. `390×844` overflow only after the primary device reviews pass.

Any clipping, unreadable wrapping, unexpected horizontal scroll, or media crop failure is a required fix before approval.
