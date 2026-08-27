# Fidexa Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` when delegating independent implementation tasks, or `executing-plans` for inline execution. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current dark starter-style Fidexa website with the approved Fidexa Studio System design while preserving the existing project catalog, contact submission, AI chat, and SMS disclosure routes.

**Architecture:** Keep the existing Next.js App Router and component boundaries, but move the visual system into shared semantic CSS tokens and reusable shell components. The current `Fidexa Site Redesign` page in the approved editable Pencil file `fidexa-logo.fig` is the source of truth for copy, composition, and visual hierarchy; its exported board uses Inter, ink `#101828`, paper `#FCF9F0`, violet `#7C5CFC`, mint `#37D6C0`, and sand `#ECE2C7`. The implementation uses the bundled `GeistVF.woff` as a deterministic `Fidexa Sans` substitute because the build environment cannot fetch Google Fonts; visual QA verifies the same 400/700 hierarchy. The site maps that board to Home, `/projects`, and `/sms`, while preserving existing API routes and form/chat behavior.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, lucide-react, existing Radix UI primitives.

---

## File map

- Modify `src/app/globals.css` — define the approved Fidexa palette, type scale, responsive spacing, card treatments, buttons, focus states, and page-level utilities.
- Modify `src/app/layout.tsx` — use the light document shell, update metadata, and reference the tracked `/icon.svg` route only.
- Modify `src/components/logo.tsx` — render the folded-F/wordmark lockup in both dark and light surfaces.
- Modify `src/components/nav.tsx` — create the editorial desktop navigation and compact mobile menu affordance.
- Modify `src/components/hero.tsx` — create the dark landing hero with studio proposition, CTA, geometric folded-F motif, and supporting proof card.
- Modify `src/components/what-we-do.tsx` — create the two-engine Client Work / Innovation Lab section.
- Modify `src/components/featured-projects.tsx` — create the selected-work panel layout with three featured project snapshots and a Work Index link.
- Modify `src/components/contact.tsx` — preserve the existing submission and AI-chat behavior inside the approved light contact composition and accessible states.
- Modify `src/components/footer.tsx` — create the compact dark footer with utility links and social links.
- Modify `src/components/project-card.tsx` — provide theme-aware project cards with readable tags, metadata, and accessible external links.
- Modify `src/app/page.tsx` — compose the redesigned home page and remove obsolete starter spacing.
- Modify `src/app/projects/page.tsx` — compose the work index around the current 16-project catalog and filters; retain filtering behavior and keyboard focus styles.
- Modify `src/app/sms/page.tsx` — replace the plain disclosure with the branded SMS support page represented in the approved design.
- Modify `src/data/projects.ts` — mark the three board-selected projects (Rishi, Money Lending, AI Scraping) as featured without removing or inventing catalog entries.
- Delete `src/components/capabilities.tsx` — remove the unused standalone capability section; capabilities remain represented inside the Studio cards.

## Task 1: Establish the design tokens and document shell

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/logo.tsx`

- [ ] **Step 1: Add the palette and layout primitives.**

Use these CSS variables as the source of truth, matching the current approved Pencil board:

```css
:root {
  --ink: #101828;
  --cloud: #f7f2e8;
  --paper: #fcf9f0;
  --violet: #7c5cfc;
  --mint: #37d6c0;
  --muted-ink: #667085;
  --dark-muted: #aab4c5;
  --sand: #ece2c7;
  --line: rgba(16, 24, 40, 0.14);
}
```

Define shared classes for `.site-shell`, `.eyebrow`, `.display-title`, `.section-title`, `.editorial-card`, `.dark-card`, `.mint-card`, `.button-primary`, `.button-secondary`, and visible `:focus-visible` rings. Set the body to the light paper background, ink text, the repository-bundled `GeistVF.woff` exposed as `Fidexa Sans`, and antialiasing. Do not fetch Google Fonts during the build. Add breakpoints that reduce section padding and heading sizes below 640px without changing the 390px mobile compositions into horizontal overflow.

- [ ] **Step 2: Update root metadata and remove the forced dark document class.**

Set the title to `Fidexa — Software Studio`, description to `Software for the next useful step.`, and use the tracked `src/app/icon.svg` route for the document icon. Render `<html lang="en">` without the `dark` class so the site uses the light design shell.

- [ ] **Step 3: Make the logo usable on both dark and light surfaces.**

Keep the existing exported component API and its `"light" | "reversed"` variant values, and use the folded-F mark with the correct ink/white wordmark color. Add `aria-label="Fidexa home"` to the home link rather than relying on the SVG alone.

- [ ] **Step 4: Run the typecheck/build gate.**

Run `pnpm exec tsc --noEmit`.

Expected: the existing application typechecks with no errors.

## Task 2: Build the shared navigation and footer shell

**Files:**
- Modify: `src/components/nav.tsx`
- Modify: `src/components/footer.tsx`

- [ ] **Step 1: Replace the dark fixed nav with the editorial nav.**

Use a fixed or sticky paper nav with the Fidexa lockup on the left and `Work`, `Studio`, and `Contact` links on the right. Preserve `/projects` and `/#contact` destinations. At widths below 768px, show the wordmark and a functional `MENU +` control that opens the three internal links, closes on link selection and Escape, exposes `aria-expanded`/`aria-controls`, and has a 44px-or-larger touch target with a visible focus ring.

- [ ] **Step 2: Rebuild the footer as a dark utility strip.**

Include the Fidexa lockup, the line `Built for the next useful step.`, links to `/projects`, `/#contact`, and `/sms`, existing social links, and the current year. Ensure link colors meet contrast on `--ink` and the layout stacks cleanly at mobile widths.

- [ ] **Step 3: Verify shell links and keyboard focus.**

Run `pnpm exec tsc --noEmit` and inspect the rendered markup in the browser. Expected: all four internal links resolve, external social links retain `target="_blank"` and `rel="noopener noreferrer"`, and keyboard focus is visible.

## Task 3: Implement the redesigned home composition

**Files:**
- Modify: `src/components/hero.tsx`
- Modify: `src/components/what-we-do.tsx`
- Modify: `src/components/featured-projects.tsx`
- Modify: `src/components/contact.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create the dark hero.**

Use the approved desktop copy `We build software` / `for people moving forward.` and supporting copy `Client work funds our own products. One studio, two engines.`. On the 390px state use `Build what` / `matters next.` with a visible `Start a project ↗` CTA and a `CLIENT WORK / Apps · platforms · systems` proof card. Add `View selected work` to `#projects`, the folded-F geometric motif made from CSS shapes, and the desktop proof labels `CLIENT WORK / OWN PRODUCTS`, `CLIENT SOLUTIONS / WEB · MOBILE · AI`, and `INNOVATION LAB / PRODUCTS · EXPERIMENTS`. The first viewport must show the primary CTA without requiring a scroll.

- [ ] **Step 2: Create the two-engine section.**

Create the approved Studio section with the heading `One studio. Two engines.` and supporting copy `We partner with ambitious teams—and build the tools we wish existed.`. Use the two cards `CLIENT SOLUTIONS / Build what matters. / Web · Mobile · AI · Desktop` and `INNOVATION LAB / Make the next thing. / Products · Experiments · Tools`. Keep the content concrete and avoid adding unsupported services.

- [ ] **Step 3: Create selected work with product-specific previews.**

Render the three Pencil-selected projects from `featuredProjects`: Rishi, Money Lending Management System, and AI Scraping Ecosystem. Their deterministic value statements are `A calmer way to read with AI.`, `Make the numbers work harder.`, and `Turn the web into signal.`. Each card must show project name, category, tags, and a small CSS-only snapshot panel that hints at the product surface. Keep links to the existing live/App Store/GitHub destinations and add a clear `View all work` link to `/projects`.

- [ ] **Step 4: Create the approved contact composition.**

The contact section must use the approved light/cloud composition with heading `Have a hard problem?`, supporting copy `Tell us what you want to make better. We’ll bring the questions, structure, and a clear next step.`, CTA language `START A CONVERSATION ↗`, response label `TYPICAL RESPONSE / 2 BUSINESS DAYS`, and `hello@fidexa.org`. Retain the existing form fields, `/api/contact` request, success/error states, and `Ask AI instead` action inside the right-hand paper form card.

- [ ] **Step 5: Compose the page without obsolete starter section borders.**

Render the sections in this order: hero, selected work, Studio, contact, footer. Keep the existing `id="projects"` and `id="contact"` anchors. Do not add pricing, changelog, or unrelated standalone pages.

- [ ] **Step 6: Run the build gate.**

Run `pnpm build`.

Expected: Next.js compiles successfully and the home route renders without a runtime error.

## Task 4: Implement the Work Index against the full existing catalog

**Files:**
- Modify: `src/app/projects/page.tsx`
- Modify: `src/components/project-card.tsx`
- Modify: `src/data/projects.ts`

- [ ] **Step 1: Build the editorial index header and filter bar.**

Use the approved heading `Work with a point of view.` and supporting copy `Featured launches and the full project index.`. The full index keeps the source-data labels `All`, `AI & Automation`, `Apple & Native Apps`, `Cross-Platform`, `Web Applications`, and `Developer Tools`; the Home teaser may use the shorter Pencil labels `All`, `AI + Automation`, `Apple + Native`, and `Web Apps`. Render pills with selected, hover, and focus states. Keep the active category state and filtering logic unchanged. At 390px, use one column and preserve the mobile composition represented on the Pencil board: `Work with a point of view.`, stacked featured cards, and a visible project-index context.

- [ ] **Step 2: Upgrade project cards without changing the data contract.**

Use alternating ink, sand, and mint surfaces for visual rhythm. Show tags, project name, a deterministic value statement for the three featured IDs (`rishi`, `money-lending`, and `ai-scraping`) and the existing description for all other catalog entries, category/year metadata, tech stack, and accessible text links for every available external destination. Additive presentational logic is allowed, but do not remove or invent catalog content. Expected source-data counts are All 16, AI & Automation 2, Apple & Native Apps 1, Cross-Platform 1, Web Applications 9, and Developer Tools 3. Do not rely on icon-only links for primary actions; include visible text links for every available destination.

- [ ] **Step 3: Add a full-catalog footer note.**

Show the real project count from `projects.length` and the note `filters mirror the live catalog.`. Keep the page mobile-friendly by switching to one column under 768px and ensuring filter pills wrap without horizontal scrolling.

- [ ] **Step 4: Verify filtering behavior.**

In the browser, click `All`, `AI & Automation`, `Apple & Native Apps`, `Cross-Platform`, `Web Applications`, and `Developer Tools`. Expected: the card count and visible cards change correctly, the selected pill is visually distinct, and no card content overlaps.

## Task 5: Implement branded SMS support disclosure

**Files:**
- Modify: `src/app/sms/page.tsx`

- [ ] **Step 1: Rebuild the page around the approved utility layout.**

Add the Fidexa wordmark/header, `SMS SUPPORT` eyebrow, title `Customer care, clearly disclosed.`, and the supporting copy that this is a utility page for consent, help, stop, and account support—not marketing. Use a main card with `Text START to +1 (302) 496-6237`, `HELP`, `STOP`, and message/data-rate disclosure. Add a dark policy card with the existing Privacy Policy, Terms and Conditions, and `support@fidexa.org` links.

- [ ] **Step 2: Preserve all disclosure meaning and destinations.**

Keep the current legal copy: consent is optional, is not a condition of purchase, message frequency varies, `HELP` provides help, and `STOP` opts out. Retain the existing links to `https://rishi.fidexa.org/privacy` and `https://rishi.fidexa.org/terms`.

- [ ] **Step 3: Verify the route at desktop and mobile widths.**

Expected: the page has no clipped text, the phone number remains readable, the policy links are visibly interactive, and the page uses the same shell colors as Home and Work. At 390px, the main disclosure card remains readable above the policy card without horizontal overflow.

## Task 6: Browser QA and adversarial review

**Files:**
- Modify: the named source file(s) containing any concrete issue found during QA; do not edit unrelated files.
- Delete: `src/components/capabilities.tsx` if it remains unused after the Studio composition.

- [ ] **Step 1: Start the existing dev server and render `/`, `/projects`, and `/sms`.**

Use the existing `pnpm dev` script for interaction checks, and use `pnpm exec next start --hostname 127.0.0.1 --port 3001` after `pnpm build` for clean screenshots without the Next development overlay. Confirm `/`, `/projects`, and `/sms` return HTTP 200 before visual inspection.

- [ ] **Step 2: Capture desktop and mobile screenshots.**

Inspect each route at explicit `1440 × 900` desktop and `390 × 844` mobile viewports. Capture `/private/tmp/fidexa-site-home-desktop-final.png`, `/private/tmp/fidexa-site-home-mobile-final.png`, `/private/tmp/fidexa-site-projects-desktop-final.png`, `/private/tmp/fidexa-site-projects-mobile-final.png`, `/private/tmp/fidexa-site-sms-desktop-final.png`, and `/private/tmp/fidexa-site-sms-mobile-final.png`. Check heading hierarchy, section rhythm, CTA visibility, card contrast, nav behavior, and footer stacking.

- [ ] **Step 3: Run an independent adversarial review.**

Ask a separate reviewer agent to inspect those six screenshot files without editing source. Provide the current Pencil board name (`Fidexa Site Redesign`) and the exact approved copy above. Require a PASS/FAIL verdict covering overlap, clipping, contrast at WCAG AA body-text thresholds, stale starter copy, accidental design-system/QA labels, mobile sizing, navigation behavior, route fidelity, and absence of the Next development overlay.

- [ ] **Step 4: Fix only concrete findings and repeat the review.**

If the reviewer returns FAIL, correct the named source issue, rebuild, recapture the affected screenshot, and repeat with a fresh separate reviewer until PASS.

- [ ] **Step 5: Verify preserved behavior and content without creating external side effects.**

In the browser, verify that Home exposes the contact fields and `Ask AI instead` control, the AI modal opens and closes, and the contact form still targets `/api/contact` with success/error rendering code present. Do not submit the live contact form during QA because that sends an external message without a separate action-time confirmation; verify its success/error branches from source and keep the browser interaction side-effect-free. Verify `/projects` renders exactly `projects.length` cards in `All`, the six filters produce counts 16/2/1/1/9/3, and every filter changes the visible set. Verify `/sms` visibly contains `START`, `HELP`, `STOP`, the phone number, optional-consent language, message/data-rate language, and the existing Privacy Policy and Terms URLs. Verify Home contains the exact approved hero, selected-work, Studio, and contact copy listed in Tasks 3–5. Assert `document.documentElement.scrollWidth === document.documentElement.clientWidth` at 390px on all three routes and check the browser console for errors.

- [ ] **Step 6: Run final verification.**

Run `pnpm exec tsc --noEmit` and `pnpm build`. Expected: both commands complete successfully; all three redesigned routes render with no blocking runtime errors.

- [ ] **Step 7: Commit the implementation.**

Run:

```bash
git add src/app/globals.css src/app/layout.tsx src/app/page.tsx src/app/projects/page.tsx src/app/sms/page.tsx src/components/capabilities.tsx src/components/contact.tsx src/components/featured-projects.tsx src/components/footer.tsx src/components/hero.tsx src/components/logo.tsx src/components/nav.tsx src/components/project-card.tsx src/components/what-we-do.tsx src/data/projects.ts docs/superpowers/plans/2026-08-27-fidexa-site-redesign-implementation.md
git diff --cached --check
git commit -m "feat: implement fidexa studio redesign"
```

Expected: the staged diff contains only the redesign implementation and its plan; API routes, unrelated workspace changes, and design exports are not staged.
