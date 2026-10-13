# Fidexa visual amplification

## Objective and authorization

Improve the existing Fidexa studio site using the visual confidence and tangible product evidence of the user's Artcraft reference. The user authorized the design work and then explicitly cancelled the recording/demo dependency: “Actually forget the demo. Just improve the design of fidexa.”

This is an amplification of the approved Fidexa identity and proposition. Preserve the supplied logo, local Geist family, ink/paper/violet/mint/sand palette, verified product facts, founder facts, complete catalog, routes and contact/AI behavior. No invented results, testimonials, UI or clients.

## Evidence

The current opening spends its right half on a circular logo ornament. The long heading occupies most of the first viewport; at 1280×720 its main action extends below the fold. Three equal project cards make real product captures small and compress the long system names. Repeated numbered section labels and enclosed surfaces make the page monotonous.

Artcraft's relevant strengths are a confident opening, product imagery in the first viewport, a clear primary action, and substantial media treated as the main content. Its orbital illustration, artist messaging and branding do not belong to Fidexa.

## Composition

1. **Opening:** preserve the approved proposition “We build software products from first idea to everyday use.” Use deliberate phrase grouping and more restrained tracking. Replace the logo orbit with an asymmetric product folio made from the existing real captures. The folio's product links lead to their corresponding featured work. Both contact and selected-work actions remain visible. On phones the folio becomes a compact product-link composition; copy remains in ordinary flow.
2. **Selected work:** one lead Rishi story with a large portrait capture from the user's supplied recording; two substantial web-product showcases follow. Exactly three featured `<img>` elements remain in Rishi → Money Lending → Inventory order, with truthful labels, dimensions, lazy loading and meaningful alternatives. Hero backgrounds repeat those assets decoratively rather than adding more featured images. Existing live, App Store, source and walkthrough links remain.
3. **Studio and accountability:** preserve the substantive Client Solutions / Innovation Lab explanation and founder information. Improve type and spacing, reduce gratuitous enclosures and section numbering, and keep the two processes legible.
4. **Contact and footer:** make the contact surface a distinct mint transition while preserving form, consent copy, loading/error/success and AI dialog behavior. Give the footer more deliberate brand scale and usable links.
5. **Catalog:** retain all 11 serious projects, full descriptions, URL-synced filters and the verified 2/1/5/3 category counts. Keep catalog surfaces quieter than the homepage's featured stories and use two columns at tablet widths.

## System and motion

Use existing color variables and the supplied local font. Retain clear bounds, a 4px-based spacing rhythm, readable body text, visible keyboard focus and 44px controls. The hero receives one finite folio arrival; reduced motion renders the same content without movement. No perpetual animation, invented dashboard widgets, generated art, new branding or changes to campaign data behavior.

## Design source and implementation boundary

The user explicitly superseded the Penpot-first workflow: “No just redesign no pepot. Redesign directly.” The rendered Next.js site is the design surface for this task. Penpot/Pencil files and all their pages remain unchanged. The user additionally requires shadcn/ui components and blocks wherever appropriate across the public site. Use the official Radix registry, existing components first, and the split-form composition of `login-04` adapted for contact without adding authentication pages.

Implement in the existing hero, featured work, project card, studio, company, contact and footer components. CSS changes preserve existing admin workflows and user changes while adapting the admin and outreach presentation under the expanded scope.

## Acceptance evidence

- Production `pnpm exec tsc --noEmit` and `pnpm build`; inspect `pnpm start -p 3001`.
- Render homepage, featured media, catalog and SMS at MacBook 1512×982, iPad 834×1194 and 1194×834, iPhone 393×852; 390×844 is the overflow guard.
- Hero left is zero and width equals viewport; no mobile child clipping or document horizontal overflow.
- Three featured images in the required order, all loaded; no synthetic `.project-snapshot` code or DOM.
- Filter counts and reset URLs; contact validation and AI dialog; menu Escape; verified footer and project destinations.
- A fresh separate adversarial reviewer compares matched old/new captures. Fix material failures and record the final verdict and actual evidence.

This spec records the intended work, not a completion claim. Final evidence and source-design status must be appended after implementation and review.

## Expanded authenticated scope

The user explicitly included admin and outreach. Apply the same shadcn/ui foundation to the private workspace, sign-in, company pipeline/detail and campaign-learning interfaces. Keep authentication, authorization, queries, forms, approvals and campaign data behavior intact. No campaign sends or live record mutations are part of design QA. Sidebar block composition, Card, Table, Tabs, Field, NativeSelect and Checkbox provide consistent accessible interactions.

## Implementation and final verification

Implemented directly in the existing Next.js sources. Public navigation, catalog, contact, AI dialog, project/studio/founder cards, footer, SMS and global recovery use shadcn components. The private workspace uses the official Sidebar composition, Breadcrumb and Card; outreach uses Table, Field/NativeSelect, Tabs, Checkbox, Alert and Collapsible. Shared Button targets are 44px (large 48px). Registry source was obtained from the official shadcn CLI in a temporary folder, copied without overwriting existing primitives, and imports use the existing cn utility; no new application dependencies were necessary.

- `pnpm exec tsc --noEmit`: PASS.
- `pnpm build`: PASS; local production preview on port 3001.
- `pnpm test`: 42 files / 255 tests PASS.
- `git diff --check`: PASS. Impeccable detector: no findings.
- Public homepage at 1512×982, 834×1194, 1194×834, 393×852 and 390×844: hero left 0, hero width=viewport, document width=viewport. Catalog, SMS and sign-in document width=viewport at all five targets. Three featured images load in the required order; no synthetic project-snapshot remains.
- Catalog counts 2/1/5/3; All restores 11 and removes the query. Empty contact submission is blocked by browser validation. AI Tab cycles close/input and Escape restores its trigger; public mobile menu Escape restores its trigger. No inquiry or AI request was sent for QA. Production console error check returned none.
- Private component fixture gallery, outside this repository under `/private/tmp/fidexa-design-preview`, uses actual shell/learning/company components and synthetic records. Submissions, navigation, sign-out, analytics, prefetch and persistence are disabled there. Queue/company/learning bounds pass at MacBook, both iPads and iPhone; learning tabs do not overlap forms, and unsaved text survives tab changes. Mobile Sidebar closes with Escape. This gallery is not shipped.
- Authentication checks remain unchanged: unauthenticated actual admin routes redirect to sign-in. Live authenticated admin screens and saves remain unverified pending the user's sign-in. Fixtures do not establish their live runtime behavior. No campaign, gateway, database or email mutations were performed.
- Fresh independent adversarial review: PASS for public redesign and admin component review. Fixed and rechecked muted-text contrast, primitive display/padding overrides, mobile learning tab height, and AI handoff focus ownership.

Evidence captures are saved as actual JPEGs under `/private/tmp/fidexa-media-pass-*.jpg`; final display copies use PNG. Responsive metrics are saved in `/private/tmp/fidexa-responsive-metrics.json`, `/private/tmp/fidexa-route-metrics.json` and `/private/tmp/fidexa-admin-fixture-metrics.json`. Matched old/new hero captures cover MacBook, both iPads and iPhone. Penpot/Pencil files are unchanged under the explicit direct-implementation override. No deployment or commit was performed.
