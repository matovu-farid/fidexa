# Fidexa Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved Fidexa site direction from the Penpot `Fidexa Site Redesign` page in the existing Next.js app, preserving the complete project catalog and working contact/SMS flows while making the rendered site visually coherent at MacBook, iPad, and iPhone sizes.

**Architecture:** Keep the existing route and data model. Make the homepage a single editorial flow—embedded dark hero, selected work with real product captures, two-engine studio explanation, contact form, and footer. Keep `/projects` as the full 16-project catalog and `/sms` as the disclosure route. Use shared CSS contracts for full-bleed hero geometry, media frames, bounded copy, and responsive grids; do not create separate page-specific mockups or duplicate project data.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS v4, Lucide icons, existing shadcn form primitives, Penpot-approved palette and typography.

---

## 1. Capture the implementation baseline and preserve scope

- [ ] Inspect `git status --short --branch` and keep unrelated design exports, billing files, and interrupted automation state untouched.
- [ ] Confirm the implementation files in scope are `src/app/page.tsx`, `src/app/globals.css`, `src/components/nav.tsx`, `src/components/hero.tsx`, `src/components/what-we-do.tsx`, `src/components/featured-projects.tsx`, `src/components/project-card.tsx`, and `src/components/contact.tsx`.
- [ ] Preserve `src/data/projects.ts`, the `/projects` 16-project catalog, `/sms`, `/api/contact`, `/api/chat`, and the existing real media files in `public/projects/` unless verification proves a focused correction is necessary.
- [ ] Inspect and activate the current Penpot `Fidexa Site Redesign` page through the connected MCP, compare the approved composition with the deployed old Fidexa surface and product URLs, run the available MCP structural checks, and use the already-approved folded-F/logo milestone as the visual handoff.

## 2. Align the homepage structure to the approved Penpot composition

- [ ] Update `src/components/nav.tsx` to accept an `embedded` presentation for the homepage hero while retaining the paper/sticky presentation on `/projects` and `/sms`; keep keyboard Escape handling, current-route state, mobile menu behavior, and accessible labels.
- [ ] Update `src/components/hero.tsx` to render the embedded nav inside a full-width dark hero, use the approved proposition “Operational software for teams outgrowing spreadsheets.”, retain a clear primary request CTA, and replace the generic proof box with a deliberate folded-F/orbit visual and concise client/own-product proof labels.
- [ ] Update `src/app/page.tsx` to render the homepage in Penpot order: `Hero`, `FeaturedProjects`, `WhatWeDo`, `Contact`, `Footer`, with no duplicate standalone nav.
- [ ] Keep homepage navigation targets and route links usable on both desktop and mobile.

## 3. Make project proof tangible and keep the catalog substantive

- [ ] Update `src/components/featured-projects.tsx` and `src/components/project-card.tsx` so home shows exactly three featured cards in Rishi, Money Lending, Inventory order with real media, short value propositions, readable titles, technology metadata, and verified external links.
- [ ] Hide the long catalog description from the homepage card treatment when a short featured value exists; retain full substantive descriptions in `/projects` by continuing to render cards with `context="index"` there.
- [ ] Preserve fixed-ratio media frames, meaningful alt text, explicit rendered `width`/`height` attributes, `loading="lazy"` on below-fold media, and no synthetic `.project-snapshot` UI.
- [ ] Keep category links discoverable from the selected-work section without adding pricing or changelog routes.

## 4. Translate the two-engine Penpot section into bounded, readable content

- [ ] Update `src/components/what-we-do.tsx` to use the approved “One studio. Two engines.” hierarchy and show Client Solutions plus Innovation Lab cards.
- [ ] Add the three bounded, ordered process rows per card—discover/build/launch for client systems and research/shape/ship for products—with explicit semantic copy and no manually overlapping text.
- [ ] Preserve the old site’s useful substantive explanation of client systems, product work, and Rishi while keeping each text unit width-constrained and height-growing.

## 5. Implement the responsive visual system and layout contracts

- [ ] Update `src/app/globals.css` to match the approved ink/paper/sand/mint/violet system, with the hero spanning the viewport width and internal content gutters instead of a narrow centered panel.
- [ ] Add explicit embedded-nav, hero visual, process-row, featured-card, and contact-form styles; use `overflow: hidden` only on decorative hero/media containers whose children are proven to stay within bounds.
- [ ] Keep real images in fixed aspect-ratio frames with `object-fit: cover`, readable captions, and predictable crop behavior.
- [ ] Define responsive behavior for the required targets: iPhone `393×852`, iPad portrait `834×1194`, iPad landscape `1194×834`, and MacBook `1512×982`; keep `390×844` as an overflow regression guard.
- [ ] Ensure mobile uses a single-column reading order, a real mobile menu, non-overlapping hero artwork, stacked cards/forms, and no horizontal overflow.

## 6. Adversarial implementation review and targeted fixes

- [ ] Run `pnpm exec tsc --noEmit` and `pnpm build` before browser review; fix all type/build failures in the changed files.
- [ ] Ask a fresh independent reviewer to inspect the changed implementation and report PASS/FAIL against Penpot fidelity, real media, content hierarchy, accessibility, route preservation, and all four responsive targets. The reviewer must not edit files.
- [ ] Fix every concrete material finding, then request a fresh re-review until the reviewer returns PASS.

## 7. Manual browser verification and evidence

- [ ] Run the production server with `pnpm start -p 3001` after a successful build.
- [ ] In the in-app browser, inspect `/`, `/projects`, and `/sms` at `1512×982`, `834×1194`, `1194×834`, `393×852`, and `390×844`; save route/viewport review captures under `/private/tmp/fidexa-site-*.png`.
- [ ] For every route/viewport case, assert `document.documentElement.scrollWidth === document.documentElement.clientWidth`; on the homepage also assert `.hero-panel.getBoundingClientRect().left === 0`, its width equals `window.innerWidth`, mobile hero/proof children stay inside the panel bounds, and no unintended clipping occurs.
- [ ] Validate `rishi-library.png`, `money-lending-showcase.png`, and `inventory-dashboard.png` with `file` and intrinsic dimensions; record their provenance from `https://rishi.fidexa.org/`, `https://money-lending.fidexa.org/home`, and `https://inventory.fidexa.org/`; assert their exact mapping, loaded natural dimensions, meaningful alt text, rendered width/height, fixed media bounds, and the home order Rishi → Money Lending → Inventory. Keep the Money Lending caption/fact wording as a public Kaks Credit product showcase, never an authenticated dashboard claim.
- [ ] Verify `/projects` shows exactly 16 cards at All, category counts are All `16`, AI & Automation `2`, Apple & Native Apps `1`, Cross-Platform `1`, Web Applications `9`, and Developer Tools `3`; selecting All removes the `category` query parameter.
- [ ] Exercise the mobile menu, contact form controls, AI dialog trigger, featured external links, and footer links; mock contact success/error requests and assert the expected `POST /api/contact` payload without sending live email; verify `/sms` renders all disclosure copy and the privacy/terms/support URLs.
- [ ] Inspect the browser console for errors and manually confirm the approved Penpot folded-F lockup/geometry is used rather than an improvised logo mark.

## 8. Separate browser adversarial review loop

- [ ] Give matched production screenshots and DOM assertion output to a fresh independent reviewer; require a PASS/FAIL verdict across proposition clarity, real media authenticity, hierarchy, catalog breadth, route behavior, readability, mobile containment, and desktop/tablet layout.
- [ ] Require the browser reviewer to make no edits. If it returns FAIL, fix every concrete material finding, rebuild, recapture all affected routes/viewports, and request a fresh browser review until PASS.
- [ ] Keep the implementation reviewer and browser reviewer as separate fresh tasks so code correctness and rendered visual quality are challenged independently.
- [ ] Reset any temporary viewport override and record the final verification evidence in the final response.

## Self-review checklist

- [ ] Every changed file is named above and every step has a concrete command or observable browser assertion.
- [ ] The plan preserves separate route/data responsibilities and does not authorize deletion of unrelated Penpot/Pencil pages or workspace files.
- [ ] No placeholder media, invented product facts, pricing page, changelog page, or synthetic project snapshot is introduced.
- [ ] Long copy is tested in the actual bounded layout, with semantic order and responsive overflow checks.
- [ ] The final implementation is not called complete until typecheck, production build, independent review PASS, and manual browser checks all succeed.
