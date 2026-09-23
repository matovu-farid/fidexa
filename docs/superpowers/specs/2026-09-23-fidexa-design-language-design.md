# Fidexa Design Language

## Status

Approved direction. This specification defines a modern, cross-medium design language for every Fidexa expression: digital products, marketing, brand communications, editorial documents, reports, invoices, presentations, prototypes, and future physical or spatial applications.

The existing Fidexa design-principle handbooks remain the detailed authorities. This document connects them into one operating system and defines how the language is packaged, governed, and applied.

## Purpose

Fidexa should feel recognizably itself without forcing every surface to look identical. The language exists to make work clear, useful, trustworthy, accessible, and crafted while giving each medium enough freedom to do its job well.

The language must:

- help people understand, act, recover, and trust;
- give teams a shared vocabulary for decisions;
- make high-quality defaults easy to reuse;
- preserve coherent identity across different products and media;
- let meaningful contextual differences remain visible;
- connect design intent to Penpot assets, implementation tokens, content, and QA evidence.

## Canonical principles

The existing Fidexa handbooks are incorporated by reference:

- [UI/UX Design Principles](../../ui-ux-design-principles.md)
- [Layout and Grid](../../ui-layout-grid-principles.md)
- [Visual Hierarchy](../../ui-visual-hierarchy-principles.md)
- [Spacing](../../ui-spacing-principles.md)
- [Color](../../ui-color-principles.md)
- [Typography](../../ui-typography-principles.md)
- [Consistency](../../ui-consistency-principles.md)
- [Contrast](../../ui-contrast-principles.md)
- [Polish and Details](../../ui-polish-details-principles.md)
- [Shape Language](../../ui-shape-language-principles.md)
- [Imagery and Icons](../../ui-imagery-icons-principles.md)
- [UI/UX Review Checklist](../../ui-ux-design-review-checklist.md)

When guidance conflicts, resolve it in this order:

1. user safety, agency, accessibility, truth, and applicable requirements;
2. the task and evidence;
3. target-platform conventions;
4. Fidexa semantic consistency;
5. craft heuristics and expressive preference.

## Core idea

**Calm intelligence, made tangible.**

Fidexa helps complex work become understandable and actionable. Its design should feel composed, precise, humane, and quietly confident. It should never confuse decoration with quality or minimal appearance with simple use.

### Character

| Trait | Expression | Failure mode to avoid |
| --- | --- | --- |
| Clear | Plain language, legible hierarchy, explicit state and scope | Sterile oversimplification or missing context |
| Composed | Stable grids, bounded content, restrained attention | Empty luxury spacing or rigid symmetry |
| Intelligent | Useful context, truthful data, progressive detail | Complexity performed as sophistication |
| Humane | Warm neutrals, considerate feedback, recovery and agency | Cuteness, patronizing copy, or decorative friendliness |
| Precise | Alignment, terminology, values, states and evidence agree | Brittle perfection that clips real content |
| Distinctive | Confident proportion, editorial moments, selective accent | Trend copying, gradients everywhere, or branded controls that break convention |

## Design axioms

1. **Purpose before interface.** Name the person, context, task, evidence, and outcome before choosing a form.
2. **Structure before decoration.** Layout, reading path, hierarchy, content, and state must work without atmosphere.
3. **The first useful thing comes first.** Initial attention belongs to orientation, decision, action, or proof.
4. **Quiet is a hierarchy level.** Neutral surfaces and supporting content create room for priority.
5. **Tokens before components; components before compositions.** Reuse decisions at the lowest responsible level.
6. **Shape communicates role.** Controls, cards, panels, dialogs, tags, and decoration do not share one indiscriminate radius.
7. **Color has a budget.** Accent is earned by identity, interaction, insight, or real status.
8. **Type carries the voice.** Hierarchy and rhythm should remain strong without excessive color or effects.
9. **Real content is a design material.** Use representative names, dates, currencies, errors, data, images, and translations.
10. **Every action has a truthful response.** Pressed, loading, success, partial, stale, offline, permission, and failure states are designed.
11. **Accessibility is construction.** Semantics, contrast, focus, keyboard, touch, zoom, reflow, reduced motion, and alternatives are part of the component contract.
12. **Polish follows truth, task, structure, and response.** Atmosphere is the last layer.

## Federated architecture

The language has one shared core and four specialized profiles. Profiles consume the core but adapt density, expression, composition, and interaction to their medium.

### Fidexa Core

Shared across every profile:

- principles and character;
- naming and terminology;
- brand marks and protected clear space;
- color primitives and semantic roles;
- typography families and role scales;
- spacing, grid, shape, border, elevation, motion, and icon systems;
- imagery and illustration direction;
- accessibility requirements;
- content voice and writing conventions;
- data-truth and evidence rules;
- governance and QA.

### Product Experience profile

For web applications, desktop tools, dashboards, mobile applications, and authenticated workspaces.

The profile prioritizes clarity, efficiency, scanability, state visibility, responsive transformation, keyboard and touch behavior, and recoverability. It uses a calm UI family, restrained surfaces, semantic statuses, productive density, and reusable components.

### Brand and Marketing profile

For Fidexa websites, campaigns, social media, case studies, announcements, and product storytelling.

The profile permits a stronger display voice, wider expressive color moments, editorial composition, art direction, product proof, and purposeful motion. Conversion patterns remain honest; expression never outranks comprehension or evidence.

### Editorial and Documents profile

For proposals, reports, invoices, handbooks, research, company profiles, contracts, and printable material.

The profile prioritizes reading measure, document hierarchy, tables, footnotes, pagination, signatures, print contrast, archival integrity, and export resilience. It uses fewer interactive metaphors and more explicit document structure.

### Presentations profile

For executive, sales, strategy, research, and technical decks.

The profile prioritizes narrative sequence, one-slide purpose, distance legibility, visual pacing, charts, evidence, speaker support, and export behavior. It defines executive, sales, and technical density modes without creating unrelated visual systems.

## Inspiration policy

Fidexa synthesizes proven decisions while protecting its identity and respecting licenses.

| Source | Adopt as learning | Reject |
| --- | --- | --- |
| Apple | Ergonomics, platform conventions, icon/text alignment, focus, sheets, dialogs, touch and native adaptation | Proprietary assets or platform materials outside licensed Apple-platform mockups |
| Linear | Dense operational hierarchy, dimmed chrome, stable headers, alignment, restrained theme use, cross-view stress testing | Direct visual cloning, brand assets, or proprietary product artwork |
| Radix | Accessible behavior, keyboard contracts, focus management, composable anatomy | A visual identity; Radix is behavioral infrastructure |
| Atlassian | Box, Stack, Inline, Flex, Grid, Pressable, Focusable and tokens-first composition | Atlassian branding and product-specific metaphors |
| GitHub Primer | Dense forms, tables, status patterns, open primitives and developer-product rigor | GitHub branding and repository-specific language |
| IBM Carbon | Enterprise data display, productive density, grids, charts, and accessibility discipline | IBM visual identity or indiscriminate enterprise heaviness |
| Vercel Geist | Color-role ladders, typography roles, component usage guidance, material restraint | Monochrome imitation or developer-tool styling everywhere |
| Adobe Spectrum | Global, alias, and component token tiers; platform scale modes; explicit state tokens | An exhaustive component inventory without Fidexa use cases |
| Material 3 | Adaptive layout, state modeling, familiar mobile behavior, and systematic theming | Material appearance as the default Fidexa brand |
| Penpot Pencil and community kits | Native Penpot organization and component-library mechanics | Wholesale imports or inherited styling |

## Foundations

### Color

The color system begins with calm neutral reading fields, then assigns accents to identity, action, insight, and semantic status.

The recognizable starting primitives remain Ink, Paper, Cloud, Violet, Mint, Sand, and their tonal partners. Their current values are provisional until component-level review. Violet and Mint are expressive accents, not generic body-text colors or substitutes for success, danger, or warning.

Color tokens use three layers:

1. global ramps such as `color.neutral.900`;
2. semantic aliases such as `content.primary` or `action.primary.bg`;
3. component tokens such as `button.primary.hover.bg`.

Light, dark, increased-contrast, and product-theme mappings are related systems rather than color inversions.

### Typography

The system defines jobs before fonts:

- one highly legible UI family for controls, navigation, forms, data, and operational content;
- an optional display/editorial family for earned brand moments;
- a mono family only for code, identifiers, logs, and technical strings;
- intentional fallback stacks and language coverage;
- tabular numerals for comparable financial and operational data.

Roles include display, heading, title, body, label, caption, metric, and code. Each role includes family, size, line height, weight, tracking, case, and intended use. Sentence case is the default. Thin essential text, arbitrary local sizes, and fixed-height text containers are forbidden.

### Spacing and density

All spacing uses the existing 4px-root scale. Space expresses relationship, not decoration.

The language defines:

- compact, comfortable, and editorial density mappings;
- icon-to-label, internal, component, section, and page spacing roles;
- minimum interactive target and focus clearance;
- desktop and mobile transformations that preserve meaning.

### Layout and grid

Every content unit has a semantic container, bounds, overflow contract, and reading position. Constraints, flex, grid, intrinsic sizing, and auto layout are preferred over coordinates.

Profiles use different recipes:

- product workspace: navigation plus flexible workspace and optional inspector;
- dashboard: summary, diagnosis, then action/detail;
- marketing/editorial: bounded reading field plus wider proof/media rail;
- documents: printable page grid with stable margins and pagination;
- presentations: slide grid with safe title, content, media, and footer zones.

### Shape

The semantic shape scale distinguishes:

- low-radius dense and technical surfaces;
- control radius;
- card and panel radius;
- dialog and sheet radius;
- full pills for short tags, statuses, and segmented controls only;
- circles for avatars, status marks, and icon controls.

Large rounded rectangles are not the default personality. Shape never substitutes for hierarchy, affordance, or label.

### Borders, elevation, and materials

Use the lowest effective treatment. Prefer tonal separation and borders before shadows; reserve elevation for actual layering. Blur, glass, glow, gradients, and P3 color require a semantic purpose and a stable accessible backing surface.

### Iconography

Fidexa uses one icon language with consistent grid, stroke, corner, optical weight, baseline, and state behavior. Icons clarify or accelerate; unfamiliar and high-stakes actions retain visible labels. Icon-only controls require accessible names, tooltips where useful, and 44px hit areas.

### Imagery and illustration

Images prove, orient, or carry appropriate emotion. Product imagery is authentic and traceable. Crops are deliberate; aspect ratios are stable; alt text and performance behavior are specified. Decorative stock imagery, invented product evidence, and images used to fill empty space are rejected.

Illustration uses a restrained family derived from Fidexa geometry and color, with explicit roles for explanation, empty states, education, and brand storytelling.

### Motion

Motion communicates cause, continuity, hierarchy, or feedback. Frequent interactions remain fast and interruptible. Duration, easing, distance, and reduced-motion alternatives are tokenized. Motion never delays access, hides failure, or becomes the only state cue.

## Content language

Fidexa writes with calm confidence.

- Use concrete verbs and familiar nouns.
- Name the object and consequence of an action.
- Keep terminology stable across media.
- State uncertainty, automation, permissions, freshness, and limitations honestly.
- Put guidance and recovery near the relevant moment.
- Confirm actual outcomes rather than clicks.
- Avoid inflated claims, clever navigation labels, manipulative urgency, blame, and vague errors.

Marketing may be more expressive, but it remains specific and evidence-backed. Product copy is concise and operational. Documents are formal without becoming bureaucratic. Presentations optimize for spoken support rather than duplicating a report.

## Product primitives and components

The standalone Penpot library **Fidexa Product Primitives** is the Product Experience implementation of this language. Its architecture is currently defined in the approved Product Primitives specification in the Apartment Manager project. That specification will be migrated into this repository during Phase 1 so the design-language record is self-contained.

The first release covers:

- layout primitives: Box, Stack, Inline, Flex, Grid, Divider, ScrollArea, FocusRing, Pressable;
- actions: Button and IconButton;
- fields: Label, FieldMessage, TextField, SearchField, Select, Textarea, Checkbox, Radio, Switch;
- navigation: SidebarItem, Tabs, Breadcrumbs, Pagination;
- feedback: StatusBadge, Alert, Toast, Progress, Spinner, Skeleton, EmptyState;
- data display: Metric, KeyValue, Avatar, Card, ListRow, TableHeader, TableRow, TableCell;
- overlays: Menu, Popover, Tooltip, Dialog, Drawer, Sheet;
- compositions: PageHeader, SectionHeader, Toolbar, FilterBar, FormSection, responsive app shells.

Components document purpose, anatomy, content, variants, states, responsive behavior, accessibility, implementation semantics, and when not to use them.

## Brand and marketing system

The marketing profile defines:

- logo lockups, clear space, minimum size, and background behavior;
- display typography and editorial rhythm;
- campaign and product-accent color modes;
- hero, proof, feature, case-study, testimonial, CTA, pricing, contact, and footer patterns;
- product screenshot and device-framing rules;
- illustration, photography, texture, gradient, and motion art direction;
- social formats and responsive website contracts;
- truthful conversion language and proof requirements.

Expression is concentrated at openings, transitions, proof moments, and memorable conclusions. Ordinary navigation, forms, legal content, and conversion controls remain familiar and accessible.

## Editorial and document system

The document profile defines:

- A4, US Letter, and digital reading templates where needed;
- cover, title page, contents, section, body, table, note, quotation, figure, appendix, signature, and footer patterns;
- invoice, proposal, report, handbook, research, and company-profile templates;
- long-form type measure, footnotes, page breaks, widows/orphans, tables, and chart behavior;
- print-safe colors, grayscale resilience, export metadata, file naming, and archival requirements.

Documents favor durable reading and evidence over interface decoration.

## Presentation system

The presentation profile defines:

- 16:9 primary and print/export-safe variants;
- title, section, statement, comparison, process, timeline, data, quotation, case-study, demo, decision, and closing layouts;
- executive, sales, strategy, research, and technical density modes;
- chart and table simplification for distance viewing;
- speaker-note and source-citation behavior;
- motion and transition limits;
- dark-room and bright-room contrast checks.

Every slide has one job. Decks create a narrative sequence rather than a set of decorated documents.

## Data language

Data is presented truthfully and consistently across products, reports, marketing proof, and presentations.

- Define scope, unit, time range, freshness, comparison, source, and uncertainty near the value.
- Use tabular numerals where comparison matters.
- Choose charts from the analytical question.
- Use semantic status colors separately from categorical data palettes.
- Do not imply precision that the source does not support.
- Provide non-color cues and text/table alternatives for important information.
- Preserve definitions and number formatting across media.

## Accessibility baseline

The language targets WCAG 2.2 AA for applicable digital work and treats it as a floor.

- normal text: at least 4.5:1;
- large text and meaningful controls/graphics: at least 3:1 where applicable;
- interactive targets: at least 44×44px;
- visible, unclipped focus;
- keyboard, touch, pointer, screen-reader, zoom, reflow, text-spacing, reduced-motion, grayscale, and increased-contrast review;
- persistent labels, non-color cues, meaningful reading order, alt text, captions, and accessible document exports;
- platform accessibility conventions preserved in native contexts.

## Asset and token architecture

The design language will live in a dedicated Penpot project named **Fidexa Design Language**. That project is the governed source of truth; product, marketing, document, and presentation files outside it are consumers and migration pilots, not authorities.

The project will contain separate, connected Penpot library files:

1. **Fidexa Foundations** — tokens, typography, color styles, grids, icons, marks, motion and guidance.
2. **Fidexa Product Primitives** — reusable product components and compositions.
3. **Fidexa Brand and Marketing** — campaign, site, social, case-study, imagery and expressive patterns.
4. **Fidexa Documents** — document templates and editorial assets.
5. **Fidexa Presentations** — slide components, layouts, charts and deck templates.

Separating libraries prevents product files from loading every brand or document asset while keeping all profiles connected to the same foundations.

The existing `fidexa` Penpot file remains a reference and the first brand/marketing pilot. Its current Design System page is not promoted to the canonical library. Canonical assets are rebuilt in the dedicated project, reviewed there, and only then connected back to consumer files.

## Governance

### Decision ownership

- Foundations require design-language-owner review.
- Component changes require design, engineering, accessibility, and affected-product review proportional to risk.
- Content terminology changes require a named language decision.
- Profile-specific exceptions remain local unless promoted through evidence.

### Contribution contract

Every proposed addition states:

- problem, users, context and evidence;
- why an existing token, component, or pattern is insufficient;
- anatomy, states, responsive behavior and accessibility;
- content examples and limits;
- affected profiles and implementation owners;
- migration and deprecation impact;
- rendered evidence and QA result.

### Versioning and maturity

Assets are labeled Draft, Candidate, Stable, Deprecated, or Retired. Stable assets have documented ownership, usage, states, accessibility, implementation mapping, and evidence. Deprecated assets include replacement and migration guidance.

### Exceptions

An exception records the user problem, difference, benefit, scope, owner, expiry or review condition, and accessibility impact. Screenshot preference is not evidence.

## Evidence and QA

Review follows the existing Fidexa verdicts:

- **PASS** — the tested scope supports the task and evidence is recorded;
- **NEEDS WORK** — usable, with named non-blocking defects;
- **FAIL** — a blocking task, truth, accessibility, clipping, state, or evidence defect exists.

Automatic fail conditions include material accessibility failures, false or unsupported content, clipping/overflow, missing critical states, and inability to complete or recover from the core task.

Representative target reviews include 393×852 mobile, 390×844 narrow guard, 834×1194 tablet portrait, 1194×834 tablet landscape, and 1512×982 desktop where relevant, plus print/export tests for documents and distance tests for presentations.

## Deliverables

1. Master design-language handbook and decision map.
2. Fidexa Foundations Penpot library.
3. Fidexa Product Primitives Penpot library.
4. Brand and Marketing Penpot library.
5. Document templates library.
6. Presentation templates library.
7. Content voice and terminology guide.
8. Data-visualization guide and components.
9. Accessibility and QA matrices.
10. Governance, contribution, versioning, and deprecation documentation.
11. Design-to-code token exports and implementation mapping.
12. Migration pilots for one product screen, one marketing page, one document, and one presentation.

## Phased rollout

### Phase 1 — Core language and foundations

Consolidate principles, finalize character, audit current assets, establish tokens, type, color, spacing, grid, shape, icons, imagery, motion, content voice, and QA rules.

### Phase 2 — Product primitives

Build and validate the standalone product component library. Pilot it in Apartment Manager before wider migration.

### Phase 3 — Brand and marketing

Build expressive patterns and migrate one Fidexa marketing page or case study as a pilot.

### Phase 4 — Editorial and documents

Build templates and migrate one representative proposal, report, or invoice.

### Phase 5 — Presentations and data language

Build slide layouts and cross-medium charts; migrate one representative deck.

### Phase 6 — Publish and govern

Publish connected libraries, documentation, contribution flow, versioning, release notes, implementation mapping, and adoption guidance.

## Acceptance criteria

- The shared character and axioms are recognizable across all four profiles.
- Every profile inherits the same foundations without forcing identical compositions.
- Tokens use global, semantic, and component tiers with no unexplained raw values in stable assets.
- Stable interactive components include required states and accessibility contracts.
- Content, data, icons, imagery, motion, and responsive behavior have documented rules.
- Penpot libraries remain modular and connected.
- Product, marketing, document, and presentation pilots pass their relevant QA gates.
- Copyright and licenses are respected; proprietary external assets are not copied into Fidexa libraries.
- Exceptions, maturity, ownership, migration, and deprecation are visible.
- The language can be implemented in code and exported formats without relying on screenshots as specifications.

## Explicit exclusions

- A single visual skin forced across every medium.
- Wholesale import of another company's UI kit or visual identity.
- Copying Apple, Linear, or other proprietary assets.
- Creating every conceivable component before a demonstrated need.
- Rebuilding all existing work before representative pilots validate the language.
- Treating a Penpot file, screenshot collection, token list, or component inventory alone as the design language.
