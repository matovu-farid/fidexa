# Fidexa Company Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a truthful, company-first, founder-led Fidexa profile to the homepage and carry it through design-source approval, implementation, responsive verification, pull request review, and merge.

**Architecture:** Keep the existing homepage and shared visual system intact. Add one focused server component between `WhatWeDo` and `Contact`, cover its fixed content and placement with a Node/Vitest source-contract test, and add only scoped responsive CSS plus the contact sequence-number change. Update the Penpot source first, then validate the production build at every required viewport before an independent PR review and merge.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4/global CSS, Vitest 4 in Node, Penpot MCP, in-app Chromium, Git, GitHub CLI.

---

### Task 1: Run the adversarial plan gate

**Files:**
- Read: `docs/superpowers/specs/2026-09-17-fidexa-company-profile-design.md`
- Read: `docs/superpowers/plans/2026-09-17-fidexa-company-profile.md`
- Read: `src/app/page.tsx`
- Read: `src/components/what-we-do.tsx`
- Read: `src/components/contact.tsx`
- Read: `src/app/globals.css`

- [ ] **Step 1: Give a fresh reviewer the design, plan, and relevant source files**

Ask a reviewer who did not write the documents for one explicit `PASS` or `FAIL` verdict against all of these criteria:

```text
1. Truth: every proposed Fidexa/founder statement is in the spec's verified-claim list.
2. Hierarchy: Fidexa is introduced before Farid; the section does not read like a résumé.
3. Scope: homepage-only, after WhatWeDo and before Contact, with no portrait or new route.
4. Existing content: Client Solutions / Innovation Lab copy remains unchanged.
5. Technical fit: server component, source-contract test, scoped CSS, and no unjustified metadata change.
6. Responsive coverage: 1512×982, 834×1194, 1194×834, 393×852, and 390×844 are all required.
7. Regression coverage: navigation, contact, AI dialog, footer, projects filters, and SMS are checked.
8. Delivery: the plan reaches a PR, independent implementation review, passing checks, and merge.
9. Plan quality: every code edit, command, expected result, and fix loop is concrete and internally consistent.
```

Expected: `PASS`, with no unsupported claim, missing acceptance criterion, placeholder, contradictory instruction, or unowned file.

- [ ] **Step 2: Fix every concrete FAIL finding before implementation**

If the reviewer returns `FAIL`, edit only the design and plan documents, then repeat Step 1 with a fresh reviewer. Do not start Penpot or code work until the verdict is `PASS`.

- [ ] **Step 3: Commit the reviewed design and plan**

Run:

```bash
git add docs/superpowers/specs/2026-09-17-fidexa-company-profile-design.md docs/superpowers/plans/2026-09-17-fidexa-company-profile.md
git diff --cached --check
git commit -m "docs: define fidexa company profile"
```

Expected: the staged diff contains exactly the two reviewed documents, `git diff --cached --check` prints nothing, and the commit succeeds.

### Task 2: Update and approve the Penpot source

**Files:**
- Read: `/Users/faridmatovu/.penpot-ai-kit/AGENTS.md`
- Read: `/Users/faridmatovu/.penpot-ai-kit/shared/modes-and-policies.md`
- Read: `/Users/faridmatovu/.penpot-ai-kit/skills/penpot-router/SKILL.md`
- Read: `docs/penpot-design-process.md`
- Reference: `docs/superpowers/specs/2026-09-17-fidexa-company-profile-design.md`

- [ ] **Step 1: Read the required Penpot instructions**

Read the complete Penpot AI Kit instructions listed above, including the one skill or workflow selected by `penpot-router` for this section addition.

Expected: the executor knows the fill policy, Suggest → Apply-with-review gate, source-page boundaries, and verified API-call requirements before opening Penpot.

- [ ] **Step 2: Initialize Penpot MCP with the required overview**

Make `high_level_overview` with no arguments the first Penpot tool call of the session. Do not issue another Penpot call before reading its result.

Expected: the session has the current Penpot capabilities and document overview before any inspection or mutation.

- [ ] **Step 3: Connect to the intended Fidexa page**

Connect to the `fidexa` file at `http://localhost:9001/`, confirm the green MCP indicator, and activate only the `Fidexa Site Redesign` page.

Expected: the intended Fidexa page is active; the `Rishi Site Redesign`, `Fidexa Logo`, `Design System`, and `Case Study — Rishi` pages are untouched.

- [ ] **Step 4: Suggest the section before changing the board**

Present the exact composition from the approved spec for review:

```text
Placement: after WhatWeDo, before Contact
1512×982 and 1194×834: split heading above a two-column editorial card
834×1194 and 393×852: split heading above a one-column editorial card
Left column: Base, Founder experience, Operating model definition list
Right column: dark founder-accountability story, proof line, contact/portfolio/LinkedIn links
Mobile/portrait: one-column stack with wrapped links and height-growing text
Image policy: no portrait and no reserved portrait placeholder
```

Expected: the user can review the proposed change before any meaningful board mutation, in accordance with Suggest → Apply-with-review.

- [ ] **Step 5: Apply the approved composition to the Fidexa design page**

Add bounded, named frames in semantic order: `Company / Intro`, `Company / Fact rail`, and `Company / Founder accountability`. Use vertical auto-layout and height-growing text. Reuse the current Fidexa tokens and primitives; do not change Hero, Featured Work, or the two WhatWeDo cards.

Use this exact content:

```text
04 / Company
A focused studio, with clear accountability.
Fidexa is an independent software studio based in Kampala and working remotely in GMT+3. It builds and supports products for clients and through its own innovation lab.

Base — Kampala / Remote GMT+3
Founder experience — 7+ years professional delivery
Operating model — Solo founder-led since April 2025

Founder accountability
Farid Matovu leads the work from discovery to support.
Farid is Fidexa's founder and product engineer. Since April 2025, he has operated the studio solo across discovery, design, implementation, deployment, and support.
Shipped work includes Rishi and client lending and inventory platforms.

Start a conversation ↗
Farid's portfolio ↗
LinkedIn ↗
```

Renumber the following section to `05 / Contact` in Penpot.

- [ ] **Step 6: Run structural geometry checks**

At `1512×982`, `834×1194`, `1194×834`, and `393×852`, run separate checks for sibling collisions, parent overflow, and intentional overlays. Use a true `393×852` mobile board, not a device shell around a smaller board.

Expected: no unintended collision or overflow and every content unit remains inside its named frame.

- [ ] **Step 7: Export and inspect provisional responsive evidence**

Export all four target boards to these provisional review paths, then inspect them at 100% zoom for heading wrapping, text contrast, reading order, first-fold completeness, and link/touch-target spacing:

```text
/private/tmp/fidexa-company-profile-penpot-review-1512.png
/private/tmp/fidexa-company-profile-penpot-review-834-portrait.png
/private/tmp/fidexa-company-profile-penpot-review-1194-landscape.png
/private/tmp/fidexa-company-profile-penpot-review-393.png
```

Expected: no clipped copy or portrait placeholder, and the company-first introduction is visually read before the founder story.

- [ ] **Step 8: Run a fresh independent Penpot adversarial review**

Give a reviewer who did not create or edit the boards the four provisional exports, the approved copy, and the actual board dimensions. Require one explicit `PASS` or `FAIL` verdict against all of these criteria:

```text
1. Fidexa is read before the founder biography.
2. The 7+ years statement is labeled Founder experience and cannot be read as Fidexa's age.
3. 1512×982 and 1194×834 use two columns; 834×1194 and 393×852 use one column.
4. Every heading, fact, paragraph, and link is legible at 100% zoom and inside its parent.
5. There is no unintended collision, overflow, portrait, or portrait placeholder.
6. Client Solutions and Innovation Lab remain unchanged.
7. Contact follows the profile and is labeled 05 / Contact.
```

Expected: `PASS` with no material truth, hierarchy, readability, or geometry finding. Do not pin or save the milestone as approved before this verdict.

- [ ] **Step 9: Fix and re-export every Penpot FAIL finding**

If the verdict is `FAIL`, correct every concrete finding on `Fidexa Site Redesign`, rerun the structural checks, overwrite the four provisional review exports with fresh captures, and give them to a different fresh reviewer using the Step 8 criteria.

Expected: the final independent verdict is `PASS`; no failed evidence is presented as the approved design.

- [ ] **Step 10: Pin and export the independently approved Penpot milestone**

Only after PASS, pin the milestone on `Fidexa Site Redesign` and save final exports as:

```text
/private/tmp/fidexa-company-profile-penpot-1512.png
/private/tmp/fidexa-company-profile-penpot-834-portrait.png
/private/tmp/fidexa-company-profile-penpot-1194-landscape.png
/private/tmp/fidexa-company-profile-penpot-393.png
```

Expected: all four files show the approved section and can be used as the implementation reference.

- [ ] **Step 11: Record the actual Penpot evidence in the design spec**

Append a dated `Penpot implementation evidence` section to `docs/superpowers/specs/2026-09-17-fidexa-company-profile-design.md`. Record the actual opaque board ID beside each dimension (`1512×982`, `834×1194`, `1194×834`, `393×852`), the actual pinned milestone identifier, all four final `/private/tmp/fidexa-company-profile-penpot-*.png` paths, the independent review date, and the final `PASS` verdict. Paste values returned by Penpot; do not write a generic value or leave any field blank.

Expected: another reviewer can trace the approved copy from the spec to specific boards, a specific pinned milestone, the final exports, and the independent PASS verdict before code work begins.

- [ ] **Step 12: Commit the Penpot evidence record**

Run:

```bash
git add docs/superpowers/specs/2026-09-17-fidexa-company-profile-design.md
git diff --cached --check
git commit -m "docs: record company profile design evidence"
```

Expected: the commit contains the completed evidence record with no blank or generic field; no implementation file is staged.

### Task 3: Capture the production baseline

**Files:**
- Compare: `src/`
- Compare: `public/`
- Test: production routes `/` and `/sms`
- Create outside repository: `/private/tmp/fidexa-company-profile-baseline-*.png`

- [ ] **Step 1: Confirm the baseline has no feature implementation**

Run:

```bash
git diff --name-only main...HEAD -- src public
```

Expected: no output. Only reviewed documentation may differ from `main` before baseline capture, so the baseline represents the pre-profile implementation.

- [ ] **Step 2: Build and start the baseline production application**

Run:

```bash
pnpm build
pnpm start -p 3001
```

Expected: the build exits 0 and the production server listens on `http://localhost:3001` in a persistent terminal.

- [ ] **Step 2a: Load all lazy product images before readiness checks**

Scroll each `.project-media img` into view and wait until every image reports `complete && naturalWidth > 0` before evaluating the DOM contract or taking captures. Expected: readiness assertions measure loaded images rather than an initial lazy-loading state.

- [ ] **Step 3: Scroll to and await every lazy-loaded featured image**

At each required target, run this before reading image readiness:

```js
const lazyMedia = [...document.querySelectorAll(".project-media img")];
for (const image of lazyMedia) {
  image.scrollIntoView({ block: "center" });
  if (!image.complete) {
    await new Promise((resolve, reject) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", reject, { once: true });
    });
  }
  await image.decode();
}
window.scrollTo({ top: 0, behavior: "instant" });
```

Expected: all three lazy images have been scrolled into the loading range, their load/decode work has completed, and the page is returned to the top before bounds are recorded.

- [ ] **Step 4: Record baseline hero and product-media DOM contracts**

At `1512×982`, `834×1194`, `1194×834`, `393×852`, and `390×844`, evaluate:

```js
const hero = document.querySelector(".hero-panel");
const heroBounds = hero?.getBoundingClientRect();
const media = [...document.querySelectorAll(".project-media img")];
const mobileHeroChildren = [".hero-proof", ".hero-visual"]
  .map((selector) => document.querySelector(selector))
  .filter(Boolean);
({
  heroLeft: heroBounds?.left,
  heroWidth: heroBounds?.width,
  viewportWidth: innerWidth,
mobileHeroChildrenWithinPanel: mobileHeroChildren.every((node) => {
    const bounds = node.getBoundingClientRect();
    return heroBounds
      && bounds.left >= heroBounds.left
      && bounds.right <= heroBounds.right
      && bounds.top >= heroBounds.top
      && bounds.bottom <= heroBounds.bottom;
}),
  mediaCount: media.length,
  mediaOrder: media.map((image) => image.closest(".project-card")?.querySelector("h3")?.textContent?.trim()),
  mediaReady: media.map((image) => image.complete && image.naturalWidth > 0),
  mediaLoading: media.map((image) => image.getAttribute("loading")),
  snapshotCount: document.querySelectorAll(".project-snapshot").length,
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
});
```

Expected: `heroLeft === 0`, `heroWidth === viewportWidth`, mobile hero children are horizontally and vertically within the panel at `393×852` and `390×844`, `mediaCount === 3`, media order is `Rishi`, `Money Lending Management System`, `Inventory and Trade Management System`, every `mediaReady` value is true after Step 3, every `mediaLoading` value is `lazy`, `snapshotCount === 0`, and `scrollWidth === clientWidth`.

- [ ] **Step 5: Capture matched baseline homepage evidence**

At each required target, capture the hero, combined work/studio region, and all three product-media cards. The following brace notation denotes the exact 15-file Cartesian product of three regions and five targets:

```text
/private/tmp/fidexa-company-profile-baseline-{hero,work-studio,media}-{1512x982,834x1194,1194x834,393x852,390x844}.png
```

Full-page screenshots or overlapping viewport captures are allowed when a complete region is taller than one viewport. Expected: the evidence set shows every named region completely at 100% zoom without changing content or crop between matching baseline/new captures.

- [ ] **Step 6: Capture matched baseline SMS evidence**

At `/sms`, capture the disclosure content at all five targets as:

```text
/private/tmp/fidexa-company-profile-baseline-sms-{1512x982,834x1194,1194x834,393x852,390x844}.png
```

Expected: target suffixes match Step 5, and the heading, opt-in/opt-out language, privacy link, and terms link are visible across the full-page or overlapping evidence set.

- [ ] **Step 7: Reset browser viewport overrides**

Clear the temporary viewport override and confirm the browser returns to its default responsive state before stopping the baseline server.

Expected: no target-specific viewport or device emulation remains active for later Penpot or implementation work.

### Task 4: Add a failing company-profile contract test

**Files:**
- Create: `src/components/company-profile.test.ts`
- Read: `vitest.config.ts`

- [ ] **Step 1: Create the source-contract test**

Create `src/components/company-profile.test.ts` with this complete content:

```ts
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const componentUrl = new URL("./company-profile.tsx", import.meta.url);
const pageUrl = new URL("../app/page.tsx", import.meta.url);
const contactUrl = new URL("./contact.tsx", import.meta.url);

describe("CompanyProfile", () => {
  it("contains the approved profile facts and destinations", async () => {
    const source = await readFile(componentUrl, "utf8");

    for (const claim of [
      "Kampala / Remote GMT+3",
      '{ label: "Founder experience", value: "7+ years professional delivery" }',
      "Solo founder-led since April 2025",
      "Farid Matovu",
      "founder and product engineer",
      "discovery, design, implementation, deployment, and support",
      "Rishi and client lending and inventory platforms",
      'href="#contact"',
      'href="https://matovu-farid.com"',
      'href="https://www.linkedin.com/in/matovu-farid/"',
    ]) {
      expect(source).toContain(claim);
    }

    expect(source).not.toMatch(/<img\b|<Image\b/);
    expect(source).not.toMatch(/24\/7|employees|our team|client logos/i);
  });

  it("places the company profile after WhatWeDo and before Contact", async () => {
    const source = await readFile(pageUrl, "utf8");
    const contactSource = await readFile(contactUrl, "utf8");
    const studioIndex = source.indexOf("<WhatWeDo />");
    const companyIndex = source.indexOf("<CompanyProfile />");
    const contactIndex = source.indexOf("<Contact />");

    expect(studioIndex).toBeGreaterThan(-1);
    expect(companyIndex).toBeGreaterThan(studioIndex);
    expect(contactIndex).toBeGreaterThan(companyIndex);
    expect(contactSource).toContain("05 / Contact");
  });
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run:

```bash
pnpm test -- src/components/company-profile.test.ts
```

Expected: FAIL because `src/components/company-profile.tsx` does not exist yet. Do not weaken the assertions to obtain a green test.

### Task 5: Implement and place the company profile

**Files:**
- Create: `src/components/company-profile.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/contact.tsx`

- [ ] **Step 1: Create the focused server component**

Create `src/components/company-profile.tsx` with this complete content:

```tsx
import { ArrowUpRight } from "lucide-react";

const profileFacts = [
  { label: "Base", value: "Kampala / Remote GMT+3" },
  { label: "Founder experience", value: "7+ years professional delivery" },
  { label: "Operating model", value: "Solo founder-led since April 2025" },
] as const;

export function CompanyProfile() {
  return (
    <section id="company" className="section-rule section-block">
      <div className="site-shell">
        <div className="split-heading">
          <div>
            <p className="eyebrow">04 / Company</p>
            <h2 className="section-title mt-5">A focused studio, with clear accountability.</h2>
          </div>
          <p className="body-copy">
            Fidexa is an independent software studio based in Kampala and working remotely in GMT+3. It builds and supports products for clients and through its own innovation lab.
          </p>
        </div>

        <div className="company-profile-panel editorial-card mt-12">
          <dl className="company-profile-facts" aria-label="Fidexa company profile">
            {profileFacts.map((fact) => (
              <div className="company-profile-fact" key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="company-profile-story">
            <p className="eyebrow text-[#37d6c0]">Founder accountability</p>
            <h3>Farid Matovu leads the work from discovery to support.</h3>
            <p>
              Farid is Fidexa&apos;s founder and product engineer. Since April 2025, he has operated the studio solo across discovery, design, implementation, deployment, and support.
            </p>
            <p className="company-profile-proof">
              Shipped work includes Rishi and client lending and inventory platforms.
            </p>
            <div className="company-profile-actions">
              <a className="button-primary company-profile-cta" href="#contact">
                Start a conversation <ArrowUpRight size={15} />
              </a>
              <a className="company-profile-link" href="https://matovu-farid.com" target="_blank" rel="noopener noreferrer">
                Farid&apos;s portfolio <ArrowUpRight size={14} />
              </a>
              <a className="company-profile-link" href="https://www.linkedin.com/in/matovu-farid/" target="_blank" rel="noopener noreferrer">
                LinkedIn <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Expected: this remains a server component; do not add `"use client"`, a portrait, mutable state, fetched data, or invented claims.

- [ ] **Step 2: Place the profile in the approved homepage order**

Update `src/app/page.tsx` to this complete content:

```tsx
import { Hero } from "@/components/hero";
import { WhatWeDo } from "@/components/what-we-do";
import { FeaturedProjects } from "@/components/featured-projects";
import { CompanyProfile } from "@/components/company-profile";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <FeaturedProjects />
        <WhatWeDo />
        <CompanyProfile />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Renumber Contact without changing its behavior or copy**

In `src/components/contact.tsx`, replace only:

```tsx
<p className="eyebrow">04 / Contact</p>
```

with:

```tsx
<p className="eyebrow">05 / Contact</p>
```

Expected: the contact form, AI-dialog trigger, success/error states, and `id="contact"` remain unchanged.

- [ ] **Step 4: Run the focused test to identify the remaining red state**

Run:

```bash
pnpm test -- src/components/company-profile.test.ts
```

Expected: PASS for approved content and homepage order. If it fails, fix the component or placement; do not remove the contract assertion.

### Task 6: Add scoped, responsive profile styling

**Files:**
- Modify: `src/app/globals.css`
- Test: `src/components/company-profile.test.ts`

- [ ] **Step 1: Add profile styles beside the other homepage-section rules**

In the `@layer components` block, insert these rules after `.engine-description` and before `.work-header`:

```css
  .company-profile-panel { display: grid; gap: clamp(1rem, 3vw, 2rem); grid-template-columns: minmax(220px, .72fr) minmax(0, 1.28fr); border-radius: 1.25rem; padding: clamp(1rem, 3vw, 1.5rem); }
  .company-profile-facts { display: grid; align-content: start; margin: 0; }
  .company-profile-fact { display: grid; gap: .45rem; border-top: 1px solid var(--line); padding: 1.15rem 0; }
  .company-profile-fact:first-child { border-top: 0; padding-top: .25rem; }
  .company-profile-fact dt { color: var(--muted-ink); font-size: .64rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
  .company-profile-fact dd { margin: 0; color: var(--ink); font-size: .9rem; font-weight: 750; line-height: 1.45; }
  .company-profile-story { min-width: 0; border-radius: 1rem; background: var(--ink); padding: clamp(1.5rem, 5vw, 3rem); color: var(--paper); }
  .company-profile-story h3 { max-width: 700px; margin-top: 1.25rem; font-size: clamp(2rem, 4vw, 3.8rem); font-weight: 750; letter-spacing: -.06em; line-height: .98; }
  .company-profile-story > p:not(.eyebrow) { max-width: 660px; margin-top: 1.35rem; color: var(--dark-muted); font-size: .92rem; line-height: 1.65; }
  .company-profile-story .company-profile-proof { border-top: 1px solid rgba(255,253,248,.18); padding-top: 1.1rem; color: var(--paper); font-weight: 700; }
  .company-profile-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem 1rem; margin-top: 2rem; }
  .company-profile-cta { background: var(--paper); color: var(--ink); }
  .company-profile-cta:hover { background: var(--mint); color: var(--ink); }
  .company-profile-link { display: inline-flex; min-height: 44px; align-items: center; gap: .35rem; color: var(--dark-muted); font-size: .75rem; font-weight: 750; text-decoration: underline; text-underline-offset: .22rem; transition: color 160ms ease; }
  .company-profile-link:hover { color: var(--mint); }
  .company-profile-cta:focus-visible, .company-profile-link:focus-visible { border-radius: .25rem; outline: 3px solid color-mix(in srgb, var(--mint) 65%, transparent); outline-offset: 3px; }
```

- [ ] **Step 2: Add the tablet and mobile stack rules**

Add this focused tablet rule immediately before the existing `@media (max-width: 767px)` block:

```css
  @media (max-width: 900px) {
    .company-profile-panel { grid-template-columns: 1fr; }
  }
```

Then add this rule inside the existing `@media (max-width: 767px)` block:

```css
    .company-profile-actions { align-items: flex-start; flex-direction: column; }
```

Expected: the profile stacks into one column at iPad portrait and narrower widths; action links also stack below `768px`; labels do not collide; and the CSS does not change any existing engine-card or project-card behavior.

- [ ] **Step 3: Run the focused contract test**

Run:

```bash
pnpm test -- src/components/company-profile.test.ts
```

Expected: the command exits 0 and reports 2 passing tests.

- [ ] **Step 4: Run typecheck and the full test suite**

Run:

```bash
pnpm exec tsc --noEmit
pnpm test
```

Expected: both commands exit 0 with no type errors or test regressions.

- [ ] **Step 5: Commit the implementation atomically**

Run:

```bash
git add src/components/company-profile.tsx src/components/company-profile.test.ts src/app/page.tsx src/components/contact.tsx src/app/globals.css
git diff --cached --check
git commit -m "feat: add founder-led company profile"
```

Expected: the commit contains only the component, contract test, homepage placement, contact renumbering, and scoped CSS.

### Task 7: Verify the production build and responsive contracts

**Files:**
- Test: production routes `/`, `/projects`, and `/sms`
- Create outside repository: `/private/tmp/fidexa-company-profile-*.png`

- [ ] **Step 1: Run the final automated preflight**

Run:

```bash
pnpm exec tsc --noEmit
pnpm test
```

Expected: typecheck and the complete test suite exit 0.

- [ ] **Step 2: Build the production application**

Run:

```bash
pnpm build
```

Expected: the Next.js production build exits 0 with no compile or route-generation failure.

- [ ] **Step 3: Start the production server**

Run in a persistent terminal:

```bash
pnpm start -p 3001
```

Expected: the server listens on `http://localhost:3001`. Perform browser review against this production server, not a stale development tab.

- [ ] **Step 4: Check the homepage DOM contracts at every required viewport**

Use the in-app browser at `1512×982`, `834×1194`, `1194×834`, `393×852`, and `390×844`. At each width, evaluate:

```js
const ids = [...document.querySelectorAll("main > section")].map((section) => section.id || section.className);
const profile = document.querySelector("#company");
const hero = document.querySelector(".hero-panel");
const heroBounds = hero?.getBoundingClientRect();
const media = [...document.querySelectorAll(".project-media img")];
const mobileHeroChildren = [".hero-proof", ".hero-visual"]
  .map((selector) => document.querySelector(selector))
  .filter(Boolean);
const actions = [...document.querySelectorAll("#company a")].map((link) => ({
  label: link.textContent?.trim(),
  href: link.getAttribute("href"),
}));
({
  ids,
  hasProfile: Boolean(profile),
  actions,
  heroLeft: heroBounds?.left,
  heroWidth: heroBounds?.width,
  viewportWidth: innerWidth,
  mobileHeroChildrenWithinPanel: mobileHeroChildren.every((node) => {
    const bounds = node.getBoundingClientRect();
    return heroBounds && bounds.left >= heroBounds.left && bounds.right <= heroBounds.right;
  }),
  mediaCount: media.length,
  mediaOrder: media.map((image) => image.closest(".project-card")?.querySelector("h3")?.textContent?.trim()),
  mediaReady: media.map((image) => image.complete && image.naturalWidth > 0),
  mediaLoading: media.map((image) => image.getAttribute("loading")),
  snapshotCount: document.querySelectorAll(".project-snapshot").length,
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  profileWithinViewport: profile ? profile.getBoundingClientRect().left >= 0 && profile.getBoundingClientRect().right <= innerWidth : false,
});
```

Expected:

```text
The rendered section id `studio` precedes `company`, and `company` precedes `contact`.
Actions resolve to #contact, https://matovu-farid.com, and https://www.linkedin.com/in/matovu-farid/.
heroLeft === 0 and heroWidth === viewportWidth.
mobileHeroChildrenWithinPanel === true at 393×852 and 390×844.
mediaCount === 3 and mediaOrder is Rishi, Money Lending Management System, Inventory and Trade Management System.
Every mediaReady value is true and every mediaLoading value is lazy.
snapshotCount === 0.
scrollWidth === clientWidth.
profileWithinViewport === true.
No heading, fact, paragraph, or link is clipped or overlapped.
No portrait or empty portrait placeholder is visible.
```

- [ ] **Step 5: Capture matched new homepage evidence**

At each required target, capture the hero, combined work/studio region, all three product-media cards, and complete company-profile section. The following brace notation denotes the exact 20-file Cartesian product of four regions and five targets:

```text
/private/tmp/fidexa-company-profile-new-{hero,work-studio,media,profile}-{1512x982,834x1194,1194x834,393x852,390x844}.png
```

Expected: full-page or overlapping viewport captures show each complete region at 100% zoom; `1512x982` and `1194x834` show the two-column profile, while `834x1194`, `393x852`, and `390x844` show the one-column profile. Every new hero/work-studio/media capture has a matching baseline capture with the same target and region.

- [ ] **Step 6: Run homepage interaction regression checks**

Using the same production server, verify:

```text
/: desktop nav links work; mobile Menu opens, closes, and closes on Escape; #contact scrolls to the intended section; form fields and submit control remain enabled; Ask AI opens and closes the dialog; footer links resolve correctly.
```

Expected: no browser console errors, no failed local asset requests, no horizontal overflow, and no homepage interaction regression. Do not submit the contact form during a visual regression check.

- [ ] **Step 7: Run project-catalog regression checks**

At `/projects`, verify:

```text
All shows 11 projects.
AI & Automation shows 2.
Apple & Native Apps shows 1.
Web Applications shows 5.
Developer Tools shows 3.
Selecting All removes the category query.
```

Expected: category labels, counts, URL synchronization, and reset behavior are unchanged, with no console error or horizontal overflow.

- [ ] **Step 8: Run SMS disclosure checks and capture matched evidence**

At `/sms`, verify the heading, opt-in/opt-out language, privacy link, and terms link are visible and usable. Capture each required target as:

```text
/private/tmp/fidexa-company-profile-new-sms-{1512x982,834x1194,1194x834,393x852,390x844}.png
```

Expected: disclosures and links remain readable and functional, with no console error or horizontal overflow; every new SMS capture has a matching baseline SMS capture at the same target.

- [ ] **Step 9: Reset browser viewport overrides**

Clear the temporary viewport override and confirm the browser returns to its default responsive state.

Expected: no viewport or device emulation remains active before independent review.

- [ ] **Step 10: Fix and reverify any production finding**

If a check fails, make the smallest relevant fix in the owned implementation files, rerun `pnpm exec tsc --noEmit`, `pnpm test`, and `pnpm build`, then repeat every affected viewport and route check. Commit a fix only after the evidence is green:

```bash
git add src/components/company-profile.tsx src/components/company-profile.test.ts src/app/page.tsx src/components/contact.tsx src/app/globals.css
git diff --cached --check
git commit -m "fix: refine company profile layout"
```

Expected: no known production or responsive failure remains.

### Task 8: Open the pull request

**Files:**
- Review: all branch changes relative to `main`

- [ ] **Step 1: Confirm branch hygiene and final checks**

Run:

```bash
git status --short
git diff --check main...HEAD
git log --oneline main..HEAD
pnpm exec tsc --noEmit
pnpm test
pnpm build
```

Expected: the worktree is clean; the branch contains only the company-profile documentation and implementation commits; all checks exit 0.

- [ ] **Step 2: Push the feature branch**

Run:

```bash
git push -u origin codex/company-profile
```

Expected: `codex/company-profile` exists on the remote and tracks `origin/codex/company-profile`.

- [ ] **Step 3: Create the pull request**

Run:

```bash
gh pr create --base main --head codex/company-profile --title "feat: add founder-led company profile" --body $'## Summary\n- add a company-first profile section with transparent solo-founder accountability\n- link the approved portfolio, LinkedIn, and existing contact flow\n- cover fixed claims and homepage order with a lightweight contract test\n- verify the production site across MacBook, iPad, iPhone, and narrow overflow targets\n\n## Verification\n- pnpm exec tsc --noEmit\n- pnpm test\n- pnpm build\n- production browser review at 1512×982, 834×1194, 1194×834, 393×852, and 390×844'
```

Expected: GitHub returns a PR URL targeting `main` from `codex/company-profile`.

### Task 9: Pass independent implementation review and merge

**Files:**
- Review: pull-request diff
- Review: `/private/tmp/fidexa-company-profile-baseline-*.png`
- Review: `/private/tmp/fidexa-company-profile-new-*.png`
- Review: `/private/tmp/fidexa-company-profile-penpot-*.png`

- [ ] **Step 1: Request a fresh independent review**

Give a reviewer who did not implement the feature the PR diff, the approved spec, the Penpot evidence record, all matched baseline/new hero, work/studio, media, and SMS screenshots, and the verification results. Require a single `PASS` or `FAIL` verdict across these criteria:

```text
1. Company first: Fidexa's identity and operating model are understood before the founder biography.
2. Truth: 7+ years is labeled Founder experience, never Fidexa age; no unsupported team scale, logo, metric, résumé claim, 24/7 promise, or AI-as-employee framing.
3. Evidence: Rishi plus client lending/inventory platforms are the only shipped-work claims in the profile.
4. Placement: CompanyProfile is after WhatWeDo and before Contact; sequence labels are 04 then 05.
5. Links: #contact, portfolio, and LinkedIn are exact; external-link safety attributes are present.
6. Design fidelity: production matches the approved Penpot hierarchy without a portrait or placeholder.
7. Accessibility: semantic headings/dl, visible focus, contrast, wrapping, and touch targets are acceptable.
8. Responsive quality: 1512 and 1194 use two columns; 834, 393, and 390 stack; all five sizes are readable, bounded, and free of horizontal overflow.
9. Media and hero integrity: hero is full-bleed with bounded mobile children; exactly three ready, lazy-loaded media images appear in the required order; `.project-snapshot` is absent.
10. Regression safety: matched baseline/new evidence shows nav, contact, AI dialog, footer, project filters/counts, product media, and SMS remain usable.
11. Maintainability: changes are scoped; WhatWeDo and metadata are unchanged; tests protect facts and order.
```

Expected: `PASS` with no material finding. A vague approval without checking screenshots, URLs, source, and regression evidence does not satisfy this gate.

- [ ] **Step 2: Fix every concrete FAIL finding and repeat review**

For any `FAIL`, make the smallest scoped change, update the Penpot source first if the visual direction changes, then run:

```bash
pnpm exec tsc --noEmit
pnpm test
pnpm build
git diff --check
git add src/components/company-profile.tsx src/components/company-profile.test.ts src/app/page.tsx src/components/contact.tsx src/app/globals.css docs/superpowers/specs/2026-09-17-fidexa-company-profile-design.md docs/superpowers/plans/2026-09-17-fidexa-company-profile.md
git commit -m "fix: address company profile review"
git push
```

Recapture every affected viewport, rerun the affected route checks, and ask a fresh reviewer to repeat Step 1. Expected: final verdict is `PASS`.

- [ ] **Step 3: Record the exact reviewed PR URL and head commit**

Run:

```bash
gh pr view --json url,headRefOid --jq '"PR_URL=" + .url + "\nREVIEWED_SHA=" + .headRefOid'
git rev-parse HEAD
```

Expected: `headRefOid` and `git rev-parse HEAD` print the same 40-character commit SHA. Copy the literal PR URL and SHA into the review record; these are the only values authorized for merge.

- [ ] **Step 4: Wait for GitHub checks to pass**

Run:

```bash
gh pr checks --watch
```

Expected: every required PR check reports `pass`; do not merge with pending or failed checks.

- [ ] **Step 5: Merge the exact reviewed commit without deleting the branch**

Run `gh pr merge` with the literal PR URL and literal 40-character SHA recorded in Step 3. The executed command must contain no shell variable, command substitution, branch name in place of the URL, or branch-deletion option:

```bash
gh pr merge https://github.com/OWNER/REPOSITORY/pull/NUMBER --squash --match-head-commit REVIEWED_40_CHARACTER_SHA
```

Expected: GitHub accepts the merge only if the PR head still equals the independently reviewed SHA. If the head changed, stop and repeat independent review instead of changing `--match-head-commit`.

- [ ] **Step 6: Verify GitHub reports the PR as merged**

Run `gh pr view` with the same literal PR URL used in Step 5:

```bash
gh pr view https://github.com/OWNER/REPOSITORY/pull/NUMBER --json state,mergeCommit --jq '{state, mergeCommit: .mergeCommit.oid}'
```

Expected: `state` is exactly `MERGED` and `mergeCommit` contains a commit SHA.

- [ ] **Step 7: Fast-forward the primary checkout**

Run against the primary checkout, not inside the feature worktree:

```bash
git -C /Users/faridmatovu/projects/fidexa pull --ff-only origin main
git -C /Users/faridmatovu/projects/fidexa log -1 --oneline
```

Expected: local `main` is fast-forwarded to the merged company-profile change. Do not delete the feature branch, remove the feature worktree, reset user changes, or combine cleanup with the merge.

- [ ] **Step 8: Defer branch cleanup until the worktree is resolved**

Run from the primary checkout:

```bash
git -C /Users/faridmatovu/projects/fidexa worktree list
```

Expected: the company-profile worktree remains visible and intact after merge. Worktree removal and local/remote branch deletion are a separate cleanup operation performed only after the worktree’s state is resolved and the user authorizes cleanup.

## Self-review checklist

- Spec coverage: company-first hierarchy, founder-experience labeling, verified founder facts, no portrait, exact links, section placement, existing-content preservation, explicit grid targets, Penpot review/evidence, matched baseline/new browser evidence, regression QA, PR, independent review, reviewed-SHA merge protection, and post-merge worktree safety are all mapped to tasks.
- Placeholder scan: there are no `TBD`, `TODO`, “similar to,” unspecified code edits, or deferred test instructions.
- Type consistency: `CompanyProfile` is exported and imported with the same name; `profileFacts` contains only strings; the test paths resolve relative to `src/components`; section IDs and URLs match the implementation and browser assertions.
- Scope check: the plan adds one homepage component and no independent subsystem, route, service, dependency, data store, or metadata change.
