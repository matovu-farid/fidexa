# Fidexa UI/UX Design Review Checklist

Canonical reference: [Fidexa UI/UX Design Principles](./ui-ux-design-principles.md).

Use this during a live review. Check what is true in the rendered experience, record evidence, and call out risks plainly. Link back to the [foundations](./ui-ux-design-principles.md#1-foundations), [core principles](./ui-ux-design-principles.md#2-core-principles), and [Fidexa application rules](./ui-ux-design-principles.md#9-fidexa-application-rules) when a decision needs more context.

### Lens legend

- **[UI]** — visible and interactive presentation: visual craft, hierarchy, layout, spacing, alignment, typography, color, imagery, components, states, and device-specific presentation.
- **[UX]** — usefulness and relationship with the product: context, purpose, problem framing, evidence, flows, behavior, research, testing, agency, recovery, and outcomes.
- **[Shared]** — a concern where presentation and experience quality must be judged together, including dashboards, responsive behavior, accessibility, prototypes, states/errors, and final evidence.

### Reading map: Part I, Part II, and Shared review gates

The numbered sections 1–9 below are the canonical checklist. Part I, Part II, and Shared are review-gate navigation lenses over those sections, not additional checklist sections; UI and UX remain separate review dimensions handled together in one context.

#### Part I — UI review gates (navigation lens)

- [Screen and component quality](#3-screen-and-component-quality)
- [Desktop](#4-desktop)
- [Mobile and responsive](#5-mobile-and-responsive)

#### Part II — UX review gates (navigation lens)

- [Problem and evidence](#1-problem-and-evidence)
- [Flow and information architecture](#2-flow-and-information-architecture)
- [Prototype](#8-prototype)

#### Shared review gates (navigation lens)

- [Desktop](#4-desktop)
- [Mobile and responsive](#5-mobile-and-responsive)
- [Dashboard](#6-dashboard)
- [Accessibility](#7-accessibility)
- [Prototype](#8-prototype)
- [Final evidence](#9-final-evidence)

The unnumbered [Verdicts](#verdicts), [Evidence policy](#evidence-policy), and [Review record](#review-record) support every numbered section; they are included here as shared review infrastructure.

This is one combined checklist because UI and UX are different lenses, but they must be reviewed together to verify both presentation and the resulting experience.

### Foundation handbooks

Use the focused handbooks alongside this combined gate:

- [Layout and Grid](./ui-layout-grid-principles.md)
- [Visual Hierarchy](./ui-visual-hierarchy-principles.md)
- [Spacing](./ui-spacing-principles.md)
- [Color](./ui-color-principles.md)
- [Typography](./ui-typography-principles.md)
- [Consistency](./ui-consistency-principles.md)
- [Contrast](./ui-contrast-principles.md)
- [Polish and Details](./ui-polish-details-principles.md)
- [Shape Language](./ui-shape-language-principles.md)
- [Imagery and Icons](./ui-imagery-icons-principles.md)

## Verdicts

**Lens: [Shared]**

- **PASS** — The reviewed scope supports the intended task at the tested size and state; evidence and risks are recorded.
- **NEEDS WORK** — The core task can still be reviewed, but a non-blocking clarity, craft, consistency, or polish issue remains.
- **FAIL** — A blocking defect prevents safe, truthful, accessible, or reliable use, or the required evidence is missing.

**Automatic fail gate:** Any material accessibility, task-completion, data-truthfulness, clipping/overflow, or missing-state defect is a **FAIL** until fixed or explicitly re-scoped with an approved exception.

### Evidence policy

**Lens: [Shared]**

Minimum evidence is practical, rendered, and tied to the review type:

| Review type | Minimum evidence to record |
| --- | --- |
| Standard screen / flow | Live or production-rendered review at the primary repo target for the form factor (`393×852` mobile or `1512×982` desktop; record the choice); task steps, outcome, and in-scope interaction/state captures or notes. |
| Responsive | Rendered review at every supported target in scope: iPhone `393×852`, narrow guard `390×844`, iPad portrait `834×1194`, iPad landscape `1194×834`, and MacBook `1512×982`; record each changed layout/state. |
| Dashboard | Rendered captures for each target in scope; KPI definitions and active scope; loading/stale/empty/partial/error/permission states in scope; and observed initial-useful-content, filter, refresh, and drill-down timings against the stated product budget. |
| Prototype | Prototype link, hypothesis, learning question, fidelity rationale, smallest slice, realistic content/data, task-based findings, and the happy/edge states needed to answer the question. |
| Accessibility | Actual matrix covering keyboard-only path, browser zoom/text enlargement, reduced motion, contrast/non-color cues, and one representative screen reader + browser/device when applicable; record scope-specific WCAG 2.2 criterion IDs, steps, results, and evidence. |

When behavior changes by viewport or state, multiple records are required: use one row per viewport/state/input combination or linked records that preserve the same detail. Missing required evidence is **FAIL** unless a named product/design owner records a written exception and reason; the reviewer cannot approve their own exception.

## 1. Problem and evidence

**Lens: [UX]**

See [Frame the problem](./ui-ux-design-principles.md#frame-the-problem-before-the-interface), [Design around purpose](./ui-ux-design-principles.md#design-around-purpose), and [Treat evidence as a design material](./ui-ux-design-principles.md#treat-evidence-as-a-design-material).

- [ ] User is named, including relevant knowledge, needs, and constraints.
- [ ] Context is realistic: device, timing, interruptions, permissions, connectivity, and stakes.
- [ ] Task is concrete and observable; the view’s job fits in one sentence.
- [ ] Constraints and non-negotiables are explicit.
- [ ] Evidence identifies what was observed, requested, measured, or tested.
- [ ] Intended outcome is clear for both the person and the product.
- [ ] Assumptions, unknowns, and evidence limits are visible.

**Fail if:** The review is defending a screenshot, feature request, or stakeholder preference without a verified user problem, task, evidence, or outcome.

## 2. Flow and information architecture

**Lens: [UX]**

See [Hierarchy](./ui-ux-design-principles.md#2-core-principles), [Agency](./ui-ux-design-principles.md#2-core-principles), [Progressive disclosure](./ui-ux-design-principles.md#2-core-principles), and [Recognition over recall](./ui-ux-design-principles.md#2-core-principles).

- [ ] Entry point is findable and sets the right expectation.
- [ ] User can orient: location, current scope, status, and purpose are clear.
- [ ] Information hierarchy matches task priority, risk, and sequence.
- [ ] Navigation uses familiar labels and preserves a logical place.
- [ ] Primary path and safest next action are obvious.
- [ ] Completion is visible and verifiable.
- [ ] Back, cancel, escape, undo, reset, and retry work where appropriate.
- [ ] Errors preserve work and offer a concrete recovery path.

**Fail if:** A user cannot start, understand where they are, complete the core task, or recover without losing work.

## 3. Screen and component quality

**Lens: [UI]**

See [Visual and interaction craft](./ui-ux-design-principles.md#3-visual-and-interaction-craft), [Component anatomy](./ui-ux-design-principles.md#component-anatomy), and [Complete states](./ui-ux-design-principles.md#complete-states).

- [ ] Content uses plain language, realistic length, useful labels, and meaningful media.
- [ ] Layout expresses grouping, reading order, alignment, spacing, and bounded content.
- [ ] Default, hover, focus, pressed, selected, disabled, loading, success, empty, error, permission, and destructive states are covered as relevant.
- [ ] Affordances are visible, named, and consistent with behavior.
- [ ] Every meaningful action receives timely feedback.
- [ ] Similar things look and behave similarly; intentional exceptions are clear.
- [ ] Typography wraps and grows; no fixed-height text hides content.
- [ ] Color, imagery, depth, motion, and polish serve comprehension and trust.
- [ ] Decorative layers and intentional overlays do not compete with content flow.

### Typography

Use the [Fidexa Typography Principles](./ui-typography-principles.md) for the full rationale, type-role vocabulary, responsive guidance, and accessibility rules.

- [ ] Typeface roles, fallback behavior, licensing, loading, and language coverage are understood.
- [ ] Text styles use named family/size/weight/line-height/tracking/casing tokens; no unexplained local values remain.
- [ ] Hierarchy and semantic heading order agree; reading order remains meaningful when layout changes.
- [ ] Longest realistic, translated-length, empty, error, success, and user-created content has been tested.
- [ ] Measure, line-height, paragraph spacing, wrapping, and truncation are readable at each target.
- [ ] Buttons, fields, errors, tables, metrics, chart labels, legends, and icon/text pairs have intentional typography.
- [ ] Text survives 200% enlargement, applicable reflow, larger platform text settings, fallback fonts, and responsive transformations.
- [ ] Essential meaning does not rely on weight, size, case, color, hover, or position alone.

### Color and modern expression

Use the [Fidexa Color Principles for Modern UI](./ui-color-principles.md) for the full rationale and token vocabulary.

- [ ] Non-neutral colors have named semantic roles; components do not contain unexplained raw color values.
- [ ] Neutral surfaces establish the reading field; accent moments are limited and tied to identity, action, insight, or real status.
- [ ] Every colored surface has a tested foreground partner, including hover, pressed, selected, focus-visible, disabled, and dark-theme variants as relevant.
- [ ] Normal text reaches `4.5:1`, large text reaches `3:1`, and meaningful controls/graphics reach `3:1` against adjacent colors where applicable.
- [ ] Essential meaning survives without hue through labels, icons, shapes, patterns, position, or text.
- [ ] Gradients, images, translucency, P3 colors, and thin lines were tested at their least-contrasting areas.
- [ ] The design is expressive without making every card, control, metric, or state equally loud.

**Fail if:** A core control is ambiguous or inaccessible, content clips, a meaningful state is missing, feedback is false or absent, or visual craft contradicts task priority or product truth.

### Foundation cross-check

- [ ] Layout/grid, hierarchy, spacing, consistency, contrast, polish/details, shape, imagery, and icon decisions have named roles and evidence.
- [ ] The focused handbook for each in-scope decision was consulted; exceptions and provisional values are recorded.
- [ ] The foundations agree: type, color, contrast, spacing, shape, imagery, and motion reinforce the same task hierarchy.

## 4. Desktop

**Lens: [UI] + [Shared] — presentation is UI; window, input, and task behavior are shared.**

See [Desktop-specific guidance](./ui-ux-design-principles.md#4-desktop-specific-guidance).

- [ ] Resize works across narrow, wide, tall, short, snapped, moved, and partially occluded windows.
- [ ] Record the tested window dimensions, resize path, and result; `1512×982` is covered, plus the documented minimum supported desktop window where applicable.
- [ ] At each recorded size, density exposes useful context without hiding the primary task or leaving unexplained empty space.
- [ ] Panes have recorded roles, minimum dimensions, boundaries, and a tested single-pane fallback where supported.
- [ ] Navigation and inspectors preserve orientation without stealing task focus.
- [ ] Core actions have both visible pointer paths and logical keyboard paths.
- [ ] Hover enhances; it is never the only route to critical information or action.
- [ ] Focus, hover, pressed, and selected states are visible and distinct.
- [ ] Shortcuts accelerate discoverable commands; tables support headers, units, alignment, sorting, selection, and readable states.
- [ ] At 200% browser zoom and the supported text-enlargement setting (record exact settings), content reflows or remains reachable without obscuring controls; multitasking and movement across displays are also recorded.

**Fail if:** A recorded target or the documented minimum supported window clips content, breaks the core task, or obscures controls under resize, zoom, text enlargement, keyboard, pointer, or multitasking; or critical information/action is hover-only.

## 5. Mobile and responsive

**Lens: [UI] + [Shared] — presentation is UI; adaptation, interruption, and task continuity are shared.**

See [Mobile-specific and responsive guidance](./ui-ux-design-principles.md#5-mobile-specific-and-responsive-guidance), [Responsive reflow and adaptive transformation](./ui-ux-design-principles.md#responsive-reflow-and-adaptive-transformation), and [Fidexa responsive targets](./ui-ux-design-principles.md#fidexa-responsive-targets).

- [ ] Primary iPhone review: `393×852`.
- [ ] Narrow overflow guard: `390×844`.
- [ ] iPad portrait: `834×1194`; iPad landscape: `1194×834`.
- [ ] MacBook: `1512×982`.
- [ ] Record touch-target dimensions/separation, thumb-reach result, and safe-area result for the primary path.
- [ ] Keyboard keeps the focused field, errors, and submit action visible; entered work survives validation failure.
- [ ] Orientation changes, rotation, resumed sessions, interruption, offline, delay, and permission changes are handled.
- [ ] No clipping, covered controls, accidental horizontal overflow, or document-width overflow.
- [ ] Responsive reflow is used when the task/composition stays stable; adaptive transformation is used when reach, density, or reading path must change.
- [ ] Across breakpoints, task, priority, scope, reading/focus order, names, states, recovery, and truthful data context remain intact.

**Fail if:** Any recorded target clips or horizontally overflows; a fixed overlay covers content/action; touch or keyboard use blocks completion; or the recorded responsive result cannot complete the core task.

## 6. Dashboard

**Lens: [Shared]**

See [Dashboard design principles](./ui-ux-design-principles.md#6-dashboard-design-principles), [Tell the truth visually](./ui-ux-design-principles.md#tell-the-truth-visually), [Design the data states](./ui-ux-design-principles.md#design-the-data-states), and [Desktop and mobile dashboard composition](./ui-ux-design-principles.md#desktop-and-mobile-dashboard-composition).

### Purpose and reading path

- [ ] Audience, decision, next action, and time horizon are explicit.
- [ ] Reading path moves from summary to diagnosis to action/detail.
- [ ] Grouping, size, position, whitespace, titles, captions, and annotations guide the eye.

### Metrics and truthfulness

- [ ] Each KPI defines unit, population, time range, aggregation, target, threshold, baseline, and freshness.
- [ ] Live, delayed, estimated, partial, stale, or transformed data is labeled.
- [ ] Chart choice answers the question; truthful scales, baselines, sorting, comparisons, and precision are used.
- [ ] Semantic color is restrained and paired with labels, shape, position, pattern, or text.

### Interaction and states

- [ ] Filters, drill-downs, tooltips, and selections have a purpose.
- [ ] Active scope, affected time range, selected values, and reset are visible and reliable.
- [ ] Loading, refresh, stale, empty/no-results, partial, error, permission, offline/degraded, and data-quality states explain what is known and what to do next.
- [ ] Definitions, values, and critical actions do not depend on hover alone.
- [ ] Record observed timings for initial useful content, filter apply, refresh, and drill-down in the test matrix; compare each with the stated product budget. If no budget exists, record `budget not defined` as a **NEEDS WORK** item—do not invent a universal threshold.

### Composition

- [ ] Desktop uses space for coherent summary, comparison, filters, definitions, and detail without making every metric loud.
- [ ] Mobile keeps fewer high-priority metrics, a readable vertical path, units/freshness/scope, and explicit access to secondary detail.

**Fail if:** A metric can be materially misread, scope/freshness is unclear, a critical value is hover- or color-only, a required data state is blank or unexplained, performance blocks the workflow, or mobile is compressed desktop tileware.

## 7. Accessibility

**Lens: [Shared]**

See [Accessibility](./ui-ux-design-principles.md#2-core-principles), [Accessibility and performance are part of dashboard design](./ui-ux-design-principles.md#accessibility-and-performance-are-part-of-dashboard-design), and [WCAG 2.2](https://www.w3.org/TR/wcag22/).

- [ ] Scope-specific WCAG 2.2 criterion IDs are listed; each has a test step, result, and evidence link.
- [ ] Contrast measurements and non-color cues are recorded for text, controls, states, charts, and media.
- [ ] Semantic structure, names, roles, values, headings, labels, and status are recorded from an accessibility-tree or equivalent inspection.
- [ ] Keyboard-only path is recorded end to end, including focus order/visibility, shortcuts, escape/back, and no keyboard trap.
- [ ] Browser zoom/text enlargement is recorded at 200% and the supported text setting, including reflow, clipping, and task-completion results.
- [ ] Reduced-motion preference on/off is recorded, including which transitions change and whether status remains perceivable.
- [ ] A representative screen reader + browser/device is named when applicable; announcements, navigation, and task results are recorded.
- [ ] Charts have an accessible summary, data table, or equivalent alternative, with the tested path recorded.

**Fail if:** A scope-specific WCAG 2.2 failure or missing matrix result creates a material barrier in keyboard-only use, zoom/text enlargement, reduced motion, contrast/non-color interpretation, or the recorded representative screen reader/browser/device path.

## 8. Prototype

**Lens: [UX] + [Shared] — the learning question is UX; fidelity, states, and evidence cross both lenses.**

See [Prototype principles](./ui-ux-design-principles.md#7-prototype-principles).

- [ ] Hypothesis and learning question are explicit.
- [ ] Fidelity matches the question; the smallest testable slice is used.
- [ ] Content and data are realistic, including long copy, real precision, density, and permissions.
- [ ] Happy path and relevant edge states cover feedback, loading, empty, disabled, permission, validation, error, cancel, undo, and recovery.
- [ ] Annotations distinguish real from simulated behavior and carry assumptions, sources, responsive changes, and handoff decisions.
- [ ] Testing uses realistic tasks, neutral facilitation, observation, and expectation questions.
- [ ] Preference feedback is separated from usability evidence.
- [ ] Findings, decisions, risks, owners, and evidence needed to retire risks are recorded.

**Fail if:** The prototype cannot answer its learning question, tests opinion instead of behavior, hides a relevant edge state, uses misleading content/data, or is treated as validated product evidence without task-based testing.

## 9. Final evidence

**Lens: [Shared]**

See [Review production output](./ui-ux-design-principles.md#9-fidexa-application-rules), [Run geometry and visual QA](./ui-ux-design-principles.md#9-fidexa-application-rules), and [Use adversarial review](./ui-ux-design-principles.md#9-fidexa-application-rules).

- [ ] Screenshots/captures exist at the agreed target sizes, including the relevant states.
- [ ] Actual rendered output was reviewed in the browser and on the relevant device/input modes.
- [ ] Wrapping, contrast, focus, bounds, media crops, first fold, overflow, and state visibility were checked.
- [ ] Routes, filters, contact, dialogs, links, disclosures, and external destinations were exercised where in scope.
- [ ] Known tradeoffs are written plainly and tied to a decision.
- [ ] Unresolved risks have owners and a next piece of evidence.
- [ ] Approval owner and decision boundary are explicit.

**Fail if:** The decision relies on a static design file alone, target-size/device review is missing, a known material regression has no owner, or approval authority is unclear.

## Review record

**Lens: [Shared]**

| Field | Record |
| --- | --- |
| Date | `YYYY-MM-DD` |
| Reviewer |  |
| Review type | `standard screen/flow` / `responsive` / `dashboard` / `prototype` / `accessibility` / `combined` |
| Surface / flow |  |
| Approval owner |  |
| Decision boundary / scope |  |
| Evidence / capture links |  |
| Verdict | `PASS` / `NEEDS WORK` / `FAIL` |
| Blocking issues |  |
| Non-blocking findings |  |
| Decision rationale |  |
| Exceptions / approver / reason |  |
| Owner / next evidence |  |

### Test matrix

The record may be one row per viewport/state combination or a linked record set. When behavior changes, use one row per viewport/state/input combination; otherwise use a linked record set with one summary record and complete matrix rows. Keep evidence and findings linked to the affected combination, and include the actual matrix—not only the intended coverage.

| Viewport / state | Browser | Input mode | Assistive tech | Zoom / text setting | Reduced-motion setting | Result / evidence link |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
