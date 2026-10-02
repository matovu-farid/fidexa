# Fidexa Campaign Agent Operating Contract

This is the durable workflow contract for future Fidexa acquisition agents. Keep recipient-specific research, private review packets, and live mailbox observations in the restricted operational records rather than this general-purpose document.

## Research and qualification

- Continue through safe campaign stages without waiting for a new prompt. A rejected or ineligible target is a signal to repair the evidence gap or research a replacement; keep replenishing the qualified pipeline without lowering standards.
- Research both the organization and a named decision-maker. Separate public facts from hypotheses and capture sources for the organization's offering, customers, operating workflow, timely trigger, the person's remit and authority, the specific workflow opportunity, fit rationale, and likely objections.
- Require a current, publicly verifiable professional contact linked to the company. Never guess an address, use a personal address, substitute a generic inbox, duplicate outreach, or contact a suppressed recipient.
- Keep a factual, append-only campaign record. Distinguish researched, verified, independently reviewed, sent, delivered, bounced, replied, positive, opted out, deferred, and unknown outcomes. Do not claim no reply unless the complete sent set and required mailbox views were checked.

## Message review and drafting

- Prepare an exact-version private review packet containing recipient, subject, body, evidence, and link destinations. Obtain an independent adversarial review before creating a CRM or Zoho draft.
- The review must challenge personal relevance, business understanding, authority, timely reason to respond, existing tools/team, urgency, trust, generic tone, overpromising, contact provenance, and do-not-contact risk. It records why this person might respond now, what exact fact makes the message specific, why it will not read as vendor spam, and the smallest honest offer.
- A failed review is a repair task. Preserve its findings, fix copy defects or research missing facts, create a successor version, and obtain a fresh independent review of the complete revised message. A prior pass never applies after a material edit. Hold only for a specific hard eligibility or safety blocker that remains unresolved after reasonable research.
- Only an exact version with a fresh independent pass may become a draft. Verify the rendered Zoho message against that version; any mismatch requires correction and another review.

## Trust, sending, and follow-up

- Use the user's signed-in Zoho browser as `Farid Matovu <farid@fidexa.org>`. Zoho Free is browser-only for this workflow: do not add mailbox APIs, OAuth, webhooks, or Resend campaign sending.
- Include a direct reply path, clickable `mailto:farid@fidexa.org`, clickable `https://www.fidexa.org`, a verified Zoho Bookings link when available, and clear opt-out language. Use Zoho's Insert Link UI and verify each rendered destination. Keep the message individualized and the branding restrained. A signature block is optional; do not invent titles or claims.
- Before a send, recheck the current recipient, exact reviewed version and links, suppression/opt-out/bounce state, mailbox send state, and remaining authorized daily capacity. Never resend a permanent bounce or unresolved duplicate. A review pass is not itself send authorization; follow the user's current send authorization and the live action-time gate.
- Inspect the signed-in Inbox, Spam, Sent, and Outbox when relevant. Apply opt-outs promptly, honor deferred-contact dates, and record inaccessible or unverified state as unknown rather than assuming success or no response.

## Learning and process improvement

- At campaign close and the response checkpoint, record comparable cohort counts, factual outcomes, missing data, hypotheses, and the next measurement date.
- Maintain an experiment/action register with the evidence threshold, change, expected metric, measurement window, and rollback condition. Apply only low-risk reversible process changes supported by at least three comparable signals or ten relevant records. Escalate changes to legal copy, sender identity, recipient policy, suppression policy, provider, or sending limits for a user decision.
- After reconciling one campaign's facts and learning, continue to the next safe discovery/research step. Do not use learning to bypass a prospect-level gate.

## Release boundaries

Production application deployment, database migration, external sending, and other production-state changes are separate operations. A code push may trigger the configured Vercel deployment, but it does not imply that production database migrations have been applied. Verify each environment and report any feature that remains unavailable until its schema is deployed.
