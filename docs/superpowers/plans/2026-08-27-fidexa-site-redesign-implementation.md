# Fidexa Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current dark starter-style Fidexa website with the approved Fidexa Studio System design while preserving the existing project catalog, contact submission, AI chat, and SMS disclosure routes.

**Architecture:** Keep the existing Next.js App Router and component boundaries, but move the visual system into shared semantic CSS tokens and reusable shell components. The home page becomes the editorial studio landing page, `/projects` becomes the visual work index with client-side category filtering, and `/sms` becomes a branded utility page. Existing API routes and form behavior remain unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, lucide-react, existing Radix UI primitives.

---

## File map

- Modify `src/app/globals.css` — define the approved Fidexa palette, type scale, responsive spacing, card treatments, buttons, focus states, and page-level utilities.
- Modify `src/app/layout.tsx` — use the light document shell and update metadata to match the Fidexa Studio System.
- Modify `src/components/logo.tsx` — render the folded-F/wordmark lockup in both dark and light surfaces.
- Modify `src/components/nav.tsx` — create the editorial desktop navigation and compact mobile menu affordance.
- Modify `src/components/hero.tsx` — create the dark landing hero with studio proposition, CTA, geometric folded-F motif, and supporting proof card.
- Modify `src/components/what-we-do.tsx` — create the two-engine Client Work / Innovation Lab section.
- Modify `src/components/featured-projects.tsx` — create the selected-work panel layout with three featured project snapshots and a Work Index link.
- Modify `src/components/capabilities.tsx` — create the capability grid using the approved editorial labels and compact cards.
- Modify `src/components/contact.tsx` — preserve the existing submission and AI-chat behavior while applying the approved contact layout and accessible states.
- Modify `src/components/footer.tsx` — create the compact dark footer with utility links and social links.
- Modify `src/components/project-card.tsx` — provide theme-aware project cards with readable tags, metadata, and accessible external links.
- Modify `src/app/page.tsx` — compose the redesigned home page and remove obsolete starter spacing.
- Modify `src/app/projects/page.tsx` — compose the work index around the current 16-project catalog and filters; retain filtering behavior and keyboard focus styles.
- Modify `src/app/sms/page.tsx` — replace the plain disclosure with the branded SMS support page represented in the approved design.
- Modify `src/data/projects.ts` only if needed to add presentational metadata for the existing projects; do not remove or invent catalog entries.

## Task 1: Establish the design tokens and document shell

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/logo.tsx`

- [ ] **Step 1: Add the palette and layout primitives.**

Use these CSS variables as the source of truth:

```css
:root {
  --ink: #101828;
  --cloud: #f7f1e8;
  --paper: #fffdf8;
  --violet: #6f55e8;
  --mint: #36d6bf;
  --muted: #667087;
  --dark-muted: #b8c7dd;
  --sand: #e9d9b9;
  --line: rgba(16, 24, 40, 0.14);
}
```

Define shared classes for `.site-shell`, `.eyebrow`, `.display-title`, `.section-title`, `.editorial-card`, `.dark-card`, `.mint-card`, `.button-primary`, `.button-secondary`, and visible `:focus-visible` rings. Set the body to the light paper background, ink text, Inter, and antialiasing. Add breakpoints that reduce section padding and heading sizes below 640px without changing the 390px mobile compositions into horizontal overflow.

- [ ] **Step 2: Update root metadata and remove the forced dark document class.**

Set the title to `Fidexa — Software Studio`, description to `Software for the next useful step.`, and keep the existing favicon and apple icon. Render `<html lang="en">` without the `dark` class so the site uses the light design shell.

- [ ] **Step 3: Make the logo usable on both dark and light surfaces.**

Keep the existing exported component API, but make `LogoWithText` accept an optional `variant` prop (`"light" | "dark"`) and use the folded-F mark with the correct ink/white wordmark color. Add `aria-label="Fidexa home"` to the home link rather than relying on the SVG alone.

- [ ] **Step 4: Run the typecheck/build gate.**

Run `pnpm exec tsc --noEmit`.

Expected: the existing application typechecks with no errors.

## Task 2: Build the shared navigation and footer shell

**Files:**
- Modify: `src/components/nav.tsx`
- Modify: `src/components/footer.tsx`

- [ ] **Step 1: Replace the dark fixed nav with the editorial nav.**

Use a fixed or sticky paper nav with the Fidexa lockup on the left and `Work`, `Studio`, and `Contact` links on the right. Preserve `/projects` and `/#contact` destinations. At widths below 768px, show the wordmark and a compact `MENU +` control; the control can remain a non-opening affordance for this static redesign, but it must be a real button with an accessible label.

- [ ] **Step 2: Rebuild the footer as a dark utility strip.**

Include the Fidexa lockup, the line `Built for the next useful step.`, links to `/projects`, `/#contact`, and `/sms`, existing social links, and the current year. Ensure link colors meet contrast on `--ink` and the layout stacks cleanly at mobile widths.

- [ ] **Step 3: Verify shell links and keyboard focus.**

Run `pnpm exec tsc --noEmit` and inspect the rendered markup in the browser. Expected: all four internal links resolve, external social links retain `target="_blank"` and `rel="noopener noreferrer"`, and keyboard focus is visible.

## Task 3: Implement the redesigned home composition

**Files:**
- Modify: `src/components/hero.tsx`
- Modify: `src/components/what-we-do.tsx`
- Modify: `src/components/featured-projects.tsx`
- Modify: `src/components/capabilities.tsx`
- Modify: `src/components/contact.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create the dark hero.**

Use the approved copy `Build what matters next.` and supporting copy about Fidexa being a focused software studio. Add a primary `Start a project` anchor to `#contact`, a secondary `View selected work` anchor to `#projects`, the overlapping violet/mint orb motif made from CSS shapes, and the proof card `CLIENT WORK / Apps · platforms · systems / Built for the next useful step.`. The first viewport must show the primary CTA without requiring a scroll.

- [ ] **Step 2: Create the two-engine section.**

Present `Client work` and `Innovation lab` as two editorial cards. Explain that Fidexa builds client apps, platforms, and systems, and that Rishi is the internal product used to explore native Apple development and AI. Keep the content concrete and avoid adding unsupported services.

- [ ] **Step 3: Create selected work with product-specific previews.**

Render the three current featured projects from `featuredProjects`: Rishi, Money Lending Management System, and Inventory and Trade Management System. Each card must show project name, category, concise value statement, tags, and a small CSS-only snapshot panel that hints at the product surface. Keep links to the existing live/App Store/GitHub destinations and add a clear `View all work` link to `/projects`.

- [ ] **Step 4: Create capabilities and conversion contact.**

Use the approved capability labels `Web apps`, `Apple + native`, `AI + automation`, and `Systems + tooling`. The contact section must retain the existing form fields, `/api/contact` request, success/error states, and `Ask AI instead` action, but restyle it as a dark-on-paper project brief panel with the response expectation `Usually within 24–48 hours.`.

- [ ] **Step 5: Compose the page without obsolete starter section borders.**

Render the sections in this order: hero, two engines, selected work, capabilities, contact, footer. Keep the existing `id="projects"` and `id="contact"` anchors. Do not add pricing, changelog, or unrelated standalone pages.

- [ ] **Step 6: Run the build gate.**

Run `pnpm build`.

Expected: Next.js compiles successfully and the home route renders without a runtime error.

## Task 4: Implement the Work Index against the full existing catalog

**Files:**
- Modify: `src/app/projects/page.tsx`
- Modify: `src/components/project-card.tsx`
- Modify: `src/data/projects.ts` only if presentational fields are strictly required.

- [ ] **Step 1: Build the editorial index header and filter bar.**

Use the approved heading `Work with a point of view.` and supporting copy `Featured launches and the full project index.`. Render the existing `categories` as pill buttons with selected, hover, focus, and disabled-safe states. Keep the active category state and filtering logic unchanged.

- [ ] **Step 2: Upgrade project cards without changing the data contract.**

Use alternating ink, sand, and mint surfaces for visual rhythm. Show tags, project name, a one-line value statement, category/year metadata, tech stack, and accessible text links for every available external destination. Do not rely on icon-only links for primary actions; include visible `View project` or equivalent text.

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

Expected: the page has no clipped text, the phone number remains readable, the policy links are visibly interactive, and the page uses the same shell colors as Home and Work.

## Task 6: Browser QA and adversarial review

**Files:**
- No source changes unless QA finds a concrete issue.

- [ ] **Step 1: Start the existing dev server and render `/`, `/projects`, and `/sms`.**

Use the existing `pnpm dev` script. Confirm each route returns successfully before visual inspection.

- [ ] **Step 2: Capture desktop and mobile screenshots.**

Inspect each route at a desktop viewport and a 390px-wide mobile viewport. Check heading hierarchy, section rhythm, CTA visibility, card contrast, nav behavior, and footer stacking. Capture screenshots into `/private/tmp` for review.

- [ ] **Step 3: Run an independent adversarial review.**

Ask a separate reviewer to inspect the screenshots without editing source. Require a PASS/FAIL verdict covering overlap, clipping, contrast, stale starter copy, accidental design-system/QA labels, mobile sizing, and route fidelity.

- [ ] **Step 4: Fix only concrete findings and repeat the review.**

If the reviewer returns FAIL, correct the named source issue, rebuild, recapture the affected screenshot, and repeat until PASS.

- [ ] **Step 5: Run final verification.**

Run `pnpm exec tsc --noEmit` and `pnpm build`. Expected: both commands complete successfully; all three redesigned routes render with no blocking runtime errors.

- [ ] **Step 6: Commit the implementation.**

Run:

```bash
git add src docs/superpowers/plans/2026-08-27-fidexa-site-redesign-implementation.md
git commit -m "feat: implement fidexa studio redesign"
```

Expected: a commit is created containing only the redesign implementation and its plan.
