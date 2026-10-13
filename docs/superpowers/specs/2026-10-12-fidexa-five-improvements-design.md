# Fidexa: five critique improvements

The user approved all five priorities from the recorded critique. Work directly in the existing site; no Penpot, new recordings, deployment, campaign action or live-data mutation.

1. Three featured products become concise case stories: situation, product decision and delivered scope, sourced from current product facts. Short product names lead; full catalog descriptions and eleven-project/category totals remain. One primary exploration action, with secondary evidence links.
2. The hero keeps the approved proposition and shows actual product imagery on phones. A shadcn Tabs spotlight lets visitors inspect Rishi, Kaks Credit and Inventory, with labeled links to their featured stories. Use existing CSS-background captures so the featured media count remains exactly three. All controls work by keyboard and touch. Reduce duplicated opening space.
3. Real captures use purposeful bounded crops and nearby captions explaining visible workflows and capture provenance. Kaks stays labeled a public showcase; Inventory stays a static workflow overview. No fictional transaction screens or business metrics.
4. Alternate full-width project compositions with an open studio explanation and compact founder accountability. Keep Client Solutions/Innovation Lab, processes, founder facts and destinations; consolidate duplicated prose and remove false process-link arrows. Retain palette, local Geist and supplied logo. Use a restrained diagonal brand detail in media framing.
5. Contact offers a short problem/users/stage prompt, clickable email fallback and useful retry guidance. AI helps shape an inquiry; full service/transcript disclosure stays visible before its use in the accessible dialog. Preserve APIs, analytics, honeypot, pending states, transcript and focus behavior.

Parent owns hero/showcase, studio/company, public CSS, catalog count and integration. Independent workers own story/data/cards and contact/chat respectively. Current branch only; preserve unrelated edits.

Verify production typecheck/build, relevant tests, all five responsive targets, real-image count/loading/provenance, spotlight keyboard/touch state, catalog counts/reset, contact validation and dialog focus. No live submissions. Inspect one batched browser pass, fix its concrete findings, then one confirmation pass. A separate adversarial reviewer verifies all five priorities and preserved contracts. Temporary baseline copies stay under /private/tmp.

## Implementation and verification

The five changes are implemented directly in the existing reusable components using shadcn Tabs, Cards, Buttons and Dialogs. Existing admin/outreach adaptations remain in place; this pass does not change campaign or administrative behavior. Penpot and `.fig` sources remain intact under the user's direct-implementation instruction.

Production verification passed: `pnpm exec tsc --noEmit`, `pnpm test` (44 files, 266 tests), final `pnpm build`, and `git diff --check`. The final production preview runs at `http://localhost:3001/`.

Browser measurements at 1512×982, 834×1194, 1194×834, 393×852 and 390×844 confirm homepage hero left=0 and viewport width, no horizontal overflow on home/catalog/SMS, exactly three loaded featured images in Rishi/Kaks/Inventory order, and zero synthetic project snapshots. Catalog filters show 2/1/5/3 entries; All returns 11 and removes the query parameter. Product Tabs switch by pointer and ArrowRight. Empty contact submission is blocked by native validation; hint/privacy descriptions and email destination are present. AI disclosure is visible before input, Escape closes the dialog and returns focus to the inquiry helper. Mobile navigation closes with Escape and restores its trigger. Browser error log is empty.

The first visual pass found shadcn defaults centering story actions and reducing intro type; both were corrected. Phone crops were tightened around the Kaks illustration and Inventory Supply Routes/Transfers. A further crop correction preserves Inventory's Dashboard heading. Misplaced fragment screenshots were replaced with reload-at-fragment captures and DOM position checks.

Evidence includes `/private/tmp/fidexa-media-pass-five-hero-desktop.png`, `/private/tmp/fidexa-media-pass-five-hero-phone.png`, `/private/tmp/fidexa-media-pass-five-rishi-desktop.png`, and the `fidexa-five-final-*.jpg` story/studio/founder/contact/AI captures. No inquiry, AI message, outreach send, deployment or production-data mutation was performed. Contact failure recovery is verified through source/contracts rather than a live failed submission.

Independent adversarial review: **PASS** across all five improvements and preserved contracts. The reviewer inspected matched hero baselines, final desktop/iPad/iPhone captures, original assets and current source, with no concrete material regression. Interaction/build evidence was supplied by the parent; the reviewer performed no live submissions. Temporary viewport overrides were reset and the preview tab was preserved as the deliverable.
