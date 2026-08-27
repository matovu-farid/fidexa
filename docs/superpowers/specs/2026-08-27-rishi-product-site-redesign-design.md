# Rishi Product Site Redesign

## Status

Approved for specification and prototype work on 2026-08-27.

## Context

The current Fidexa site still presents a general software studio. Rishi is now the primary product story: an Apple reading app that turns EPUB and PDF books into a focused reading, listening, and conversation experience. The site must make the product legible before a visitor opens the app, reflect the latest shipped capabilities, and provide clear support and legal paths.

The attached source of truth is `/Users/faridmatovu/projects/rishi-monorepo/apps/apple/`. The current app implements a library and reader for EPUB/PDF books, highlights and notes, read-aloud controls, text chat grounded in the current book, live voice chat with transcripts, sync status and background sync, shared reading sessions, account/settings flows, StoreKit subscription management, Mac Catalyst support, and Apple Watch playback support.

## Goals

- Reposition the site as a calm, product-led Rishi site rather than a Fidexa studio portfolio.
- Show the complete reading loop: import, read, highlight, listen, ask, sync, and share.
- Make the Apple app the primary conversion path with an App Store download CTA.
- Give users discoverable feature, support, privacy, and terms pages.
- Keep the SMS disclosure utility available at `/sms`, but out of the primary navigation.
- Use app UI evidence in the prototype so the marketing design feels connected to the shipped product.
- Provide responsive desktop and mobile layouts for all public pages.

## Non-goals

- No public pricing page. Subscription purchase and management remain inside the app through Apple’s StoreKit flows.
- No changelog page.
- No blog or generic studio work index while those pages are unpublished and do not represent the current product.
- No changes to the Apple app source, billing implementation, or legal policy text as part of the site prototype.

## Information architecture

### Primary public routes

- `/` — product homepage and first-touch narrative.
- `/features` — detailed feature groups with app UI evidence.
- `/how-it-works` — the reading loop from importing a book to returning across devices.
- `/download` — App Store-focused download page with supported-device guidance.
- `/support` — help entry point, contact path, and lightweight troubleshooting guidance.
- `/privacy` — privacy policy.
- `/terms` — terms and conditions.

### Utility route

- `/sms` — retained as a compliance utility for SMS-related disclosure and support links; not shown as a primary-nav item.

### Removed from the product-site prototype

- `/pricing`
- `/changelog`
- `/blog`
- The existing studio-oriented pages: `Home`, `Work Index`, `Case Study — Rishi`, `Studio`, `Contact`, and the old review boards that describe the Fidexa studio site.

The old consolidated `Rishi Routes Review` board is replaced by the new product-site prototype rather than used as the final information architecture.

## Experience and visual direction

### Tone

Quiet, intelligent, and tactile. The design should feel like opening a well-made reading app: warm surfaces, deliberate typography, generous whitespace, and small moments of motion or texture. The product evidence carries the excitement; marketing copy stays concise and confident.

### Palette

Use the app’s sepia reading palette as the primary light system:

- Reading background: `#F4ECD8`
- Surface: `#ECE2C7`
- Primary text: `#3C2F1E`
- Secondary text: `#6B5A3F`
- Muted text: `#9B8B69`
- Accent: `#7A5C2E`
- Soft accent: `#C2A678`

Use deep ink and a warm neutral as supporting colors for high-contrast hero moments and footer/legal surfaces. Every text pairing must remain readable; muted text is reserved for metadata, not essential instructions or controls.

### Typography and layout

Use a restrained sans-serif system with a readable editorial scale. Headlines should be compact and human, not oversized for its own sake. Body copy should stay at comfortable reading measure. The layout uses an 8-point spacing rhythm, rounded cards only where they describe app surfaces, and subtle borders instead of heavy shadows.

### Navigation

Desktop navigation: Rishi wordmark, `Features`, `How it works`, `Support`, and a persistent `Download` CTA. Legal links live in the footer. `/sms` is linked only from its relevant disclosure/support context.

Mobile navigation: wordmark, menu trigger, and a persistent download action when space allows. The footer exposes all legal routes.

## Page designs

### Homepage `/`

1. Header with Rishi wordmark and App Store CTA.
2. Hero: “Your books, in one quiet place.” Supporting line explains read, listen, ask, and sync. Show a large reader frame with a book page, progress, and a compact read-aloud control surface.
3. Import-to-library section showing EPUB/PDF intake, covers, progress, and Reading Now.
4. Reading section with highlights, notes, themes, and search evidence.
5. Listen and ask section pairing read-aloud controls with grounded text chat and a live voice transcript.
6. Sync/shared-reading section showing continuity across Mac, iPhone, iPad, and Apple Watch playback.
7. Privacy/accessibility reassurance based on shipped app behavior.
8. Closing App Store CTA and footer links.

### Features `/features`

Organize the feature story into five groups: `Read`, `Listen`, `Ask`, `Keep your place`, and `Read together`. Each group includes one clear claim, a small interaction detail, and a product frame. Subscription language is limited to “Pro features are available in the app” and never becomes a web pricing table.

### How it works `/how-it-works`

Use a numbered, scrollable sequence: bring a book, settle into the reader, mark the passage, start narration or ask a question, then continue on another Apple device. Include a “what stays with you” panel for position, highlights, notes, and saved conversations.

### Download `/download`

Lead with the App Store badge and a concise supported-device statement: iPhone, iPad, and Mac Catalyst, with Apple Watch playback support. Include a short “already subscribed?” note directing users to manage or restore inside the app. Do not expose subscription prices or a web checkout.

### Support `/support`

Present support categories for importing books, reading and narration, chat/voice, sync, and account/subscription management. Provide the existing support email path and direct links to privacy and terms. Keep troubleshooting scannable and avoid promising capabilities not present in the app.

### Legal `/privacy` and `/terms`

Use a low-distraction reading layout with clear headings, effective-date metadata, narrow text measure, and persistent footer navigation. These pages must be visually complete on desktop and mobile and remain easy to reach from every page footer.

### SMS `/sms`

Keep the existing compliance utility functional and visually aligned with the new legal/support system. It remains outside the main marketing narrative.

## Prototype evidence and media

The Pencil prototype will include a small “app evidence” strip and dedicated product frames rather than decorative mockups detached from the app. Preferred evidence order:

1. Fresh simulator screenshots from the current Apple app for library, reader, read-aloud, chat, voice, and sync states.
2. If the app cannot produce a valid installable simulator bundle, source-backed static frames that reproduce only verified UI concepts, clearly treated as prototype evidence.
3. A short navigation recording or storyboard for the import → read → ask → sync journey, only after a working simulator build is available.

The current Apple workspace has known build/package blockers: the full scheme currently fails in the Watch asset catalog, and the main target has a `numkong/numkong.h` dependency failure. These blockers must be reported as capture limitations; they do not justify inventing unsupported product claims.

## Responsive behavior

- Desktop frames use a wide reading canvas with two-column feature sections and large app evidence panels.
- Mobile frames collapse to one column, preserve the reading measure, keep primary CTAs visible, and stack app evidence before supporting copy when the visual is essential.
- Legal and support pages use the same narrow content measure at every breakpoint.
- Decorative background shapes must never carry meaning or reduce contrast.

## Pencil deliverable

Create one clean page named `Rishi Site Redesign` containing labeled desktop and mobile frames for every route above, plus a small route map and evidence/media notes. The page should be understandable as a handoff: route labels, CTA labels, footer/legal relationships, and removed-page notes must be visible without relying on hidden layers.

The final Pencil file is `/Users/faridmatovu/projects/fidexa/fidexa-logo.fig`. Save it after edits and export reviewable SVGs into `/Users/faridmatovu/projects/fidexa/public/`.

## Acceptance criteria

- The prototype’s primary story is Rishi, not a generic Fidexa studio.
- All eight public/utility routes are represented: homepage, features, how it works, download, support, privacy, terms, and SMS.
- Pricing, changelog, blog, and studio-only pages are removed from the approved prototype information architecture.
- No pricing table or web checkout appears anywhere in the product-site design.
- App UI evidence maps only to capabilities verified in the Apple source.
- Desktop and mobile layouts are present for the key marketing and legal/support surfaces.
- App Store download is the dominant CTA; subscription management is directed back into the app.
- Footer relationships expose privacy, terms, and support from the product pages.
- The saved Pencil document and exported SVGs contain no empty placeholder text, broken labels, or illegible essential copy.
- Verification records any simulator capture limitation and distinguishes real screenshots from source-backed prototype frames.
