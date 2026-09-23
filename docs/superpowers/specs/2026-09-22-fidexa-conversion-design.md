# Fidexa conversion design

Date: 2026-09-22
Status: Focused revision and design work approved by owner; Penpot milestone recorded 2026-09-23

## Objective

Increase qualified project conversations from the Fidexa studio site. The intended visitor is a founder, operator, or product lead who needs a new or improved software product. The primary action is to send a project brief through the existing contact form. The site may offer a fit call as the human next step, but it must not imply that the form books a calendar slot.

## Baseline evidence and constraints

These observations describe the deployed baseline before the uncommitted conversion worktree changes; they are not claims about the current local build.

- The live desktop hero at a 1466×716 browser viewport clips the primary action row: the panel bottom is 760px while the action row bottom is about 795px. The panel has `overflow: hidden`.
- Real Rishi, Kaks Credit, and Inventory captures and project descriptions already provide product proof. The current featured cards lead with slogans and technologies rather than the operational problem and actual solution.
- The site has an 11-project catalog with URL filters and a short contact form. It lacks visible conversion measurement, and the AI conversation has no clear handoff into that form.
- No new testimonial, client logo, metric, delivery outcome, or booking claim is approved. Existing product descriptions are the fact boundary.
- Preserve full-bleed identity, internal gutters, Client Solutions and Innovation Lab, and the three featured media captures in their current order.

## Messaging direction

Preserve the approved broad end-to-end product-studio positioning from `2026-08-28-fidexa-positioning-catalog-design.md`. The owner chose a focused revision over a bolder redesign or a financial/operational niche. Keep the approved hero headline and support copy. The first viewport must make the studio's role and the path to a project conversation clear.

Primary navigation CTA in the hero and after project proof: **Tell us about your project**. It takes the visitor to the existing contact form, whose eyebrow repeats that invitation. The form's distinct submit action is **Send inquiry**, so the final transmission is explicit. A supporting reassurance explains the existing two-business-day reply target and useful next step. A call can be proposed after inquiry; no automatic booking is suggested.

The first proof section should explain each featured project in a short factual sequence: context/problem → what was built → live product evidence. Technology names remain available for technical buyers but do not dominate the card. A contextual CTA after the work section takes interested visitors to the same contact form.

## Interaction and information flow

1. A visitor sees a legible proposition, a fully visible primary CTA, and a route to work proof.
2. A visitor exploring work sees real media and concise buyer-centered descriptions. The complete catalog retains substantive details and exact URL category filtering.
3. A visitor sending a brief sees visible labels, response expectation, and a short explanation of how contact information is used. Success and failure states are explicit.
4. A visitor choosing AI can receive a useful project summary and place it into the existing brief form for review. Chat messages go to the AI service when sent in the chat; the summary is not submitted as a project inquiry until the visitor explicitly submits the contact form.
5. Analytics, when configured, records named interaction events without names, emails, message bodies, chat text, or other personal data. Analytics failure never blocks site actions.

## Visual contract

- Keep the current navy, mint, violet, and paper identity and the full-width hero.
- Let headline, actions, proof, and rail fit the viewport without clipping at the specified laptop/tablet/mobile targets. Prefer content-driven height to overflow masking.
- Maintain a clear hierarchy of proposition, product proof, founder accountability, and one next action.
- Preserve real media and inspect every desktop/mobile crop. Do not introduce synthetic product widgets.
- Apply the existing Fidexa semantic and typography tokens to edited elements. New tokens require a separate approval; none are proposed for this pass.
- Use the Penpot AI Kit's incremental Suggest → Apply-with-review process. The owner subsequently approved the frame and all design work on 2026-09-23; keep the section-by-section export and review gates without pausing for each approval.

## Penpot composition

The collaborative visual source is the cloud file `fidexa`, page `Fidexa Site Redesign`. Preserve the existing `Fidexa redesign / organized review board` as history, and build a distinct, named conversion-revision composition beside it on the same page. Do not alter the Rishi, logo, design-system, case-study, portfolio, tractor, or invoice pages. Use an **Editorial** profile and a **topbar landing** skeleton: type-led full-bleed hero → verified product proof → substantive two-engine explanation → actual inquiry form → closing action. Keep the existing wordmark, palette, and broad studio copy; reduce decorative competition with the primary CTA rather than replacing the brand language.

1. **Hero:** Preserve the approved headline and support copy. Show one visually primary `Tell us about your project` action linking to the contact section and a quieter `See selected work` path. Do not promise a booked call. The logo/orbs are decorative, never ahead of the proposition or action. The copy has readable internal gutters within the full-bleed panel, and no clipping at the target viewports.
2. **Work:** Show Rishi, Money Lending/Kaks Credit, and Inventory in that order with their verified product captures. Each card gives the buyer a factual context/problem and what was built; technologies are secondary. Do not use schematic bars or invented dashboard widgets as stand-ins for proof. A `View all work` action reaches the 11-project catalog; a contextual project-inquiry action follows the proof.
3. **Studio:** Preserve the Client Solutions and Innovation Lab distinction and substantive explanation from the deployed site. This section clarifies what Fidexa builds for clients versus what it builds independently, without implying all featured work was client work.
4. **Contact:** Draw the real three-field inquiry form (name, email, project brief), visible labels, a clear `Send inquiry` submit action, the existing two-business-day response target, and concise privacy/AI handoff copy. Success and failure states must be specified. The AI path may prefill a brief for user review but does not send it until the user submits the form.
5. **Routes and responsive boards:** Design a coherent homepage at MacBook `1512×982`, iPad portrait `834×1194`, iPad landscape `1194×834`, and iPhone `393×852`; iPhone must be an actual `393×852` board. Include the `/projects` catalog/filter state and `/sms` disclosure route as separate necessary route boards, not extra homepage screens. `390×844` is a browser overflow guard, not a primary Penpot artboard.

Each new screen and section uses a named, transparent structural flex/grid board; only real surfaces receive a bound fill. Text uses height-growing bounds and on-grid spacing. Export each section and screen, inspect at 100%, then run geometry, token, contrast, and legibility checks before requesting approval at the kit's checkpoints. Keep the `.fig` historical source intact.

The sequence is design approval and Penpot milestone first, app alignment second, production-build/browser verification third, fresh adversarial review and fixes fourth, and push/deploy/public-site verification last.

## Acceptance criteria

- Hero primary CTA is wholly inside the hero panel and clickable at 1512×982, 1194×834, 834×1194, 393×852, and 390×844.
- Page scroll width equals client width at those viewports.
- Home contains exactly three real media images in Rishi, Money Lending, Inventory order; all load and have useful alternative text.
- `/projects` retains 11 projects and category counts 2/1/5/3; the visible count updates with the selected filter and All resets the URL.
- Contact form, AI handoff, mobile menu, footer, SMS route, and outbound project links remain usable.
- The contact flow does not imply a booked call or capture a lead through AI without explicit submission.
- No analytics event includes personal data; public discovery metadata points only to existing resources.
- Penpot desktop/iPad/iPhone composition is inspected, exported, and reviewed against the rendered site before release.
- The Penpot revision shows the actual form, three real project captures on mobile, coherent route states, and no synthetic proof; no edited screen relies on tiny body copy to fit.
- Production build and tests pass; fresh adversarial review has no material unresolved findings.
