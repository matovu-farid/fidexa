# Fidexa Campaign Learning Log

This is the durable, append-only record for learning from Fidexa client-acquisition campaigns. Each campaign checkpoint records facts first, then separates hypotheses from decisions.

## Operating loop

1. Inspect delivery, bounce, reply, opt-out, suppression, follow-up, and queue state.
2. Advance only evidence-backed targets through the existing research, contact validation, independent review, and daily-send gates.
3. Record a dated checkpoint with the sample size and source of every metric.
4. State possible explanations as hypotheses, never as conclusions.
5. Promote a change only when repeated evidence supports a concrete, reversible action. Record the expected result and the metric that will confirm or reject it.
6. Review the change in the next weekly retrospective. Keep, revise, or revert it based on observed outcomes.

## Guardrails

- Never increase send volume, bypass recipient verification, skip independent review, or weaken opt-out/suppression controls as an experiment.
- Do not infer email silence from missing data: distinguish a verified no-reply from unavailable reply-sync.
- Do not use opens as a primary success metric. Favor qualified replies, discovery conversations, negative signals, opt-outs, bounces, and repeated delivery evidence.
- A single campaign result is directional only. Make automatic process changes only when the change is low-risk, reversible, and supported by at least three comparable signals or ten relevant outreach records; otherwise create a recommendation for review.
- Any proposed change to legal copy, sender identity, recipient domains, sending limits, or suppression policy requires user approval before use.

## Checkpoint template

### YYYY-MM-DD — Campaign checkpoint

**Facts**

- Window and cohort:
- Researched / verified / reviewed / sent:
- Delivered / bounced / replies / positive replies / opt-outs:
- Reply-data status: available, unavailable, or delayed; source:

**Hypotheses**

-

**Decision**

- Keep, revise, or test:
- Reason and evidence threshold:
- Measurement for the next checkpoint:

## Baseline — 2026-09-22

**Facts**

- First controlled cohort: Rentco Leasing Africa, La’Oli Financial Advisory, and Sam West Distributors.
- All three are recorded as delivered in the production campaign ledger.
- BKM Property Managers, Emet Property Management, and Microfin Uganda are evidence-backed, independently approved, and queued for the next send window.
- No reply-sync integration is currently enabled, so reply outcomes are unavailable rather than zero.

**Hypotheses**

- There is not yet enough response data to judge sector, geography, subject line, or offer effectiveness.

**Decision**

- Preserve the controlled three-message send limit and current workflow-review offer until a weekly cohort produces enough outcome data to support a tested change.

## Checkpoint — 2026-09-22

**Facts**

- Production-ledger cohort: the three prior messages (Rentco Leasing Africa, La’Oli Financial Advisory, and Sam West Distributors) remain delivered; no bounce or suppression event was recorded.
- The signed-in `farid@fidexa.org` Zoho inbox, which receives the Fidexa sending-group mail, was inspected. It showed no campaign reply or opt-out from the sent cohort.
- BKM Property Managers, Emet Property Management, and Microfin Uganda passed the existing public-contact, evidence, and independent-review gates and were sent in the new UTC window. All three are recorded as delivered at 2026-09-22 04:43 UTC.
- The daily cap is now fully used: 3 delivered messages on 2026-09-22 UTC. Six follow-ups remain scheduled; the next are due 2026-09-23 15:00 UTC and require the existing review-before-send rule.

**Hypotheses**

- The six-message delivered cohort is still too small and too recent to assess reply rate, sector fit, or message effectiveness.

**Decision**

- Keep the current targeting, sender, offer, and three-per-day limit unchanged. Continue reply checks through the signed-in mailbox and evaluate the cohort in the scheduled weekly retrospective.

### Queue recovery — 2026-09-22

**Facts**

- The next send window initially had no unsent approved draft after the daily cap was consumed.
- Supplemental public-evidence research refreshed Fresno Management Company, NVPM Property Management, and UTZ Property Management. Their public business contacts were revalidated, each had no prior outbound message or suppression record, and each personalized draft passed independent review.
- Three approved, unsent drafts are now queued for the next UTC send window. No current-day send limit was exceeded.

**Hypotheses**

- Maintaining a three-draft reviewed buffer should prevent an empty queue from delaying the next send window.

**Decision**

- Keep replenishing the approved queue to at least the daily cap with no more than three supplemental-research candidates per run; measure whether the buffer prevents missed send windows without lowering evidence quality.

### Volume authorization — 2026-09-22

**Facts**

- The user explicitly authorized an immediate production cap of 100 outbound messages per UTC day. The Worker configuration was deployed with that cap; evidence, public-contact verification, independent review, suppression, and deliverability gates were not changed.
- Fresno Management Company, NVPM Property Management, and UTZ Property Management were already independently approved and unsent. They were sent after the cap change and are recorded as delivered.
- The cohort has 12 delivered messages on 2026-09-22 UTC so far. Marble Capital, Wholesales Uganda, and Beven & Brock Property Management were the latest independently reviewed, evidence-backed deliveries. No reply, bounce, or opt-out signal has been recorded at this checkpoint.

**Hypotheses**

- A larger daily capacity will allow the evidence-first pipeline to produce a useful response sample sooner, provided public-source research and review quality remain intact.

**Decision**

- Operate up to the authorized 100/day cap. Monitor delivery, replies, bounces, and opt-outs by comparable cohort; do not change sender identity, recipient policy, legal copy, or the cap without a new explicit decision.
