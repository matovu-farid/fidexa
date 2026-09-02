# Farid Matovu Portfolio — Pencil Redesign

## Goal

Add a single, organized Pencil page that redesigns the personal portfolio app without changing the existing Fidexa or Rishi design pages. The new page must represent every public route family in the portfolio app and show a credible mobile composition.

## Source inventory

The authoritative app is `/Users/faridmatovu/projects/portfolio/apps/portfolio`. The App Router currently exposes:

- `/` — personal landing page with capabilities, selected work, experience preview, and contact CTA.
- `/projects` — featured projects, full catalog, search, category filters, and pagination.
- `/projects/rishi`, `/projects/money-lending`, `/projects/inventory-trade`, `/projects/maria`, `/projects/scrap-platform`, `/projects/case-medinsurance`, `/projects/painter`, and `/projects/apartment-manager` — eight generated case-study routes using one shared template.
- `/experience` — three employment cards.
- `/contact` — name, email, message, submit state, and email delivery action.

The design must not invent additional public pages. The eight case-study routes are represented as content states of one reusable case-study template, with a route matrix naming each real project.

## Pencil structure

Create exactly one new page in `fidexa-logo.fig` named `Portfolio Site Redesign`. Keep the existing five pages unchanged. The new page contains one top-level board named `Farid portfolio redesign board`; all route designs are organized as non-overlapping sections inside that board.

The board uses a 1800px canvas and vertical sections with explicit page coordinates and spacing:

1. `01 Portfolio Home / desktop` — 1640×820.
2. `02 Projects Index / desktop` — 1640×1040.
3. `03 Case Study Template / desktop` — 1640×1160.
4. `04 Experience / desktop` — 1640×620.
5. `05 Contact / desktop` — 1640×620.
6. `06 Responsive check / mobile` — 1640×1120, containing four actual 390×844 frames: `Mobile Home`, `Mobile Projects`, `Mobile Case Study`, and `Mobile Contact`. The frames sit at page x positions 90, 500, 910, and 1320, leaving 20px gaps and 10px side margins inside the 1640px section.

No visible canvas annotations such as `390×844`, `RESPONSIVE CHECK`, `LAYOUT NOTES`, or `NOT IN PRIMARY NAV` may appear inside the product-facing frames. Mobile frame footer labels use product language such as `FARID MATOVU`, `PROJECT INDEX`, `CASE STUDY`, and `CONTACT`.

## Visual direction

Use a distinct personal identity that shares the discipline of the Fidexa system without looking like a Fidexa studio page:

- Ink: `#151821`.
- Paper: `#F7F4EE`.
- Warm panel: `#E9E0D1`.
- Violet: `#6F55E8`.
- Mint: `#36D6BF`.
- Slate: `#667085`.
- White: `#FFFEFA`.
- Typeface: Inter with bold display headlines, compact uppercase labels, and readable body copy.

The visual idea is `systems that ship`: calm paper surfaces, one dark proof panel, evidence-led project previews, and a small geometric FM mark. Violet identifies software/product work; mint identifies systems/AI work; warm panels hold biography and experience content.

## Route designs

### Home

Show `Farid Matovu`, `FULL-STACK · POLYGLOT · SYSTEMS THINKER`, and the existing value proposition `I build complete systems that ship.`. Include primary `View projects` and secondary `Get in touch` actions, a proof strip for projects/languages/years, four capability cards, three selected project previews, and a compact experience rail. The content must remain faithful to the current app: Native Apple Delivery, Backend & APIs, AI & Automation, and DevOps & Infra.

### Projects index

Show `Work with a point of view.` with a filter/search header and the real category labels: AI & Automation, Native Apple Apps, Cross-Platform Apps, Web Applications, and Developer Tools. Use an evidence-first grid with the exact featured titles `Rishi`, `Money Lending Management System`, `Inventory and Trade Management System`, and `Maria`, followed by smaller catalog entries. Represent the full 18-project catalog with the remaining exact project titles in a compact index strip; do not hard-code a project-count claim.

### Case-study template

Design the shared detail anatomy: back to projects, category/year, project title and value statement, hero evidence panel, optional screenshots/demo slot, narrative, evolution slot when available, technology chips, key decisions, external links, and previous/next navigation. Add a compact route matrix inside the section listing the exact eight real case-study project names—`Rishi`, `Money Lending Management System`, `Inventory and Trade Management System`, `Maria`, `AI Scraping Ecosystem`, `CaseMedInsurance`, `Painter`, and `Apartment Manager`—so coverage is explicit without creating eight duplicate artboards.

### Experience

Show `Work experience` with three timeline/card entries: Dabble Lab, Microverse, and Sustainable and Greener World. Use the same factual periods and summaries from the current route, with a calm vertical rhythm and no resume claims that are not already in the app.

### Contact

Show `Let’s build the useful part.` with name/email/message fields, `Send message`, the current response/error state slot, and the existing email action. Add a side card with `Tell me what you are building.` and a compact list of the existing capability themes. Do not imply that the form behavior or response time has changed.

### Mobile

Use real 390×844 frames with a compact header, full-width primary actions, 28–32px headlines, 16px page padding, 16px card gaps, and no horizontal overflow. Show the default search field, `All` filter, and first-page pagination as static states. The mobile case-study frame must preserve the hierarchy of the desktop template while prioritizing the title, hero evidence, narrative, and one primary external action; when a project has no public URL, show a truthful `No public link` state instead of inventing an action. Show the contact form in its empty/default state with a separate success/error state chip.

## Acceptance criteria

- The existing five Pencil pages remain present and named exactly as before.
- One new `Portfolio Site Redesign` page exists with one organized board.
- Every route in the source inventory is represented: the homepage, projects index, all eight case studies, experience, and contact; all 18 project names are represented in the index treatment.
- The desktop sections do not overlap; the four mobile frames are exactly 390×844.
- The four mobile frames fit within the responsive section with 20px gaps and no child overflow.
- No visible design-frame metadata or stale starter copy appears in product-facing frames.
- Desktop and mobile renders are visually reviewed by an independent adversarial reviewer and reach PASS.
- The edited Pencil file is saved to `/Users/faridmatovu/projects/fidexa/fidexa-logo.fig`.
