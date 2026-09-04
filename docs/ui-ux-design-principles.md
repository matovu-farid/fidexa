# Fidexa UI/UX Design Principles

**Canonical handbook for Fidexa studio, product, and prototype work**

**Last researched:** 2026-09-03

## How to use this handbook

Good design is not a mood, a trend, or a screenshot. It is a series of decisions that help a person understand, act, recover, and trust.

Start with the person and the job. Then make the experience clear, efficient, accessible, coherent, and emotionally appropriate. Visual quality matters, but it is downstream of purpose. A beautiful interface that hides uncertainty, slows a task, or excludes people is not finished.

This is a curated synthesis, not a source dump. The source set combines platform guidance, usability research, accessibility requirements, product practice, and craft philosophy. It gives Fidexa a shared vocabulary for deciding what to build, what to test, and what to reject. It does not replace product judgment, user research, or platform-specific implementation guidance.

### Design foundation handbooks

Use the focused handbooks when a decision depends on a particular visual foundation:

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

These are separate authorities for focused review, but they are not isolated disciplines: a layout decision affects hierarchy, spacing affects typography, contrast affects color and type, and imagery/shape/polish affect interaction and trust.

### UI and UX lenses

**UX concerns usefulness, context, flows, behavior, outcomes, and the relationship with the product. UI concerns the visible and interactive presentation and how it communicates behavior.** They are different lenses on the same experience, and neither is sufficient alone: a useful flow can fail when its interface is unreadable or misleading, while a beautiful interface can fail when it solves the wrong problem or leaves people without agency.

Use these labels throughout the handbook: **[UI]** marks visual and interactive presentation; **[UX]** marks purpose, context, behavior, and outcomes; **[Shared]** marks concerns that must be reviewed through both lenses together. The sections remain one handbook so a visual decision can be checked against its user and product consequences.

### Reading map: two navigation lenses

The numbered chapters below are the canonical handbook chapters. Part I and Part II are navigation lenses over those chapters, not additional or replacement sections; UI and UX remain separate parts handled together in one context.

#### Part I — Principles of UI design (navigation lens)

This lens covers visible and interactive presentation: how visual craft, layout, components, states, and device-specific guidance communicate and support behavior. See [Visual and interaction craft](#3-visual-and-interaction-craft), [Desktop-specific guidance](#4-desktop-specific-guidance), [Mobile-specific and responsive guidance](#5-mobile-specific-and-responsive-guidance), and the UI side of [Dashboard design principles](#6-dashboard-design-principles).

#### Part II — Principles of UX design (navigation lens)

This lens covers usefulness, context, flows, behavior, and outcomes: how a product addresses a real need and helps people act, recover, and achieve the intended result. See [Foundations](#1-foundations), [Core principles](#2-core-principles), [Prototype principles](#7-prototype-principles), [Mistakes to always avoid](#8-mistakes-to-always-avoid), and [Fidexa application rules](#9-fidexa-application-rules).

#### Shared context — UI and UX together (navigation lens)

Use [Shared context](#shared-context-where-ui-and-ux-meet) for concerns that cannot be judged through only one lens. It is the canonical cross-lens chapter; the map points to it without adding another chapter to the numbered sequence.

### Source legend

- **Requirement** — a legal, accessibility, project, or explicit product constraint. Treat failure as a defect until there is a documented exception.
- **Strong heuristic** — a broadly useful recommendation supported by usability research or repeated practice. Apply it by default; make exceptions visible and deliberate.
- **Platform convention** — a behavior users may expect on a particular operating system or form factor. Follow it where that platform is in scope, but do not mistake it for a universal law.
- **Craft lens** — a judgment about restraint, proportion, honesty, durability, and delight. Use it to improve a sound solution, never to override evidence, accessibility, or user agency.

When sources disagree, preserve the user’s goal and the applicable requirement first, then the target platform’s conventions, then heuristics, then taste. Record meaningful tradeoffs instead of hiding them in polish.

## 1. Foundations

**Lens: [UX]**

### Frame the problem before the interface

Before naming a screen, component, or feature, write down:

- **User** — who is acting, what do they know, and what constraints do they carry?
- **Context** — where, when, on what device, with what interruptions, permissions, connectivity, and stakes?
- **Task** — what must the person understand or accomplish now?
- **Evidence** — what observation, request, support signal, analytics, research, or operational fact says this problem exists?
- **Outcome** — what changes for the person and for the product if the task succeeds?

This is not paperwork for its own sake. Problem framing prevents the team from polishing a solution to the wrong problem. Verify the root problem when a request arrives as a proposed feature. A user asking for “a button” may be describing a missing status, a slow workflow, or a lack of permission.

- **Meaning:** Start with the person, situation, job, evidence, and desired outcome before choosing an interface.
- **Do:** Verify the root problem and name the user, context, task, evidence, and outcome in plain language.
- **Avoid:** Treating a requested feature, screenshot, or stakeholder preference as the problem definition.
- **Review question:** Can we explain who needs what, why now, and what evidence justifies solving it?

### Design around purpose

Every view should have a job it can state in one sentence. A product may support many jobs, but a screen should make its current job obvious. Purpose determines content priority, navigation, density, and the right amount of flexibility.

Use a decision rule: **what is the user trying to decide or do, what must they see first, and what is the safest next action?** If the answer is unclear, the design is not ready for decoration.

- **Meaning:** Give each view a clear job and make its priority legible in the content, hierarchy, and actions.
- **Do:** State the view’s job in one sentence, then make the first needed information and safest next action obvious.
- **Avoid:** Letting decoration, secondary features, or vague navigation compete with the current task.
- **Review question:** Can the user tell what this view is for and what to do next without explanation?

### Treat evidence as a design material

Use real feedback, realistic copy, representative data, and actual rendered output. Separate facts from assumptions. Mark unresolved questions. A prototype, screenshot, stakeholder reaction, or benchmark is evidence of something specific—not proof of everything.

- **Meaning:** Use evidence to reduce uncertainty, while staying precise about what each piece of evidence can and cannot prove.
- **Do:** Test assumptions with real feedback, realistic content and data, rendered output, and clearly recorded open questions.
- **Avoid:** Treating one opinion, idealized prototype, benchmark, or screenshot as universal validation.
- **Review question:** What exactly does this evidence tell us, and what important uncertainty remains?

## 2. Core principles

**Lens: [Shared] — apply each principle through both the UI and UX lens.**

The table is the working core of the handbook. Every principle has a meaning, a default action, a failure mode, and a question for review.

| Principle | Meaning | Do | Avoid | Review question |
| --- | --- | --- | --- | --- |
| **Agency** | People should feel in control of their actions, scope, navigation, and data. | Make actions explicit; preserve choice; provide undo, cancel, escape, back, and reset where appropriate. | Traps, forced paths, surprising navigation, irreversible actions without warning, or controls that silently change scope. | Can the user tell what will happen, stop it, and get back? |
| **Accessibility** | The experience must work for people with different abilities, devices, input methods, and environments. | Design semantic structure, contrast, focus, keyboard access, touch access, zoom, reduced motion, captions/alternatives, and non-color cues from the start. | Treating accessibility as a final color pass or an exception for “special” users. | Can a person complete the core task without sight, precise pointing, sound, fast motion, or a particular device? |
| **Clarity** | The interface should be understandable at the moment of choice. | Use plain language, visible labels, familiar verbs, clear grouping, and explicit status. | Vague copy, jargon, mystery meat icons, ambiguous affordances, and cleverness that delays comprehension. | What does this mean, and what can I do next, without explanation? |
| **Consistency** | Similar things should look and behave similarly, while meaningful differences remain visible. | Reuse patterns, names, tokens, and interaction rules; document intentional exceptions. | Inconsistency that makes users relearn the product, or rigid sameness that erases context. | If I know one instance, can I predict another? |
| **Craft** | Details should be intentional, durable, and in service of the experience. | Refine alignment, type, spacing, states, transitions, content, and media after the structure works. | Surface polish that conceals weak hierarchy, missing states, poor copy, or uncertain data. | Does every detail improve understanding, confidence, efficiency, or feeling? |
| **Delight** | Appropriate warmth, personality, and surprise can make a useful experience memorable. | Earn delight through responsive feedback, humane language, and small moments that reinforce progress. | Novelty that interrupts work, patronizes users, or competes with critical information. | Is the delight helping the task—or asking the task to support the decoration? |
| **Error prevention and recovery** | The best error is avoided; the next best is understandable and recoverable. | Validate near the point of entry; explain what went wrong; preserve input; suggest a concrete fix; make destructive actions reversible when possible. | Blaming users, generic error codes, silent failure, or clearing a form after an error. | Can a user diagnose, fix, and retry without losing their work? |
| **Familiarity** | People bring patterns from the physical world, other products, language, and the operating system. | Use established conventions when they carry useful meaning; introduce new patterns with clear cues. | Replacing a familiar action with a branded invention just to look different. | What prior knowledge does this design respect, and what new learning does it demand? |
| **Feedback** | Every meaningful action needs an understandable response, including delay, completion, and failure. | Show pressed/focused/loading/success/error states; acknowledge long work; make system status visible. | Dead clicks, false completion, spinner-only waiting, or feedback that appears too late to guide action. | After acting, does the user know whether anything happened and what to do now? |
| **Flexibility** | A product should support different contexts and ways of working without becoming shapeless. | Support alternate paths, responsive layouts, saved preferences, and efficient repeated work where evidence warrants it. | Exposing every option at once or making users configure the tool before they can succeed. | Does flexibility remove friction, or merely transfer design work to the user? |
| **Hierarchy** | Visual and interaction emphasis should reflect task priority, risk, and sequence. | Establish a reading path; distinguish primary, secondary, and supporting content; use size, position, grouping, and emphasis deliberately. | Giving every card, alert, button, and metric equal volume. | Does the first thing noticed match the first thing needed? |
| **Honesty** | The interface should accurately represent content, capability, uncertainty, ownership, and data freshness. | Label estimates, permissions, automation, placeholders, loading, stale data, and limitations plainly. | Fake certainty, inflated metrics, invented product proof, deceptive affordances, or claims the system cannot support. | Is the user’s mental model likely to match reality? |
| **Novice/expert flexibility** | New users need discoverability; experienced users need speed. | Make core commands visible, then add shortcuts, search, bulk actions, and customization that reward learning. | Hiding essential actions behind shortcuts or overwhelming beginners with expert controls. | Can a first-time user start, and can a frequent user become faster? |
| **Progressive disclosure** | Complexity should arrive when it becomes useful, not before. | Show the essential path first; reveal detail, advanced options, and diagnostics in context. | Hiding necessary information, fragmenting a simple task into needless steps, or using disclosure to avoid making a decision. | Is the next layer available at the moment it is needed? |
| **Recognition over recall** | Seeing options and status is easier than remembering commands, scope, or prior input. | Keep labels, selected state, context, examples, recent choices, and visible affordances near the task. | Memory tests, unlabeled icons, hidden mode changes, and forms that make users reconstruct information. | What must the user remember that the interface could show? |
| **Responsibility** | Design affects trust, safety, privacy, time, money, and downstream decisions. | Minimize harm; ask for consent at the right moment; explain consequences; protect sensitive information; make the safe path easy. | Dark patterns, coercive defaults, careless exposure, manipulative urgency, or offloading risk to the user. | Who bears the cost if this is misunderstood or misused? |
| **Simplicity** | Reduce cognitive and operational load without reducing necessary capability. | Remove nonessential choices; combine steps when safe; use progressive disclosure; keep the main path obvious. | Confusing minimal appearance with simple use, or deleting context that makes a decision safe. | What can disappear without harming comprehension or control? |
| **Restraint** | Attention is scarce; use emphasis as a limited resource. | Let content, status, and action earn visual weight; prefer a few strong signals. | Decoration everywhere, constant motion, loud color, dense borders, and “more” mistaken for “better.” | What is the one thing this treatment is asking the user to notice? |

## 3. Visual and interaction craft

**Lens: [UI]**

Polish is the final expression of a good decision, not a substitute for one. A refined interface should make function easier to perceive, action easier to perform, and uncertainty harder to miss.

### Layout, spacing, and alignment

Use a layout that expresses relationships: what belongs together, what follows, what is primary, and what can be scanned. Establish a consistent content edge, grid, and rhythm. Let related elements share a bounded frame. Use whitespace to separate concepts, not merely to make a composition look expensive.

Align text, controls, media, and repeated cards to a small set of intentional axes. Let long content grow. Avoid centering everything, arbitrary offsets, and empty space that has no compositional or functional purpose.

### Typography

Type carries hierarchy, tone, and pace. Choose a small, coherent type system with readable measure, durable wrapping, and visible distinction between heading, label, body, metadata, and action. Use weight, size, line-height, and color as coordinated signals. Test the longest realistic copy, not only the ideal headline.

Do not use tiny type, excessive all-caps, low-contrast metadata, or fixed-height text containers that clip or conceal wrapping.

For the typography system behind these decisions, use the [Fidexa Typography Principles](./ui-typography-principles.md). It defines typeface roles, named scales, hierarchy, responsive behavior, dashboard typography, accessibility requirements, recurring mistakes, and a provisional Fidexa typography contract.

### Color and contrast

Color should communicate hierarchy, grouping, interaction, or semantic status. Start with a restrained neutral field and add accents where they carry meaning. Verify contrast and do not make color the only signal for status, selection, or error.

Do not use brand color as a substitute for priority. A quiet surface can be more informative than a saturated one when the task is analytical or operational.

For the color system behind these decisions, use the [Fidexa Color Principles for Modern UI](./ui-color-principles.md). It defines semantic roles, tonal ramps, expressive-accent limits, themes, component states, dashboard palettes, accessibility gates, and the provisional Fidexa starter mapping.

### Icons and imagery

Icons should support a label or a well-established convention; they should not force users to decode a private symbol system. Give icon-only controls a name, accessible label, and visible state.

Imagery is evidence, orientation, or emotion—not filler. Use real product media when the image is meant to prove a product. Give images meaningful alternative text, explicit dimensions, a deliberate crop, and a stable aspect-ratio frame. Never let a crop imply a capability that the source does not show.

### Surfaces and depth

Borders, fills, elevation, blur, and layering should establish grouping and interaction. Use the minimum depth needed to distinguish planes. A surface should not look clickable unless it is clickable, and a disabled control should not look like a loading control.

### Motion

Motion should explain change, preserve orientation, and acknowledge action. Keep it short enough to respect task flow. Provide reduced-motion behavior. Avoid animation that delays access to information, creates false urgency, or hides a state transition.

### Content and microcopy

Write for the decision in front of the user. Prefer concrete verbs, familiar nouns, and honest status. Put instructions near the point of need. Error text should identify the problem and offer a path forward. Empty states should say what is absent and what can happen next. Do not let placeholder copy, lorem ipsum, or idealized sample data make a layout pass.

### Component anatomy

A component is not complete when its happy-path screenshot looks right. Define its anatomy and contract:

- purpose, label, and semantic role;
- primary and secondary actions;
- default, hover, focus, pressed, selected, disabled, loading, success, empty, error, permission, and destructive states as relevant;
- content limits, wrapping, truncation, and responsive behavior;
- keyboard, pointer, touch, screen-reader, and reduced-motion behavior;
- validation, recovery, and analytics implications where applicable.

Name components by meaning, not by appearance. Keep decorative artwork separate from content flow, and name intentional overlays as overlays.

### Complete states

Design the state model before the final visual pass. “Loading,” “no results,” “partially loaded,” “stale,” “not authorized,” “offline,” and “failed” are product states, not edge-case screenshots. If the user cannot tell which state they are in, the design is incomplete.

## 4. Desktop-specific guidance

**Lens: [UI] + [Shared] — presentation is UI; window, input, and task behavior are shared.**

Desktop is not a large phone. It offers pointer precision, keyboard power, resizable windows, multitasking, and space for context. Use those capabilities without turning the screen into a warehouse of equal-priority panels.

- **Respect resizable windows.** Test narrow, wide, tall, short, snapped, moved, and partially occluded windows. Do not depend on one “desktop” width.
- **Use density purposefully.** Large screens can expose adjacent context, comparisons, history, filters, and detail. They should not merely stretch a single column into empty space.
- **Make multi-pane layouts legible.** Give each pane a clear role, stable boundaries, sensible minimums, and a predictable relationship to the others. Preserve a useful single-pane fallback where possible.
- **Use sidebars and inspectors for orientation and detail.** Persistent navigation should show location and scope. Inspectors should explain what they describe and should not steal the primary task’s focus.
- **Support keyboard and pointer together.** Every core action needs a visible pointer path and a reachable keyboard path. Show focus; keep focus order logical; do not make hover the only way to discover or access information.
- **Make command discoverability proportional to complexity.** Menus, command search, tooltips, and shortcut hints can support expert workflows, but shortcuts should accelerate a visible command rather than replace it.
- **Use hover as enhancement, not infrastructure.** Hover can preview, highlight, or reveal secondary detail. Critical actions, definitions, and chart values must remain available to keyboard and touch users.
- **Design tables for work.** Use clear headers, units, alignment, sorting state, row focus, selection, pagination or virtualization where needed, and a readable empty/error state. Avoid making every column equally dense or hiding key context in a tooltip.
- **Support zoom and movement.** Content must survive zoom, text enlargement, window movement across displays, and multitasking. Avoid fixed-position elements that obscure the task when the window is resized.
- **Let extra space buy context.** Prefer comparison, provenance, detail-on-demand, and recovery affordances over stretched cards or decorative voids.

Desktop review question: **when the window is wider, what useful decision becomes easier? When it is narrower, what remains essential and what transforms?**

## 5. Mobile-specific and responsive guidance

**Lens: [UI] + [Shared] — presentation is UI; adaptation, interruption, and task continuity are shared.**

Mobile is a constrained, interruptible, touch-first environment. The priority is not to fit the desktop design into a smaller rectangle; it is to preserve the user’s core task with less space and less certainty about attention.

### Mobile fundamentals

- Prioritize one primary job per view. Put the next useful action within comfortable reach.
- Respect thumb reach, safe areas, touch target size, and separation between neighboring actions. Use the target platform’s current guidance where it specifies dimensions; do not invent a universal number for every control.
- Keep primary actions visible and secondary actions discoverable. Bottom navigation is appropriate for a small set of top-level destinations, not every possible destination.
- Design for one-handed use, changing grip, glare, motion, and interruption. Do not put a destructive or high-frequency action where accidental taps are likely.
- Treat gestures as accelerators. Pair important gestures with visible controls and feedback; never make a core path hover-dependent or gesture-only.
- Make forms short, chunked, forgiving, and keyboard-aware. Preserve entered values when validation fails. Ensure the focused field, submit action, and error text remain visible when the keyboard changes the viewport.
- Support safe-area insets, orientation changes, rotation, and resumed sessions. Do not let fixed overlays cover content or essential actions.
- Expect delayed responses, lost connectivity, permissions changes, notifications, and interruption. Preserve work and explain retry, offline, or authorization state.

### Responsive reflow and adaptive transformation

**Responsive reflow** changes size, wrapping, spacing, and order while keeping the same basic composition. It is useful when the content and task remain stable.

**Adaptive transformation** changes the composition itself: a sidebar becomes a sheet, a multi-pane editor becomes a stepwise flow, a table becomes a prioritized list, or a dense dashboard becomes a focused summary with detail access. Use it when the interaction model, reach, or reading path must change.

Across breakpoints, preserve these invariants:

- the core task and its completion signal;
- content priority and visible current scope;
- logical reading and focus order;
- accessible names, state, and recovery paths;
- readable type, usable controls, and no accidental clipping or horizontal overflow;
- honest status, definitions, freshness, and permission boundaries;
- the ability to return, cancel, undo, and reset.

### Fidexa responsive targets

Use these as real review targets, not abstract device categories:

- **iPhone:** `393×852` for primary mobile review; `390×844` as a narrow overflow guard.
- **iPad portrait:** `834×1194`.
- **iPad landscape:** `1194×834`.
- **MacBook:** `1512×982`.

Review actual rendered pages at these sizes. A design is not responsive because its frame is resized; it is responsive when the task, hierarchy, state visibility, and recovery behavior remain sound.

## 6. Dashboard design principles

**Lens: [Shared] — dashboard presentation and dashboard decision context must be reviewed together.**

A dashboard is a decision surface, not a collage of charts. Its job is to help a defined audience notice what matters, understand why, and decide what to do next.

### Start with audience, decision, and action

Name the audience, the decision they need to make, the action that follows, and the time horizon. An executive summary, an operations monitor, and an analyst workspace may use related data but require different density, reading paths, and controls.

Choose metrics because they answer that decision. Define each KPI with its unit, population, time window, aggregation, target or threshold, comparison baseline, and last-updated time. Show whether data is live, delayed, estimated, partial, or stale. A naked number is an invitation to misread it.

### Make a reading path

Orient first, diagnose second, act third. Lead with the smallest useful summary, then provide comparison, trend, segmentation, and detail. Use grouping, size, position, whitespace, titles, captions, and annotations to guide the eye. Progressive detail should preserve the active scope and the user’s place.

### Choose charts for questions

Use the simplest chart that answers the question:

- line or area for change over time when continuity matters;
- bars for category comparison and ranking;
- a table when exact values, scanning, or accessible detail is the job;
- a scatterplot for relationships and outliers;
- a distribution view when spread and variation matter;
- a bullet or goal view for actual versus target;
- a map only when geography is essential to the decision.

Chart novelty is not insight. Avoid 3D effects, decoration, excessive dual axes, dense legends, and chart types whose geometry implies a relationship the data does not support.

### Tell the truth visually

Use truthful scales, clear baselines, honest sorting, appropriate precision, and consistent comparisons. Label units, time ranges, populations, and transformations. Do not imply accuracy the data does not possess. If a scale is intentionally non-zero, make that choice obvious and explain why. Keep comparable views on comparable scales unless the difference is explicit and useful.

Use semantic color sparingly and consistently. Reserve alert colors for actual alerts. Pair color with labels, shape, position, pattern, or text so meaning survives color-vision differences, grayscale, low contrast, and screen-reader use.

### Make interaction visible

Filters, drill-downs, selections, parameters, and tooltips should answer a purpose. Show active scope, affected time range, selected values, and a reliable reset. Do not let a filter silently change the story. Tooltips can provide detail on demand, but critical values, definitions, and actions cannot depend on hover alone.

### Design the data states

Every dashboard needs intentional treatment for:

- loading and refresh in progress;
- live, delayed, stale, and last-updated data;
- empty results and no data for the selected scope;
- partial or incomplete data;
- query, service, and data-quality errors;
- permission-restricted metrics or views;
- offline or degraded connectivity;
- filters that produce no results;
- unavailable definitions or broken source lineage.

Tell the user what is known, what is missing, and what they can do next. A quiet blank tile is not a neutral state; it is an unlabelled claim that nothing matters.

### Accessibility and performance are part of dashboard design

Provide accessible headings, labels, summaries, keyboard paths, focus states, screen-reader alternatives, and a table or text representation when a chart is not otherwise perceivable. Ensure interaction does not require hover, precision pointing, or color discrimination.

Design for responsive performance: limit unnecessary marks, expensive calculations, and redundant queries; prioritize first useful content; give feedback during refresh; and keep interactions responsive enough for the user’s workflow. Performance is not a post-launch optimization when the dashboard is an operational tool.

### Desktop and mobile dashboard composition

On desktop, use space for a coherent summary, comparison, filters, definitions, and detail panes. Establish a stable visual path and keep the most important KPIs visible without making every metric loud.

On mobile, transform deliberately. Keep fewer, higher-priority metrics; use a vertical reading flow; preserve units, freshness, and scope; allow readable charts and tables; and move secondary detail behind explicit expansion or navigation. Never compress a desktop dashboard into tiny tiles and call it responsive.

### Dashboard do and don’t

| Do | Don’t |
| --- | --- |
| Design around an audience, decision, and next action. | Build a status poster when the user needs diagnosis or action. |
| Define KPI units, time window, target, threshold, baseline, and freshness. | Show metrics without context or imply unsupported precision. |
| Lead from summary to diagnosis to detail. | Give every chart equal size, contrast, and urgency. |
| Choose a chart for the question and data relationship. | Choose chart novelty because it looks impressive. |
| Use truthful scales, sorting, baselines, and comparable comparisons. | Use misleading axes, inconsistent scales, 3D effects, or unexplained dual axes. |
| Use restrained semantic color and non-color cues. | Make color the only status signal or let red mean several things. |
| Show active filters, scope, drill-down, tooltips, and reset. | Let filters silently change the story or hide critical detail on hover. |
| Design loading, stale, empty, partial, error, permission, and data-quality states. | Leave blank tiles, stale numbers, or failed queries unexplained. |
| Provide accessible labels, summaries, keyboard paths, and table alternatives. | Treat a visual chart as self-explanatory or screen-reader complete by default. |
| Make desktop density useful and mobile composition intentional. | Stretch mobile into desktop emptiness or shrink desktop into mobile tiles. |
| Budget for refresh, query, and interaction performance. | Wait until production to discover the dashboard cannot be used at real scale. |

## 7. Prototype principles

**Lens: [UX] + [Shared] — the learning question is UX; fidelity, states, and evidence cross both lenses.**

A prototype is a hypothesis made tangible. It should help the team learn something before the cost of changing the product rises.

1. **Name the learning question.** “Will people understand the information architecture?” is different from “Can they complete the approval flow?” and requires a different prototype.
2. **Choose fidelity for the question.** Use paper or low fidelity to explore structure and alternatives quickly. Use higher fidelity to test realistic interactions, content, transitions, responsive behavior, or handoff detail. Fidelity is a tool, not a maturity badge.
3. **Build the smallest testable slice.** Prototype the path that can answer the question, not the entire product. Keep the experiment small enough to revise.
4. **Use realistic content and data.** Include long names, empty results, numbers with real precision, permissions, and representative density. Short placeholder copy hides layout failures.
5. **Prototype the happy path and the edges.** Include feedback, loading, empty, disabled, permission, validation, error, cancel, undo, and recovery states when they affect the learning question.
6. **Annotate what is real and what is simulated.** Note assumptions, data sources, unknowns, conditional logic, responsive changes, and intended behavior. Handoff should carry decisions, not only pixels.
7. **Test tasks, not opinions.** Give participants a realistic goal and neutral instructions. Ask what they expect, observe what they do, and avoid leading them toward the answer.
8. **Iterate early.** Share rough work while it is still easy to change. Use internal critique, heuristic review, and user testing as complementary signals.
9. **Separate preference from usability.** “I like the blue” is preference evidence. “I could not tell which account was active” is usability evidence. Both may inform craft, but they do not have equal decision weight.
10. **Log findings, decisions, and risks.** Record what was learned, what changed, what remains uncertain, who owns the next decision, and what evidence would retire the risk.

Do not confuse a high-fidelity prototype with a validated product. A polished wrong idea is still wrong; a rough prototype that answers the right question is valuable.

## 8. Mistakes to always avoid

**Lens: [Shared] — each anti-pattern can damage presentation, behavior, trust, or outcomes.**

### General anti-patterns

- Designing from taste, trend, or a screenshot instead of a verified problem.
- Confusing minimal appearance with simple use.
- Hiding essential actions behind ambiguous icons or undiscoverable gestures.
- Inventing terminology when a familiar term would do.
- Creating visual hierarchy that contradicts task priority or risk.
- Relying on color, hover, animation, or placeholder copy alone to communicate meaning.
- Omitting loading, empty, error, disabled, permission, destructive, and recovery states.
- Breaking keyboard access, touch use, zoom, screen-reader comprehension, or reduced-motion behavior.
- Shrinking a desktop layout into mobile instead of redesigning the task.
- Stretching a mobile layout into desktop without using the available space for useful context.
- Making a beautiful prototype that tests the wrong question.
- Overbuilding high-fidelity prototypes before validating structure and flow.
- Using unrealistic short copy or idealized data.
- Asking leading questions during user tests.
- Treating stakeholder preference as user evidence.
- Shipping without reviewing actual rendered output at target sizes.
- Letting decorative layers, media crops, or motion compete with content.
- Shipping unverified claims, manipulative defaults, coercive flows, or dark patterns.

### Dashboard anti-patterns

- Treating a dashboard as a status poster when the user needs diagnosis or action.
- Showing metrics without units, time range, baseline, target, threshold, comparison, or last-updated context.
- Choosing a chart for novelty instead of the question.
- Using misleading axes, inconsistent scales, 3D effects, unexplained dual axes, or excessive decimal precision.
- Hiding stale, partial, estimated, or failed data.
- Mixing freshness, time windows, populations, or aggregation levels without making the difference visible.
- Letting filters silently change the story or leaving active scope unclear.
- Making critical information hover-only.
- Using too many competing alerts, colors, filters, charts, or equally loud cards.
- Encoding status only through color.
- Truncating labels, hiding values, or removing definitions to preserve a tidy screenshot.
- Compressing a desktop dashboard into tiny mobile tiles.
- Omitting missing, empty, loading, permission, data-quality, and recovery states.

## 9. Fidexa application rules

**Lens: [Shared] — these rules bind UI craft to UX purpose and evidence.**

These rules turn the principles into the working contract for Fidexa design and implementation.

1. **Tokens first in Penpot.** Establish the shared visual vocabulary—color, type, spacing, radii, borders, elevation, and component states—before composing one-off screens. Token changes should improve a family of screens, not only a hero.
2. **Bound every content unit.** Put each story, card, form, and media unit inside a named bounded frame. Use semantic order such as `eyebrow → heading → body → proof/media`.
3. **Use auto-height text.** Headings and body copy should grow with realistic content. Avoid fixed-height text boxes that hide wrapping or overflow.
4. **Name for meaning.** Use semantic layer and component names. Keep decorative artwork separate from content flow; name intentional overlays `Overlay / ...`; lock backgrounds and decoration when appropriate.
5. **Use real product media.** Prefer verified captures from deployed Fidexa products. Do not invent dashboard widgets or describe an unauthenticated showcase as an authenticated dashboard. Preserve meaningful alt text, explicit dimensions, stable aspect ratios, and deliberate crops.
6. **Create real device boards.** Review actual `393×852` iPhone, `834×1194` iPad portrait, `1194×834` iPad landscape, and `1512×982` MacBook compositions. Do not put a smaller phone artboard inside a decorative device shell and call it the mobile board.
7. **Review production output.** Inspect the production build in a browser at target sizes. Verify first fold, wrapping, media bounds, interaction states, routes, filters, contact, AI dialog, footer links, disclosures, and external destinations.
8. **Run geometry and visual QA.** Check sibling collisions, parent overflow, intentional overlays, document overflow, focus order, contrast, crop quality, and state visibility. Geometry is necessary but does not prove legibility.
9. **Use adversarial review.** Have a fresh reviewer compare matched old and new captures. Treat a concrete readability, hierarchy, authenticity, responsive, accessibility, or interaction regression as a required fix loop.
10. **Preserve boundaries.** Fidexa studio work, Rishi product work, the shared design system, and `Case Study — Rishi` are distinct surfaces. Do not delete, merge, or silently repurpose their Penpot/Pencil pages while editing the Fidexa site.

The rendered site is the implementation source of truth. Penpot and Pencil explain intent and history; exported images do not override what the product actually does.

## Shared context: where UI and UX meet

UI and UX are not separate deliverables: this shared section is where presentation, behavior, context, and outcomes are reviewed together.

| Concern | UI lens | UX lens | Review evidence |
| --- | --- | --- | --- |
| Dashboard | Hierarchy, legibility, chart and state presentation | Audience, decisions, scope, freshness, and next actions | Rendered dashboard review with representative data and task walkthroughs |
| Responsive behavior | Reflow, composition, spacing, and readable controls | Task continuity, reach, interruption, and preserved priorities | Target-size captures plus core-task checks across devices |
| Accessibility | Contrast, focus, semantics, labels, and non-color cues | Independent completion, comprehension, and recovery | Keyboard, screen-reader, zoom, reduced-motion, and touch checks |
| Prototypes | Fidelity, interaction cues, content, and state detail | Learning question, test task, assumptions, and findings | Task-based tests with findings tied to design decisions |
| States and errors | Visible loading, empty, disabled, success, and error treatments | Status comprehension, prevention, recovery, and trust | State inventory plus recovery walkthroughs using realistic failures |
| Design systems | Tokens, components, variants, and visual consistency | Shared behavior, flexibility, governance, and product fit | Component/state matrix and cross-screen consistency review |

## 10. Compact source map

**Lens: [Shared] — sources support the UI, UX, and combined review decisions above.**

All sources below were checked for this handbook on **2026-09-03**. The links are direct, and the claim area explains why each source is here.

| Source | Claim area | URL | Researched |
| --- | --- | --- | --- |
| Apple Human Interface Guidelines — Design principles | Purpose, agency, responsibility, familiarity, flexibility, simplicity, clarity, craft, delight | [Apple Design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles) | 2026-09-03 |
| Apple Human Interface Guidelines — Designing for macOS | Desktop windowing, input, density, multitasking, platform conventions | [Apple Designing for macOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-macos/) | 2026-09-03 |
| Apple Human Interface Guidelines — Layout | Layout, hierarchy, spacing, adaptation | [Apple Layout](https://developer.apple.com/design/human-interface-guidelines/layout) | 2026-09-03 |
| Apple Human Interface Guidelines — Tab bars | Mobile navigation and top-level destination conventions | [Apple Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) | 2026-09-03 |
| Apple Human Interface Guidelines — Charting data | Chart readability, context, data communication | [Apple Charting data](https://developer.apple.com/design/human-interface-guidelines/charting-data) | 2026-09-03 |
| Material Design 3 — States | Interaction feedback and component state communication | [Material states](https://m3.material.io/foundations/interaction/states/overview) | 2026-09-03 |
| Android Developers — Mobile design | Mobile foundations, layouts, behaviors, components, accessibility | [Android mobile design](https://developer.android.com/design/ui/mobile) | 2026-09-03 |
| Android Developers — Adaptive do’s and don’ts | Resizability, window size, orientation, aspect ratio, adaptive behavior | [Adaptive do’s and don’ts](https://developer.android.com/develop/adaptive-apps/guides/adaptive-dos-and-donts) | 2026-09-03 |
| Material Design — Accessibility | Accessibility as a first-class design concern | [Material accessibility](https://m1.material.io/usability/accessibility.html) | 2026-09-03 |
| Linear Method — Principles & Practices | Purpose, clarity, momentum, problem framing, small scope, ownership, evidence | [Linear Method introduction](https://linear.app/method/introduction) | 2026-09-03 |
| Linear Method — Manage design projects | Verify the problem, explore alternatives, seek feedback early, collaborate with engineering | [Linear Manage design projects](https://linear.app/method/manage-design-projects) | 2026-09-03 |
| Figma — What is prototyping | Prototype purpose, validation, communication, fidelity, iteration | [Figma What is prototyping](https://www.figma.com/resource-library/what-is-prototyping/) | 2026-09-03 |
| Figma — What is UX design | UX scope, user-centered practice, research and design process | [Figma What is UX design](https://www.figma.com/resource-library/what-is-ux-design/) | 2026-09-03 |
| Nielsen Norman Group — Ten usability heuristics | Visibility, match, control, consistency, recognition, error recovery, minimalist design, help | [NN/g Ten usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) | 2026-09-03 |
| Nielsen Norman Group — Heuristic evaluation | Structured review, independent evaluators, severity, complement to user research | [NN/g How to conduct a heuristic evaluation](https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/) | 2026-09-03 |
| Nielsen Norman Group — Low vs high fidelity | Choosing prototype fidelity for the learning need | [NN/g UX prototype fidelity](https://www.nngroup.com/articles/ux-prototype-hi-lo-fidelity/) | 2026-09-03 |
| Nielsen Norman Group — Usability testing 101 | Task-based testing, observation, neutral facilitation, iteration | [NN/g Usability testing 101](https://www.nngroup.com/articles/usability-testing-101/) | 2026-09-03 |
| Nielsen Norman Group — Complex application design | Complexity management, orientation, progressive disclosure, expert workflows | [NN/g Complex application design](https://www.nngroup.com/articles/complex-application-design/) | 2026-09-03 |
| W3C — WCAG 2.2 | Accessibility requirements and testable success criteria | [WCAG 2.2](https://www.w3.org/TR/wcag22/) | 2026-09-03 |
| Vitsœ / Dieter Rams — Good design | Useful, understandable, honest, thorough, restrained, durable, less but better | [Vitsœ Good design](https://www.vitsoe.com/us/about/good-design) | 2026-09-03 |
| Microsoft — Windows design principles | Desktop coherence, input diversity, familiar behavior, density, adaptive windowing | [Windows design principles](https://learn.microsoft.com/en-us/windows/apps/design/design-principles) | 2026-09-03 |
| Microsoft Power BI — Dashboard design tips | Audience, KPI focus, one-screen orientation, context, filters, performance | [Power BI dashboard design tips](https://learn.microsoft.com/en-us/power-bi/create-reports/service-dashboards-design-tips) | 2026-09-03 |
| Tableau — Dashboard best practices | Audience, purpose, layout, sizing, device layouts, performance | [Tableau dashboard best practices](https://help.tableau.com/current/pro/desktop/en-us/dashboards_best_practices.htm) | 2026-09-03 |
| Tableau Blueprint — Visual best practices | Context, chart choice, reading path, color restraint, tooltips, accessibility | [Tableau visual best practices](https://help.tableau.com/current/blueprint/en-us/bp_visual_best_practices.htm) | 2026-09-03 |

This handbook is intentionally opinionated. Use it to make a decision, expose a risk, or write a better test—not to avoid judgment by pointing at a rule.
