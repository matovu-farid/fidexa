# Fidexa Agent Handoff

This repository contains the Fidexa studio/portfolio site. It is separate from the Rishi product site and from the Rishi, logo, design-system, and case-study design boards. Preserve those boundaries.

## Source of truth

- Visual source: [`fidexa-logo.fig`](/Users/faridmatovu/projects/fidexa/fidexa-logo.fig), Pencil page `Fidexa Site Redesign`.
- Do not delete or merge the Pencil pages `Rishi Site Redesign`, `Fidexa Logo`, `Design System`, or `Case Study — Rishi` while editing the Fidexa site.
- The current implementation is a Next.js app under `src/`; the rendered site, not exported SVGs, is the implementation source of truth.
- The design history is recorded in `docs/superpowers/specs/` and `docs/superpowers/plans/`. Read the latest Fidexa media-pass documents before changing the visual direction.

## Product and route scope

The Fidexa site is a product/studio portfolio for the deployed products. Current routes are:

- `/` — studio homepage: hero, two-engine explanation, selected work, contact.
- `/projects` — the complete 16-project catalog with URL-addressable category filtering.
- `/sms` — customer-care SMS disclosures, opt-in/opt-out language, privacy, and terms links.
- `/api/contact` and `/api/chat` — existing contact and AI-support endpoints.

Do not add a pricing or changelog page unless the product strategy changes. Do not split the homepage into separate “Home”, “Contact”, or individual project-screen designs; use one coherent Fidexa site design plus the necessary catalog and disclosure route.

## Pencil-first workflow

1. Inspect the current Pencil document before editing. Confirm the selected page is `Fidexa Site Redesign`.
2. Review the old Fidexa site at `https://www.fidexa.org/` and the deployed product surfaces before deciding what to preserve.
3. Update the Pencil composition first. The hero must be full-bleed, while its copy keeps readable internal gutters. Featured work should show product proof, not invented dashboard widgets.
4. Save the `.fig` file before implementing code. Record the design decision in a dated spec under `docs/superpowers/specs/`.
5. Implement the approved direction in the existing reusable components and project data model. Avoid broad rewrites when a focused component/data/CSS change is enough.
6. Run a separate adversarial review against old and new screenshots. A review that finds a concrete regression is a required fix loop, not a final opinion.

## Design QA: prevent unreadable copy and overlap

Use these rules for every Pencil page, especially case studies:

- Put each content unit inside a named bounded frame. Use a semantic order such as `eyebrow → heading → body → proof/media`.
- Use width-constrained, height-growing text (`HEIGHT`) for headings and body copy. Fixed-height text boxes are only appropriate for deliberately short labels.
- Use vertical auto-layout and explicit spacing for repeated story units. Avoid manually placing every text layer when the content has a reading order.
- Size with realistic, longest-case copy before approval. Short placeholder copy hides wrapping and overflow failures.
- Keep decorative artwork and intentional overlays separate from content flow. Name intentional overlays `Overlay / ...`; lock background and decorative layers.
- Run Pencil overlap checks for sibling collisions, parent overflow, and intentional overlays as separate passes. A clean geometric result does not prove legibility.
- Export and inspect the actual page at 100% zoom on desktop and mobile. Check heading wrapping, text contrast, parent bounds, media crops, and the first fold.
- Use a fresh adversarial reviewer before saving the final design. If it finds a material readability or hierarchy issue, fix it, export again, and repeat the review.

## Product media provenance

Use real captures from these public deployed surfaces when available:

- Rishi: `https://rishi.fidexa.org/`
- Money Lending / Kaks Credit: `https://money-lending.fidexa.org/home`
- Inventory: `https://inventory.fidexa.org/`

Keep deterministic site assets under `public/projects/`:

- `rishi-library.png` — Rishi library/product showcase.
- `money-lending-showcase.png` — Kaks Credit public product showcase containing its dashboard visual. Do not describe it as an authenticated dashboard unless an authenticated capture is actually obtained.
- `inventory-dashboard.png` — Inventory operational dashboard.

When copying browser captures, verify the files with `file` and convert them to actual PNGs if their extension does not match their bytes. Add meaningful `alt` text, explicit `width`/`height`, and `loading="lazy"` for below-fold media. Use a fixed aspect-ratio frame and `object-fit: cover`; inspect every crop at desktop and mobile sizes.

## Implementation map

- `src/data/projects.ts` — project facts, categories, featured order, media metadata, and external links. Keep all 16 projects in the catalog.
- `src/components/hero.tsx` — full-bleed Fidexa hero and proposition.
- `src/components/what-we-do.tsx` — Client Solutions and Innovation Lab explanation. Preserve substantive copy; it is a useful strength of the old site.
- `src/components/featured-projects.tsx` — homepage featured work and links into the filtered index.
- `src/components/project-card.tsx` — reusable featured/index card. Home may use short featured lines, but `/projects` must retain substantive project descriptions.
- `src/app/projects/page.tsx` — complete catalog and URL-synced category state (`?category=...`).
- `src/app/globals.css` — visual system, full-bleed hero geometry, card media bounds, and responsive rules.
- `src/components/footer.tsx` — only use verified social destinations; never leave a generic placeholder social URL.

## Layout contracts

At minimum, verify these contracts:

- Desktop hero: `.hero-panel.getBoundingClientRect().left === 0` and its width equals the viewport width.
- Mobile hero: the panel and proof card stay within the panel bounds; no child is clipped by `overflow: hidden`.
- Home has exactly three featured media images in this order: Rishi, Money Lending, Inventory.
- No `.project-snapshot` synthetic UI remains in code or DOM.
- `/projects` has 16 projects at `All`; `Web Applications` includes Money Lending, Inventory, and the other web apps; selecting `All` resets the URL and count.
- `document.documentElement.scrollWidth === document.documentElement.clientWidth` at 1280×720 and 390×844.
- Contact, AI dialog, mobile menu, footer links, SMS disclosures, and external project links remain usable.

## Verification workflow

Use the production build for final browser inspection, because an old dev tab can show stale client behavior.

```bash
pnpm exec tsc --noEmit
pnpm build
pnpm start -p 3001
```

With the in-app browser, capture at least:

- 1280×720: homepage hero, homepage studio/work sections, project media, and SMS page.
- 390×844: homepage hero and project media/card layout.

Save temporary review captures under `/private/tmp/fidexa-media-pass-*.png`. Check image `complete && naturalWidth > 0`, hero/media bounds, no overflow, route headings, filter/reset behavior, and browser console errors. Reset any temporary viewport override after testing.

## Adversarial review protocol

Use a fresh separate reviewer. Give it matched old/new screenshots and ask for a PASS/FAIL verdict across:

- proposition clarity;
- Client Solutions / Innovation Lab explanation;
- project proof and media authenticity;
- catalog breadth and discoverability;
- readability and first-fold completeness;
- desktop/mobile bounds and crop quality;
- route/filter/contact/AI regressions.

If it returns FAIL, fix every concrete material finding, rebuild, recapture, and repeat until PASS. The old site’s strengths were a concrete hero proposition, clear two-engine explanation, and dense catalog proof; the new site should retain those while improving identity and tangible product evidence.

## Git hygiene

The workspace may contain unrelated design exports, billing files, screenshots, or interrupted automation state. Inspect `git status` first, stage only files belonging to the current request, and never reset or delete unrelated user changes. Design and implementation commits should identify the scope clearly.
