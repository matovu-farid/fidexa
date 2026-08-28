# Fidexa Media Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved Fidexa studio redesign pass with a full-bleed hero and credible, real product media for the featured Rishi, Money Lending, and Inventory projects.

**Architecture:** Keep the existing Next.js routes and project catalog intact. Add a small local media layer under `public/projects`, expose optional media metadata from the project model, and let the existing reusable `ProjectCard` render real captures in the featured and index contexts. Align CSS with the Pencil source by making the hero edge-to-edge while preserving readable inner content gutters.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS v4, local PNG assets, Playwright through the in-app browser, Pencil MCP.

---

### Task 1: Add approved product captures

**Files:**
- Create: `public/projects/rishi-library.png`
- Create: `public/projects/money-lending-showcase.png`
- Create: `public/projects/inventory-dashboard.png`

- [ ] **Step 1: Copy the approved captures into the site’s public media directory**

Run:

```bash
mkdir -p public/projects
cp /private/tmp/fidexa-rishi-feature-live.png public/projects/rishi-library.png
cp /private/tmp/fidexa-money-live.png public/projects/money-lending-showcase.png
cp /private/tmp/fidexa-inventory-live.png public/projects/inventory-dashboard.png
```

Expected: all three files exist under `public/projects` and are readable by Next.js as `/projects/<filename>`.

- [ ] **Step 2: Verify the copied assets are non-empty PNG captures**

Run:

```bash
file public/projects/*.png
ls -lh public/projects/*.png
```

Expected: three PNG image files with non-zero sizes. The sources are captured from the public live product pages `https://rishi.fidexa.org/`, `https://money-lending.fidexa.org/home`, and `https://inventory.fidexa.org/`; the Money Lending source is explicitly treated as a live product showcase containing its dashboard visual, not represented as an authenticated dashboard capture.

### Task 2: Make the featured data match the approved design

**Files:**
- Modify: `src/data/projects.ts:3-65`

- [ ] **Step 1: Extend the project model with optional media metadata**

Add this property to `Project`:

```ts
media?: {
  src: string;
  alt: string;
};
```

- [ ] **Step 2: Make Rishi, Money Lending, and Inventory the three featured projects**

Set `featured: true` for the three projects, set `featured: false` for AI Scraping, and add these exact media values:

```ts
media: { src: "/projects/rishi-library.png", alt: "Rishi reading library on iPhone" }
media: { src: "/projects/money-lending-showcase.png", alt: "Kaks Credit lending workspace showcase" }
media: { src: "/projects/inventory-dashboard.png", alt: "Inventory management dashboard" }
```

Expected: `featuredProjects` resolves to Rishi, Money Lending Management System, and Inventory and Trade Management System in that order; AI Scraping remains in the full 16-project catalog.

- [ ] **Step 3: Add the approved Inventory featured line**

Add `inventory-trade: "A shared system from supply to shop."` to the featured-only copy map in the card component during Task 3. When rendering the full `/projects` index, continue to show each project’s substantive `description` so the featured tagline does not replace catalog detail.

### Task 3: Replace synthetic snapshots with real media

**Files:**
- Modify: `src/components/project-card.tsx:1-77`
- Modify: `src/app/globals.css:124-150`

- [ ] **Step 1: Remove the synthetic `Snapshot` component and featured snapshot map**

Delete the CSS-generated snapshot component and its `featuredValue` entry for AI Scraping. Keep the existing project metadata, external links, and full catalog behavior unchanged.

- [ ] **Step 2: Render an accessible real capture for featured projects with media**

Render this block after `.project-card-copy` when `featured && project.media`:

```tsx
<figure className="project-media">
  <img src={project.media.src} alt={project.media.alt} />
  <figcaption className="project-media-label">Live product showcase</figcaption>
</figure>
```

Use the project’s existing `media.alt` as the image alternative text and keep the live/GitHub/App Store links below the project content. The card needs a `featured`-only copy branch so `/projects` uses `project.description`, while Home uses the short featured line.

- [ ] **Step 3: Add media styles that keep every card bounded and legible**

Replace the `.project-snapshot` rules with:

```css
.project-media { position: relative; aspect-ratio: 16 / 10; margin-top: 1.25rem; overflow: hidden; border: 1px solid rgba(16,24,40,.12); border-radius: .8rem; background: #f0f3fa; }
.project-media img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; }
.project-media-label { position: absolute; left: .7rem; bottom: .7rem; border-radius: 999px; background: rgba(16,24,40,.8); padding: .35rem .55rem; color: var(--paper); font-size: .58rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; }
.project-card:nth-child(3n) .project-media-label { background: rgba(12,63,61,.9); }
```

Expected: no `.project-snapshot` nodes or CSS remain, and each featured card’s media stays inside the card without overlap or overflow. Inspect all three crops at desktop and mobile widths; the fixed aspect ratio is the bounding contract.

### Task 4: Make the hero truly full-bleed

**Files:**
- Modify: `src/app/globals.css:101-104,176-180`

- [ ] **Step 1: Remove the outer hero gutters while preserving section rhythm**

Set:

```css
.hero-section { padding-block: 0 4rem; }
.hero-section .site-shell { width: 100%; }
.hero-panel { border-radius: 0; }
```

- [ ] **Step 2: Keep the mobile hero edge-to-edge**

Change the mobile `.hero-section` to use no top padding and the mobile `.hero-panel` to keep `border-radius: 0`, while retaining the existing inner padding and responsive stack.

Expected: at a 1440px viewport the hero panel’s left edge is 0 and its width is 1440px; at 390px it remains fully within the viewport with no horizontal overflow.

- [ ] **Step 3: Preserve the old site’s useful explanatory proof**

Keep the two `WhatWeDo` cards, but restore substantive body copy under their short headings: Client Solutions must explain that Fidexa builds client apps, websites, and platforms tailored to the need; Innovation Lab must explain that client work funds R&D products such as Rishi. This preserves the old site’s clear two-engine explanation while retaining the new visual system.

### Task 5: Verify implementation and visual quality

**Files:**
- Test: browser route checks and screenshots in `/private/tmp/fidexa-media-pass-*.png`

- [ ] **Step 1: Run static checks**

Run:

```bash
pnpm exec tsc --noEmit
pnpm build
```

Expected: both commands exit 0 with no TypeScript errors or build failures.

- [ ] **Step 2: Run browser checks at matched desktop and mobile sizes**

Check `/`, `/projects`, and `/sms` at the old-site comparison viewport 1280×720 and at the mobile viewport 390×844; also spot-check 1440×900 for the final desktop composition. Confirm:

```text
heroPanel.left === 0
heroPanel.width === viewport.width
document.querySelectorAll(".project-snapshot").length === 0
document.querySelectorAll(".project-media img").length === 3 on home
featuredNames === ["Rishi", "Money Lending Management System", "Inventory and Trade Management System"]
projectIndexNames.length === 16
categoryFilter("web-apps").includes("money-lending") && categoryFilter("web-apps").includes("inventory-trade")
document.documentElement.scrollWidth === document.documentElement.clientWidth
```

Expected: no console errors, no horizontal overflow, all three image elements report `complete && naturalWidth > 0`, the featured order is Rishi → Money Lending → Inventory, project filters still expose all 16 projects with reset-to-All behavior, the contact form/AI dialog/navigation still open and close, and SMS disclosures remain readable. Inspect the actual bounds of each `.project-media` on Home and `/projects` at both widths so an image cannot be silently clipped inside a card.

- [ ] **Step 3: Capture review screenshots**

Save desktop and mobile screenshots for Home, Projects, and SMS as:

```text
/private/tmp/fidexa-media-pass-home-1280.png
/private/tmp/fidexa-media-pass-home-mobile.png
/private/tmp/fidexa-media-pass-projects-1280.png
/private/tmp/fidexa-media-pass-projects-mobile.png
/private/tmp/fidexa-media-pass-sms-1280.png
/private/tmp/fidexa-media-pass-sms-mobile.png
```

Inspect Home and Projects at the matched 1280×720 viewport against the old captures, and inspect both Home and Projects at 390×844 for responsive stacking before claiming completion.

- [ ] **Step 4: Run an independent adversarial comparison review**

Give a fresh reviewer the old-site captures (`/private/tmp/fidexa-old-home.png`, `/private/tmp/fidexa-old-home-middle.png`, `/private/tmp/fidexa-old-home-lower.png`) and matched 1280×720 new captures, plus the new mobile captures. Require a PASS/FAIL verdict using the same criteria for both versions: proposition clarity, two-engine explanation, project proof/media, catalog breadth, readability, responsive layout, and visible regressions. The reviewer must list what the old site has that the new site lacks and whether any difference is material. Fix every concrete FAIL finding and repeat the review.

The remediation bar includes: keep the old concrete hero proposition; keep substantive project descriptions on both the home cards and the full index; make home category links resolve to URL-addressable project filters; identify the Money Lending capture as Kaks Credit; use explicit image dimensions and below-fold lazy loading; and ensure the hero’s first desktop viewport is not visually incomplete.

- [ ] **Step 5: Commit only the media-pass files**

```bash
git add public/projects/rishi-library.png public/projects/money-lending-showcase.png public/projects/inventory-dashboard.png src/data/projects.ts src/components/project-card.tsx src/components/what-we-do.tsx src/components/hero.tsx src/components/featured-projects.tsx src/components/footer.tsx src/app/projects/page.tsx src/app/globals.css docs/superpowers/plans/2026-08-28-fidexa-media-pass-implementation.md
git diff --cached --check
git commit -m "feat: add real fidexa project media"
```

Expected: the commit contains only this implementation pass; unrelated existing workspace changes remain untouched.

## Self-review checklist

- Spec coverage: full-bleed hero, real Rishi/Money/Inventory media, preserved full catalog, responsive behavior, and independent comparison review are covered in Tasks 1–5.
- Placeholder scan: no TBD/TODO or vague implementation steps remain; each code change has exact paths and expected checks.
- Type consistency: `Project.media` is optional, `ProjectCard` guards `project.media`, and `featuredProjects` continues to derive from the same boolean field.
