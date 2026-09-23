# Fidexa Design Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a dedicated **Fidexa Design Language** Penpot project containing five connected, governed libraries and validate them through one product, marketing, document, and presentation pilot.

**Architecture:** Keep the current `fidexa` Penpot file as reference and a consumer. Build the source of truth in a new Penpot project with one Foundations library and four profile libraries that consume it: Product Primitives, Brand and Marketing, Documents, and Presentations. Mirror decisions in focused repository artifacts so token values, component contracts, accessibility evidence, releases, and migrations remain reviewable outside screenshots.

**Tech Stack:** Penpot and the Penpot MCP plugin, Penpot design tokens and shared libraries, Fidexa Markdown handbooks, JSON token manifests, browser/CUA project administration, WCAG 2.2 AA review, exported PNG/SVG/PDF evidence.

---

## Delivery boundaries

- The canonical Penpot project is `Fidexa Design Language`.
- The canonical library files are `Fidexa Foundations`, `Fidexa Product Primitives`, `Fidexa Brand and Marketing`, `Fidexa Documents`, and `Fidexa Presentations`.
- The current `fidexa` file and Apartment Manager file are consumers. Do not delete or rewrite their current design-system pages during bootstrap.
- Build from tokens outward. Do not start profile components until the Foundations checkpoint passes.
- Use small `execute_code` mutations and export each affected board after every batch. Do not one-shot a whole page or library.
- Create interactive states as standalone components named `Component / Property=Value` in the canonical file. Native variant grouping may be tested only in a duplicate after persistence is verified.
- External systems are references for behavior and craft. Do not import proprietary Apple, Linear, or other brand assets.
- All stable assets use representative content, semantic layer names, documented ownership, and recorded QA evidence.

## Repository file map

- Modify `docs/superpowers/specs/2026-09-23-fidexa-design-language-design.md` — record the dedicated-project boundary.
- Create `docs/design-language/README.md` — handbook index, project/file links, release state, and adoption path.
- Create `docs/design-language/foundations/tokens.json` — portable global, semantic, and component token source.
- Create `docs/design-language/foundations/token-contract.md` — naming, aliasing, density, theme, and export rules.
- Create `docs/design-language/foundations/typography.md` — type roles, fallbacks, tabular numerals, and content limits.
- Create `docs/design-language/content/voice-and-terminology.md` — cross-profile writing rules and canonical terms.
- Create `docs/design-language/data/data-language.md` — number, table, chart, source, and uncertainty rules.
- Create `docs/design-language/accessibility/qa-matrix.md` — reusable WCAG, responsive, print, and distance gates.
- Create `docs/design-language/governance/contributing.md` — contribution, maturity, exception, deprecation, and ownership workflow.
- Create `docs/design-language/components/product-primitives.md` — migrated canonical product primitive inventory and contracts.
- Create `docs/design-language/profiles/brand-marketing.md` — marketing profile patterns and expression limits.
- Create `docs/design-language/profiles/documents.md` — editorial and print template contracts.
- Create `docs/design-language/profiles/presentations.md` — slide grammar, density modes, and export rules.
- Create `docs/design-language/migrations/pilot-scorecard.md` — four-pilot findings and migration decisions.
- Create `docs/design-language/releases/0.1.0-candidate.md` — candidate inventory, known limits, and publication evidence.
- Create `docs/design-language/evidence/manifest.md` — exported artifact paths, viewport/export settings, dates, and verdicts.
- Create `docs/superpowers/plans/2026-09-23-fidexa-design-language-implementation.md` — this execution plan.

## Penpot project map

### Project: Fidexa Design Language

1. `Fidexa Foundations`
   - `00 · Cover and status`
   - `01 · Color`
   - `02 · Typography`
   - `03 · Space and density`
   - `04 · Grid and layout`
   - `05 · Shape, borders, elevation`
   - `06 · Iconography and marks`
   - `07 · Imagery and illustration`
   - `08 · Motion`
   - `09 · Content and data`
   - `99 · QA playground`
2. `Fidexa Product Primitives`
   - pages `00` through `08` and `99` exactly as defined in the approved product-primitives specification.
3. `Fidexa Brand and Marketing`
   - `00 · Cover and status`, `01 · Identity`, `02 · Type and editorial rhythm`, `03 · Navigation and conversion`, `04 · Hero and openings`, `05 · Proof and case studies`, `06 · Features and pricing`, `07 · Social and campaigns`, `08 · Media and motion`, `99 · QA playground`.
4. `Fidexa Documents`
   - `00 · Cover and status`, `01 · Page foundations`, `02 · Long-form elements`, `03 · Tables and data`, `04 · Invoice`, `05 · Proposal`, `06 · Report`, `07 · Handbook`, `08 · Export and archive`, `99 · QA playground`.
5. `Fidexa Presentations`
   - `00 · Cover and status`, `01 · Slide foundations`, `02 · Openings and sections`, `03 · Statements and comparisons`, `04 · Process and timelines`, `05 · Data and evidence`, `06 · Case study and demo`, `07 · Decisions and closings`, `08 · Deck templates`, `99 · QA playground`.

## Candidate foundation values

These values are the implementation starting point. They become Stable only after component-level contrast and visual review.

| Role | Value | Intended use |
| --- | --- | --- |
| `color.ink.900` | `#101828` | Primary dark surface and content |
| `color.paper.0` | `#FCF9F0` | Warm reading surface |
| `color.cloud.50` | `#F7F2E8` | Canvas and quiet section surface |
| `color.sand.100` | `#ECE2C7` | Warm separation and editorial support |
| `color.slate.600` | `#667085` | Muted content after contrast validation |
| `color.violet.500` | `#7C5CFC` | Identity, focus, selected emphasis |
| `color.mint.500` | `#37D6C0` | Expressive accent and insight, not generic success |
| `color.blue.700` | `#175CD3` | Informational status and links where required |
| `color.green.700` | `#027A48` | Success status |
| `color.amber.700` | `#B54708` | Warning status |
| `color.red.700` | `#B42318` | Danger and destructive status |

Use the existing 4px root spacing scale; control/card/panel/dialog/pill radii of `8/16/20/24/999px`; focus ring width `2px` with `2px` offset; and motion durations `120/200/320ms`. Minimum digital target size is `44×44px`.

## Task 1: Freeze the source-of-truth boundary

**Files:**
- Modify: `docs/superpowers/specs/2026-09-23-fidexa-design-language-design.md`
- Create: `docs/design-language/README.md`
- Create: `docs/design-language/evidence/manifest.md`

- [ ] **Step 1: Record the dedicated Penpot project.**

Add the explicit rule that `Fidexa Design Language` is the source project and that existing Fidexa and Apartment Manager files are consumers. Preserve the five-library architecture and the rule that profile libraries consume Foundations.

- [ ] **Step 2: Create the handbook index.**

Write `README.md` with the core phrase `Calm intelligence, made tangible`, links to the approved specification and all existing principle handbooks, the five canonical Penpot file names, maturity labels `Draft`, `Candidate`, `Stable`, `Deprecated`, and `Retired`, and the adoption order Foundations → profile library → pilot → publication.

- [ ] **Step 3: Create the empty evidence manifest.**

Define one table with columns `Library`, `Page`, `Board or asset`, `Export path`, `Test condition`, `Verdict`, and `Reviewed on`. Seed it with the four audited legacy boards and mark them `Reference only / NEEDS WORK`; do not label them canonical.

- [ ] **Step 4: Verify and commit the boundary.**

Run:

```bash
rg -n "Fidexa Design Language|source of truth|consumer|Fidexa Foundations" docs/superpowers/specs/2026-09-23-fidexa-design-language-design.md docs/design-language/README.md
git diff --check -- docs/superpowers/specs/2026-09-23-fidexa-design-language-design.md docs/design-language/README.md docs/design-language/evidence/manifest.md
```

Expected: the dedicated project and five files are named consistently; no whitespace errors.

Commit only these files with `docs: define Fidexa design language project`.

## Task 2: Create the dedicated Penpot project and five empty libraries

**Files:**
- Modify: `docs/design-language/README.md`
- Modify: `docs/design-language/evidence/manifest.md`

- [ ] **Step 1: Create the project through the signed-in Penpot UI.**

Create one project named exactly `Fidexa Design Language` in the current Fidexa team. Do not rename or move the existing `fidexa` file.

- [ ] **Step 2: Create the five canonical files.**

Inside the project, create the five files from the Penpot project map. Record each file URL and file ID in `README.md`.

- [ ] **Step 3: Establish file covers and numbered pages.**

Open each file, connect the Penpot MCP to it, create the exact numbered page list, and build only a cover board containing file name, purpose, owner `Fidexa Design Language`, maturity `Draft`, version `0.1.0`, and last-reviewed date. Use Paper/Ink only until Foundations is approved.

- [ ] **Step 4: Export and verify every cover.**

Export each cover board. Verify five distinct files exist in one project, page ordering is correct, no content clips, and each cover reports `Draft / 0.1.0`. Add export records to the evidence manifest.

- [ ] **Step 5: Record the project shell.**

Commit the two modified documentation files with `docs: record design language project shell`.

## Task 3: Author the portable foundations contract

**Files:**
- Create: `docs/design-language/foundations/tokens.json`
- Create: `docs/design-language/foundations/token-contract.md`
- Create: `docs/design-language/foundations/typography.md`
- Create: `docs/design-language/content/voice-and-terminology.md`
- Create: `docs/design-language/data/data-language.md`
- Create: `docs/design-language/accessibility/qa-matrix.md`

- [ ] **Step 1: Write the three-tier token manifest.**

Create valid JSON with top-level collections `global`, `semantic`, and `component`. Include the candidate colors above; the 4px spacing scale `0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`; radii `0, 4, 8, 16, 20, 24, 999`; border widths `0, 1, 2`; opacity `0, 0.4, 0.64, 0.8, 1`; motion `120, 200, 320`; and semantic aliases for canvas, surfaces, content, borders, focus, actions, statuses, selection, disabled state, and overlays. Component tokens cover Button, TextField, Card, TableRow, Dialog, and focus ring as the first adoption seam.

- [ ] **Step 2: Write the token contract.**

Define dot-notation, alias-only component binding, light mode as the first implementation, dark and increased-contrast as documented mappings, compact/comfortable/editorial density rules, and the ban on unexplained raw values in Candidate or Stable assets.

- [ ] **Step 3: Define typography roles.**

Specify `display`, `heading`, `title`, `body`, `label`, `caption`, `metric`, and `code`; use Inter or a metrically compatible local sans for UI, an optional approved editorial family only in Brand/Documents/Presentations, and a local mono fallback for code. Record font size, line height, weight, tracking, case, fallback stack, tabular numeral behavior, and maximum intended line length for every role.

- [ ] **Step 4: Define content and data language.**

Write canonical action, status, date, currency, freshness, uncertainty, source, and error language. Include examples for Product, Marketing, Documents, and Presentations. Ban vague errors, unsupported claims, invented metrics, and color-only status communication.

- [ ] **Step 5: Define the cross-profile QA matrix.**

Include WCAG 2.2 AA thresholds, 44px targets, keyboard/focus requirements, 200% zoom, text spacing, reduced motion, grayscale, 393×852, 390×844, 834×1194, 1194×834, 1512×982, A4 and US Letter exports, 16:9 exports, and bright-room/dark-room presentation checks. Use verdicts `PASS`, `NEEDS WORK`, and `FAIL` with the automatic fail conditions from the specification.

- [ ] **Step 6: Validate and commit the contract.**

Run:

```bash
python3 -m json.tool docs/design-language/foundations/tokens.json >/dev/null
rg -n "T[B]D|T[O]DO|implement l[a]ter|#[0-9A-Fa-f]{6}" docs/design-language
git diff --check -- docs/design-language
```

Expected: JSON parses; no placeholders; raw hex values appear only in the global token definitions and explanatory candidate table.

Commit with `docs: add Fidexa foundations contract`.

## Task 4: Build and approve Fidexa Foundations in Penpot

**Files:**
- Modify: `docs/design-language/evidence/manifest.md`
- Create: `docs/design-language/releases/0.1.0-candidate.md`

- [ ] **Step 1: Route the work through `design-system-bootstrap`.**

Use run ID `dsb-2026-09-23-a`. Re-run read-only page and token discovery in the new Foundations file. Use the repository token manifest as input and keep mutations in review mode.

- [ ] **Step 2: Create token sets in small batches.**

Create `Fidexa Global`, `Fidexa Semantic`, and `Fidexa Component` sets. Add color, dimensions, radius, border, opacity, shadow, typography, and motion batches separately. After each batch, run token overview and inspect names/counts before proceeding.

- [ ] **Step 3: Build foundation specimen boards.**

Create token-bound boards for color, typography, spacing/density, grids, shape/borders/elevation, icon sizing, imagery direction, motion curves, and content/data examples. Every specimen shows token name, resolved purpose, permitted use, and misuse where needed.

- [ ] **Step 4: Build the Foundations QA playground.**

Include light surface contrast pairs, focus rings, status combinations, text expansion, tabular numerals, compact/comfortable/editorial density, grayscale, and responsive grid examples. Use real dates, currencies, names, long labels, missing values, and errors.

- [ ] **Step 5: Export, inspect, and correct.**

Export every Foundation page board at 1× and the QA board at 2×. Fail the checkpoint for clipped text, unexplained raw values, contrast below the matrix, inconsistent spacing, or token-name/value disagreement. Correct only concrete findings in another small mutation batch and re-export.

- [ ] **Step 6: Approve the Foundations checkpoint.**

Present the exports and token overview for human review. On approval, change maturity from `Draft` to `Candidate`, publish the Foundations library, add evidence rows and a release inventory, and commit with `design: publish Fidexa Foundations candidate`.

## Task 5: Build Fidexa Product Primitives

**Files:**
- Create: `docs/design-language/components/product-primitives.md`
- Modify: `docs/design-language/accessibility/qa-matrix.md`
- Modify: `docs/design-language/evidence/manifest.md`

- [ ] **Step 1: Migrate the approved primitive specification.**

Convert the Apartment Manager primitive spec into the canonical component inventory in this repository. Preserve the initial-release scope, standalone-state safety rule, token hierarchy, required state contracts, and explicit exclusions.

- [ ] **Step 2: Connect only Fidexa Foundations.**

In `Fidexa Product Primitives`, connect the published Foundations library. Do not connect community component kits. Lucide may remain a reference source only where its license and the icon contract are documented.

- [ ] **Step 3: Build layout, action, and input primitives.**

Build Box, Stack, Inline, Flex, Grid, Divider, ScrollArea specification, FocusRing, Pressable, Button, IconButton, Label, FieldMessage, TextField, SearchField, Select, Textarea, Checkbox, Radio, Switch, and SegmentedControl. Use semantic layers, token bindings, 44px targets, visible focus, real content, and standalone state components.

- [ ] **Step 4: Build navigation, feedback, data, overlay, and composition primitives.**

Build SidebarItem, Tabs, Breadcrumbs, Pagination, StatusBadge, Alert, Toast, Progress, Spinner, Skeleton, EmptyState, Metric, KeyValue, Avatar, Card, ListRow, TableHeader, TableRow, TableCell, Menu, Popover, Tooltip, Dialog, Drawer, Sheet, PageHeader, SectionHeader, Toolbar, FilterBar, FormSection, and responsive app shells.

- [ ] **Step 5: Validate full state and stress matrices.**

Cover default, hover, pressed, focus, disabled, loading, selected, error, read-only, empty, and filled where applicable. Test long labels, long currency values, missing data, localization expansion, compact/comfortable density, mobile transformation, 200% zoom, keyboard order, focus entry/return, Escape behavior, and non-hover action access.

- [ ] **Step 6: Audit tokens and semantic names.**

Run the workflow governance and naming phases. Reject unexplained hardcoded values, generic `Component` names, numbered rectangle/text layers, clipped focus, and duplicate near-components. Export all initial-release state matrices and add evidence.

- [ ] **Step 7: Approve and publish the Candidate library.**

After human review, publish version `0.1.0-candidate` and commit the component contract/evidence with `design: publish Product Primitives candidate`.

## Task 6: Build Fidexa Brand and Marketing

**Files:**
- Create: `docs/design-language/profiles/brand-marketing.md`
- Modify: `docs/design-language/evidence/manifest.md`

- [ ] **Step 1: Define the profile contract.**

Document logo clear space/background rules, editorial type roles, campaign accent limits, truthful proof requirements, screenshot/device treatment, responsive behavior, and where expressive color, illustration, texture, gradient, and motion are permitted.

- [ ] **Step 2: Connect Foundations and build identity assets.**

Connect only Foundations. Build approved logo lockups, clear-space specimens, minimum sizes, color/background combinations, and protected misuse examples from the existing Fidexa logo source; do not redraw or import external brand assets.

- [ ] **Step 3: Build marketing patterns.**

Build Navigation, Hero, ProofBar, FeatureSection, CaseStudyCard, Testimonial, CTA, Pricing, ContactForm, Footer, ProductScreenshotFrame, SocialPost, and CampaignBanner with desktop/mobile layouts and real Fidexa content.

- [ ] **Step 4: Run responsive, content, and accessibility review.**

Test 390×844, 834×1194, and 1512×982; long headings; missing media; image crops; keyboard/focus; form errors; reduced motion; and truthful proof/source labels. Export every pattern family and record verdicts.

- [ ] **Step 5: Approve and publish the Candidate library.**

Publish only after the human checkpoint and commit with `design: publish Brand and Marketing candidate`.

## Task 7: Build Fidexa Documents

**Files:**
- Create: `docs/design-language/profiles/documents.md`
- Modify: `docs/design-language/evidence/manifest.md`

- [ ] **Step 1: Define document foundations.**

Specify A4 and US Letter margins, baseline rhythm, reading measure, paragraph/heading/list/table/figure/note/quotation styles, headers/footers, page numbering, footnotes, widows/orphans, signature treatment, and export metadata.

- [ ] **Step 2: Connect Foundations and build document elements.**

Build Cover, TitlePage, Contents, SectionOpening, BodyPage, Table, Note, Quote, Figure, Appendix, SignatureBlock, and Footer components with print-safe token mappings and grayscale-resilient hierarchy.

- [ ] **Step 3: Build four representative templates.**

Create Invoice, Proposal, Report, and Handbook templates using representative Fidexa content, long tables, page breaks, citations, and missing/optional fields. Do not use interactive UI controls as document decoration.

- [ ] **Step 4: Validate print and archive behavior.**

Export A4 and US Letter PDFs and page PNGs. Check clipping, pagination, table continuation, grayscale, link visibility, font embedding/fallback, selectable text where supported, file naming, and metadata. Record evidence.

- [ ] **Step 5: Approve and publish the Candidate library.**

Publish after the document checkpoint and commit with `design: publish Documents candidate`.

## Task 8: Build Fidexa Presentations and shared data patterns

**Files:**
- Create: `docs/design-language/profiles/presentations.md`
- Modify: `docs/design-language/data/data-language.md`
- Modify: `docs/design-language/evidence/manifest.md`

- [ ] **Step 1: Define the slide grammar.**

Specify a 16:9 grid, title/content/media/footer safe zones, executive/sales/strategy/research/technical density modes, citation placement, speaker-note conventions, and transition limits.

- [ ] **Step 2: Build slide layouts.**

Build Title, Section, Statement, Comparison, Process, Timeline, Data, Quote, CaseStudy, Demo, Decision, and Closing layouts. Each slide has one explicit job and uses Foundations tokens.

- [ ] **Step 3: Build cross-medium data components.**

Build Metric, KPI strip, table, bar, line, area, scatter, distribution, and progress/goal patterns. Every specimen includes scope, unit, date range, freshness, comparison basis, source, and uncertainty where applicable; categorical palettes remain separate from status colors.

- [ ] **Step 4: Build three deck templates.**

Create Executive Brief, Sales Story, and Technical Review templates with narrative order, source notes, and representative data. Do not duplicate report-length prose onto slides.

- [ ] **Step 5: Validate export and distance viewing.**

Export 16:9 PDF and PNG. Review at fit-to-screen and 25% scale in bright-room and dark-room simulations; check contrast, title length, chart legibility, source readability, animation-independent meaning, and print fallback. Record evidence.

- [ ] **Step 6: Approve and publish the Candidate library.**

Publish after the presentation checkpoint and commit with `design: publish Presentations candidate`.

## Task 9: Run four migration pilots

**Files:**
- Create: `docs/design-language/migrations/pilot-scorecard.md`
- Modify: `docs/design-language/evidence/manifest.md`

- [ ] **Step 1: Pilot Product Primitives in Apartment Manager.**

Connect Foundations and Product Primitives to the existing Apartment Manager file. Rebuild one high-value responsive screen without deleting the original. Test 393×852, 834×1194, and 1512×982; record component gaps, local overrides, task clarity, states, and accessibility.

- [ ] **Step 2: Pilot Brand and Marketing in the existing Fidexa file.**

Connect Foundations and Brand and Marketing. Rebuild one existing Fidexa marketing page or Rishi case-study board beside the original. Preserve truthful content and compare responsive hierarchy, proof, conversion clarity, and visual identity.

- [ ] **Step 3: Pilot Documents with the Fidexa invoice.**

Connect Foundations and Documents. Rebuild the existing representative invoice beside the original and export A4 plus US Letter. Check totals, table continuity, addresses, tax/currency formatting, page breaks, signatures, and grayscale.

- [ ] **Step 4: Pilot Presentations with a representative deck.**

Create a concise 8–10 slide Fidexa capabilities deck using Presentations. Include one title, section, comparison, process, data, case study, decision, and closing slide; test screen and PDF export.

- [ ] **Step 5: Score and feed findings back once.**

For every pilot, record `PASS`, `NEEDS WORK`, or `FAIL`; component coverage; token exceptions; accessibility defects; design/code or export gaps; and exact promotion/deprecation decisions. Make one bounded correction pass in the source library, re-export affected assets, and update the scorecard.

- [ ] **Step 6: Commit pilot evidence.**

Commit with `docs: record Fidexa design language pilots`.

## Task 10: Govern, publish, and hand off version 0.1.0

**Files:**
- Create: `docs/design-language/governance/contributing.md`
- Modify: `docs/design-language/releases/0.1.0-candidate.md`
- Modify: `docs/design-language/README.md`
- Modify: `docs/design-language/evidence/manifest.md`

- [ ] **Step 1: Write the contribution and lifecycle contract.**

Document required problem/evidence, why existing assets fail, anatomy/states/responsiveness/accessibility, affected profiles, owners, migration impact, rendered evidence, and QA verdict. Define maturity transitions, semantic versioning, exception expiry/review, deprecation replacement, and release-note requirements.

- [ ] **Step 2: Audit all five libraries.**

Confirm every profile consumes Foundations, no profile forks global tokens, Candidate interactive assets have required states, local component names are semantic, pages match the project map, external asset licenses are recorded, and all evidence links resolve.

- [ ] **Step 3: Publish the coordinated candidate release.**

Publish five `0.1.0-candidate` libraries in dependency order: Foundations, Product Primitives, Brand and Marketing, Documents, Presentations. Record timestamps, file IDs, published library IDs where exposed, known limits, and migration guidance.

- [ ] **Step 4: Run final repository verification.**

Run:

```bash
python3 -m json.tool docs/design-language/foundations/tokens.json >/dev/null
rg -n "T[B]D|T[O]DO|implement l[a]ter|fill in d[e]tails|Similar to T[a]sk" docs/design-language docs/superpowers/plans/2026-09-23-fidexa-design-language-implementation.md
rg -n "Fidexa Foundations|Fidexa Product Primitives|Fidexa Brand and Marketing|Fidexa Documents|Fidexa Presentations" docs/design-language
git diff --check -- docs/design-language docs/superpowers/specs/2026-09-23-fidexa-design-language-design.md docs/superpowers/plans/2026-09-23-fidexa-design-language-implementation.md
```

Expected: token JSON parses; no placeholders; all five libraries appear in the handbook, release, and evidence records; no whitespace errors.

- [ ] **Step 5: Run final visual and structural verification.**

Export every `00` cover and `99` QA playground plus the four pilot boards. Confirm no clipping, no missing fonts, visible focus, correct semantic names, correct maturity/version, and traceable token usage. A final PASS requires all automatic-fail conditions to be absent and every remaining NEEDS WORK item to have an owner and release target.

- [ ] **Step 6: Commit the release record.**

Commit only design-language documentation with `design: release Fidexa design language 0.1.0 candidate`.

## Final acceptance checklist

- [ ] The dedicated `Fidexa Design Language` project exists and contains exactly five canonical library files.
- [ ] Foundations is the only source of shared tokens, styles, marks, and cross-profile rules.
- [ ] Product, marketing, document, and presentation assets are profile-specific without becoming unrelated visual systems.
- [ ] Candidate assets have semantic names, token bindings, maturity labels, owners, usage guidance, and evidence.
- [ ] Interactive components include required states, 44px targets, visible focus, non-color cues, and recovery behavior.
- [ ] Product, marketing, document, and presentation pilots pass their relevant gates.
- [ ] Proprietary external assets are absent; reference licenses and sources are recorded.
- [ ] Repository manifests, Penpot files, published versions, exports, and pilot scorecards agree.
- [ ] The current `fidexa` and Apartment Manager files remain intact except for additive pilot boards and library connections.
