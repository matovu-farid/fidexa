# Fidexa UI/UX Design Principles Documentation Design

**Date:** 2026-09-03  
**Status:** Proposed  
**Scope:** Fidexa studio, product, and prototype design work

## Decision

Create two linked documents that make high-quality UX judgment usable during everyday design work:

1. `docs/ui-ux-design-principles.md` — the canonical handbook. It explains the principles, tradeoffs, desktop/mobile distinctions, prototype practice, failure modes, and the evidence behind the guidance.
2. `docs/ui-ux-design-review-checklist.md` — the short operational gate. It turns the handbook into review questions and explicit fail conditions for Penpot boards, product screens, responsive layouts, and prototypes.

Add links to both documents from `docs/penpot-design-process.md` and the project handoff guidance so future design work treats them as part of the normal workflow.

## Research posture

The request for “everything on the internet” is interpreted as a broad, curated synthesis rather than an impossible exhaustive inventory. Sources will be selected for demonstrated authority, quality of practice, platform expertise, accessibility rigor, and design craft:

- **Apple Human Interface Guidelines:** purpose, agency, responsibility, familiarity, flexibility, simplicity, craft, delight, plus macOS/iOS layout and input guidance.
- **Google Material Design / Android guidance:** responsive and adaptive layouts, component states, touch targets, hierarchy, motion, and mobile behavior.
- **Linear Method:** verify the problem, build for creators, aim for clarity, keep software purpose-built, explore alternatives, seek feedback early, and collaborate with engineering.
- **Figma:** prototype purpose, fidelity selection, validation, communication, and iteration.
- **Nielsen Norman Group:** usability heuristics, heuristic evaluation, prototype testing, and iterative usability testing.
- **W3C WCAG 2.2:** the accessibility baseline; standards are treated as requirements, not aesthetic suggestions.
- **Dieter Rams / Vitsœ:** useful, understandable, honest, durable, thorough, restrained, and “less, but better.” This is a craft lens, not a substitute for user research or accessibility standards.
- **Microsoft Fluent / Windows guidance:** desktop windowing, density, layering, input diversity, and calm/familiar/coherent system behavior.

The handbook will clearly distinguish normative requirements, strong heuristics, platform conventions, and taste/craft principles. No source is treated as universally correct; platform rules are applied only where the target platform requires them.

## Handbook structure

### 1. How to use this document

Define the quality bar, explain the distinction between UX, interaction design, UI, and visual craft, and establish a decision rule: serve user goals first, then make the result clear, efficient, accessible, coherent, and emotionally appropriate.

### 2. Foundations

Cover problem framing, user-centered design, research, constraints, product purpose, trust, privacy, safety, inclusion, and measurable outcomes. Require designers to state the user, task, context, desired outcome, and evidence before styling a solution.

### 3. Core principles of great interfaces

Synthesize the common principles into practical rules:

- purpose and focus;
- clarity and plain language;
- hierarchy and progressive disclosure;
- consistency with meaningful exceptions;
- visible system status and feedback;
- recognition over recall;
- agency, undo, escape, and reversibility;
- prevention and recovery from errors;
- flexibility for novice and expert use;
- accessibility as a first-class requirement;
- honest content and transparent system behavior;
- craft, restraint, and appropriate delight.

Each principle will include: what it means, why it matters, do’s, anti-patterns, and a review question.

### 4. Visual and interaction craft

Document layout, grids, spacing, alignment, typography, color, contrast, iconography, imagery, surfaces, depth, motion, microcopy, component anatomy, states, and content quality. Emphasize that visual polish must clarify function rather than decorate uncertainty.

### 5. Desktop-specific principles

Cover large and resizable windows, multi-pane layouts, information density, persistent navigation, keyboard and pointer input, hover/focus/pressed states, command discoverability, shortcuts, tables, sidebars, inspectors, window movement, zoom, multi-tasking, and expert efficiency. Require designs to use additional space to expose useful context or capability rather than merely stretching cards.

### 6. Mobile-specific principles

Cover small-screen prioritization, thumb reach, touch target size and spacing, safe areas, one-handed use, keyboard and viewport changes, gesture discoverability, bottom navigation, mobile forms, interruption, poor connectivity, permissions, orientation, and content-first responsive behavior. Require real device-sized review and parity of core tasks without blindly copying desktop layouts.

### 7. Responsive and adaptive design

Explain the difference between responsive reflow and adaptive transformation. Define invariants across breakpoints: task continuity, content priority, state visibility, focus order, readable type, no clipping, no accidental horizontal scroll, and preserved recovery paths.

### 8. Prototyping principles

Treat a prototype as a hypothesis, not a miniature finished product. Cover:

- prototype goal and learning question;
- choosing paper, low-fidelity, mid-fidelity, or high-fidelity;
- testing the smallest slice that can answer the question;
- realistic content and representative data;
- complete happy path plus meaningful edge/error states;
- interaction feedback, loading, empty, disabled, permission, and recovery states;
- annotations and handoff context;
- participant tasks and neutral facilitation;
- testing early and iteratively;
- separating visual preference feedback from usability evidence;
- documenting findings, decisions, and unresolved risks.

### 9. Mistakes to always avoid

Include a concrete anti-pattern catalog covering:

- designing from taste, trends, or a screenshot instead of a verified problem;
- confusing minimal with simple;
- hiding essential actions behind ambiguous icons or gestures;
- inventing terminology;
- using visual hierarchy that contradicts task priority;
- relying on color, hover, animation, or placeholder copy alone;
- missing loading, empty, error, disabled, and destructive-action states;
- breaking keyboard, touch, zoom, screen reader, or reduced-motion use;
- shrinking desktop into mobile instead of redesigning the task;
- stretching mobile into desktop without using the available space;
- creating a beautiful prototype that tests the wrong question;
- overbuilding high-fidelity prototypes before validating structure;
- using unrealistic short copy or idealized data;
- asking leading questions during tests;
- treating stakeholder preference as user evidence;
- shipping without checking actual rendered output at target sizes;
- allowing decorative layers, media crops, or motion to compete with content;
- shipping unverified claims, manipulative patterns, or dark patterns.

### 10. Fidexa application rules

Translate the general principles into Fidexa’s current workflow: Penpot tokens first, bounded content frames, auto-height text, semantic naming, real product media, deliberate desktop/iPad/iPhone boards, production-browser review, geometry checks plus visual review, and adversarial review before sign-off. Preserve the existing boundaries between Fidexa, Rishi, the design system, and case-study pages.

### 11. Reference map

Link every major section to a small number of primary sources. Include source title, organization/author, direct URL, and access/research date. Avoid a long undifferentiated bibliography; sources should explain which claim they support.

## Checklist structure

The checklist will be intentionally short enough to use in a live review:

1. **Problem and evidence** — user, task, context, constraint, success signal.
2. **Flow and information architecture** — entry, orientation, hierarchy, navigation, completion, recovery.
3. **Screen/component quality** — content, layout, states, affordance, feedback, consistency, visual craft.
4. **Desktop review** — resize, density, panes, keyboard, pointer, hover/focus, shortcuts, multi-tasking.
5. **Mobile review** — 393×852 baseline, touch targets, reach, safe areas, keyboard, orientation, no clipping/overflow.
6. **Accessibility** — WCAG 2.2 checks, contrast, focus, semantics, keyboard, zoom, motion, non-color cues.
7. **Prototype review** — hypothesis, fidelity, realistic data, complete states, test task, neutral facilitation, learning log.
8. **Final evidence** — screenshots at target sizes, browser/device review, known tradeoffs, unresolved risks, approval owner.

Each section will contain checkboxes plus “fail if” statements for material defects. The checklist will link back to the handbook for rationale instead of duplicating long explanations.

## Acceptance criteria

- The handbook is a useful canonical reference, not a source dump or generic design essay.
- The handbook includes core UX/UI principles, prototypes, mistakes to avoid, desktop-specific guidance, mobile-specific guidance, responsive guidance, and Fidexa-specific application.
- The checklist can be used independently during design reviews and includes explicit accessibility, responsive, prototype, and evidence gates.
- The documents distinguish source-backed requirements from heuristics and taste/craft guidance.
- Sources are direct links to the selected authorities and include research date.
- Existing Penpot/design-system/process documents are preserved; only links and clearly scoped references are added.
- The writing is direct, memorable, and opinionated enough to guide decisions without turning platform conventions into universal laws.

## Planned files

- Create: `docs/ui-ux-design-principles.md`
- Create: `docs/ui-ux-design-review-checklist.md`
- Modify: `docs/penpot-design-process.md`
- Modify: `AGENTS.md` only if the existing handoff file is available in the worktree; otherwise preserve the prompt-provided project handoff and link from the closest repository-owned design guidance.
