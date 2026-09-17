# Fidexa Company Profile Design

Date: 2026-09-17
Status: Approved for implementation

## Decision

Add one founder-led company-profile section to the Fidexa homepage. It sits after `WhatWeDo` and before `Contact`, keeps Fidexa—not an individual résumé—as the primary subject, and then names Farid Matovu as the single accountable founder and product engineer behind the studio.

The section will not use a portrait. No portrait in the available portfolio assets has been approved for Fidexa, and an invented or opportunistically reused image would weaken trust. The visual treatment will instead use typography, a concise fact rail, clear external links, and the existing editorial card system.

## Why this direction

The current homepage explains what Fidexa builds and proves it with shipped work, but it does not answer a prospective client’s next trust question: who is accountable for delivery? The profile should answer that without implying an agency-sized team or turning a company site into a personal résumé.

The approved direction is deliberately company-first:

1. Identify Fidexa as an independent Kampala-based software studio working remotely in GMT+3.
2. Describe the studio’s client and innovation-lab work.
3. Explain that Farid Matovu operates Fidexa solo and is directly accountable across the delivery lifecycle.
4. Ground the biography in shipped product evidence.
5. Offer deeper personal context through the portfolio and LinkedIn, while keeping the primary action on Fidexa’s existing contact flow.

## Research synthesis

Three reference patterns informed the decision:

- [Backroom Studio](https://backroomstudio.dev/about) is explicit that it is a one-person product studio and turns that small scale into a direct-accountability advantage. Fidexa should use the same transparency, but keep the company proposition ahead of the founder introduction.
- [Senternet](https://www.senter.net/about) leads with the independent studio and operated products, then identifies its founder. That company-first sequence is the closest structural reference for Fidexa.
- [Intelliwav](https://intelliwav.com/) places selected shipped work before its founder/studio biography. Fidexa already follows this evidence-before-bio order through `FeaturedProjects → WhatWeDo`; the company profile should extend it rather than repeat project cards.

These references are pattern research only. Their claims, metrics, services, and team language are not evidence for Fidexa and must not be copied.

## Approved homepage sequence

The route remains a single coherent studio homepage:

```text
Hero → FeaturedProjects → WhatWeDo → CompanyProfile → Contact → Footer
```

The new section is `04 / Company`. The existing contact eyebrow becomes `05 / Contact`. Navigation remains `Work`, `Studio`, and `Contact`; a new top-level nav item is unnecessary because the profile is contextual trust content, not a new destination.

## Approved content

### Company-first introduction

Eyebrow:

> 04 / Company

Heading:

> A focused studio, with clear accountability.

Support copy:

> Fidexa is an independent software studio based in Kampala and working remotely in GMT+3. It builds and supports products for clients and through its own innovation lab.

### Fact rail

Use three concise facts rather than vanity metrics:

```text
Base             Kampala / Remote GMT+3
Founder experience  7+ years professional delivery
Operating model  Solo founder-led since April 2025
```

### Founder accountability

Label:

> Founder accountability

Heading:

> Farid Matovu leads the work from discovery to support.

Body:

> Farid is Fidexa’s founder and product engineer. Since April 2025, he has operated the studio solo across discovery, design, implementation, deployment, and support.

Proof line:

> Shipped work includes Rishi and client lending and inventory platforms.

Links:

- Primary internal CTA: `Start a conversation ↗` → `#contact`
- Secondary external link: `Farid’s portfolio ↗` → `https://matovu-farid.com`
- Secondary external link: `LinkedIn ↗` → `https://www.linkedin.com/in/matovu-farid/`

The external links open in a new tab and use `rel="noopener noreferrer"`. The contact CTA stays in the current page and uses the existing contact section; no new form, modal, or route is introduced.

## Visual and responsive treatment

The section reuses established primitives so it feels native to the current site:

- Outer section: `.section-rule.section-block` and `.site-shell`.
- Introduction: `.split-heading`, `.eyebrow`, `.section-title`, and `.body-copy`.
- Profile surface: an `.editorial-card` with a dedicated `company-profile-panel` grid.
- Left column: a restrained definition-list fact rail.
- Right column: a dark founder-accountability story panel with the contact CTA and understated text links.

The fact rail and founder story use two columns only at the `1512×982` MacBook target and the `1194×834` iPad landscape target. They stack into one column at `834×1194`, `393×852`, and the `390×844` overflow guard; below `768px`, the action links also stack vertically. Every action retains a usable touch target. Text is height-growing and width-constrained; no fixed-height copy boxes are allowed. Decorative art, portrait space, client-logo rows, and invented data visualizations are intentionally absent.

The Penpot `Fidexa Site Redesign` page must be updated before implementation and reviewed at the project’s primary targets: `1512×982`, `834×1194`, `1194×834`, and `393×852`. `390×844` remains the narrow overflow regression guard.

Before the Penpot milestone is pinned or saved as approved, a fresh reviewer must inspect the exported boards and return an explicit PASS/FAIL verdict for truthful hierarchy, copy legibility, breakpoint behavior, content bounds, and the absence of a portrait placeholder. A FAIL requires correction, re-export, and another fresh review.

The implementation run must append a dated Penpot evidence record to this spec before code work begins. That record must contain the actual opaque board ID for each of the four primary boards, the pinned milestone identifier, every final export path, the independent reviewer’s PASS verdict, and the review date. The executor must paste observed identifiers rather than inventing or leaving generic values.

## Truth and claim policy

The section may state only these verified facts:

- Fidexa is based in Kampala and works remotely in GMT+3.
- Farid Matovu is the founder and product engineer.
- Farid has 7+ years of professional delivery experience. This is labeled `Founder experience`; it must never be presented as Fidexa’s age or years in business.
- Farid has operated Fidexa solo since April 2025.
- His scope covers discovery, design, implementation, deployment, and support.
- Shipped work includes Rishi and client lending and inventory platforms.
- The approved portfolio and LinkedIn destinations are the URLs specified above.

Do not add or imply:

- employees, departments, a multidisciplinary team, or agency scale;
- client logos, client names, testimonials, revenue, user counts, or unverified performance metrics;
- 24/7 availability, guaranteed response times, or support-level promises;
- a chronological résumé, skill inventory, education history, or unrelated employment history;
- AI systems presented as employees or as a substitute for Farid’s accountability;
- a portrait until the user explicitly approves an image and its source.

## Component and file boundaries

- Create `src/components/company-profile.tsx` as a server-rendered presentational component containing the approved facts and links.
- Modify `src/app/page.tsx` only to place `CompanyProfile` between `WhatWeDo` and `Contact`.
- Modify `src/components/contact.tsx` only to renumber its eyebrow from `04` to `05`.
- Add scoped `.company-profile-*` rules to `src/app/globals.css`; do not alter the existing Client Solutions / Innovation Lab content or broadly refactor shared primitives.
- Add `src/components/company-profile.test.ts` as a lightweight Node/Vitest source-contract test for claims, destinations, lack of portrait markup, and homepage order.
- Keep `src/app/layout.tsx` metadata unchanged. Its current title and description are already accurate, company-first, and broader than the new profile; founder-focused metadata would over-weight the individual and is not justified by this homepage section.

## Accessibility and interaction

- Use a semantic `<section id="company">`, one `<h2>` section heading, an `<h3>` founder heading, and a `<dl>` for the facts.
- Keep link labels explicit; do not use ambiguous labels such as “Learn more.”
- Add visible focus treatment for both the contact CTA and the profile’s secondary links.
- Maintain sufficient contrast in the dark story panel using the existing `--paper`, `--dark-muted`, and `--mint` tokens.
- No essential information may depend on color, hover, animation, or an image.

## Verification and acceptance criteria

The feature passes only when all of the following are true:

- Homepage order is exactly `Hero → FeaturedProjects → WhatWeDo → CompanyProfile → Contact`.
- The section presents Fidexa before Farid and identifies the solo operating model without suggesting greater team scale.
- Every factual statement is in the verified claim list above.
- The exact portfolio, LinkedIn, and `#contact` destinations are present and usable.
- No portrait, client logo, invented metric, 24/7 promise, résumé dump, or AI-employee framing appears.
- Client Solutions and Innovation Lab copy remains unchanged.
- Contact is renumbered to `05 / Contact`; existing navigation and anchors remain valid.
- TypeScript, the full Vitest suite, and the production Next.js build pass.
- At `1512×982`, `834×1194`, `1194×834`, `393×852`, and `390×844`, text does not overlap or clip and `document.documentElement.scrollWidth === document.documentElement.clientWidth`.
- Matched baseline/new production captures cover the hero, studio/work composition, featured product media, and SMS route at every required target. Full-page or overlapping captures are acceptable when a section is taller than one viewport, provided the complete section is visible across the evidence set.
- Browser checks confirm the hero is full-bleed on desktop, hero children remain inside the panel on mobile, exactly three featured media images appear in Rishi → Money Lending → Inventory order, all images are complete with positive natural widths and lazy loading, no `.project-snapshot` remains, and viewport overrides are reset after capture.
- Production browser checks confirm the homepage, mobile menu, contact form controls, AI dialog, footer links, `/projects` filtering, and `/sms` disclosures still work with no console errors.
- A fresh Penpot reviewer returns PASS before the design milestone is pinned, and a separate fresh implementation reviewer receives matched baseline/new artifacts and returns PASS on truthfulness, company-first hierarchy, visual legibility, responsive bounds, media integrity, and regression safety. Any concrete FAIL finding is fixed, rebuilt, recaptured, and reviewed again before merge.

## Scope exclusions

This change does not add an About route, team page, portrait, testimonials, customer logos, capability expansion, new navigation item, new contact mechanism, or metadata campaign. It does not rewrite the hero, selected work, or the Client Solutions / Innovation Lab explanation.
