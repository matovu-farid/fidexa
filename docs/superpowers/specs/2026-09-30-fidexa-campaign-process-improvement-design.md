# Fidexa campaign process improvement design

**Date:** 2026-09-30
**Status:** The process plan and a substantial local implementation are in place; production remains untouched. The browser-only campaign-learning ledger and admin page, exact-version pre-review gate, manual Zoho reconciliation, evidence-derived learning thresholds, and reason-coded evidence-linked hold/reopen history are implemented in the working tree. Learning migrations 0010–0011 have not been applied or validated against PostgreSQL. Manual attribution requires the reviewed packet's content hash and visible Zoho identifier; the operator enters these and there is no automated cross-database verification. Company intake has normalized-domain deduplication and a database guard for ambiguous domainless name collisions. A complete historical company-alias graph and richer operational cohort analysis remain planned work.

## Goal

Improve the rate of qualified client conversations per delivered, eligible prospect—not raw email volume—while keeping prospect research evidence-led, preventing duplicate or unsafe outreach, and turning campaign outcomes into testable process improvements.

## Current-state evidence and gaps

- The campaign handoff and append-only learning log already require factual checkpoints, comparable cohort measures, weekly retrospectives, and at least three comparable signals or ten relevant records before a low-risk process change.
- Recent logged reconciliation contains a small cohort with delivered messages, a permanent domain failure, and a reply that cannot be confidently attributed to a specific send. Later research waves repeatedly found no newly eligible contact/need combination, and the sendable pipeline remained below three. These small and incompletely attributed samples do not prove which targeting or message tactic performs better. Recipient-level observations remain in the private operational ledger.
- The logs demonstrate that learning is being written down, but do not yet guarantee a due-dated outcome check for every campaign or maintain a concise, carried-forward register of actionable experiments and their results.
- The user has clarified that Zoho is on the Free plan and must be operated through the already signed-in browser. Do not assume mailbox APIs, OAuth sync, webhooks, unrestricted message extraction, or reliable automation access. The browser-visible Zoho record is the source of truth for manual send/reply reconciliation; inaccessible state is “unknown,” not a negative result.
- The outreach gateway/reporting implementation is not a Zoho campaign ledger. Its historical/gateway records must not be silently combined with browser-verified Zoho sends. The checked-in Worker config is disabled for outbound and sync, but the deployed runtime was not checked. Its historical Resend path is not permission to use it. This change corrects local documentation without enabling a sender or changing production.

## Proposed operating system

### 1. Source higher-intent opportunities

Prioritize explicit current requests for paid software/product work, warm referrals, and a verified unresolved operating workflow with an eligible named buyer. Treat funding, hiring, facility launches, expansion, and technology news as prompts for investigation—not proof of a software need. Keep formal procurement in a separately reviewed bid lane; do not convert tender contacts into cold-email targets. Rank only evidence-supported signals and show the evidence and counter-evidence side by side.

### 2. Qualify and deduplicate before writing

Maintain one canonical company identity and normalized individual contact history across research waves. Before counting a candidate as new, check prior contact, exclusions, incumbent systems, completed rollouts, suppression, and prior research. Reopen a held company only for materially new evidence. Preserve the current decision-maker, public professional company-linked contact, timely-trigger, fit-score, deduplication, suppression, and independent-review gates. The three-opportunity target remains a pipeline floor, never grounds to lower eligibility.

### 3. Keep the message small, specific, and trustworthy

For each eligible recipient, use one verified company/person fact, one clearly labeled narrow workflow hypothesis, a bounded honest offer, and one simple response action. Do not state hypotheses as internal facts or imply that growth automatically means pain. Keep Farid Matovu / Fidexa identity, direct reply address, visible clickable website, appointment option, and natural opt-out. Insert website, `mailto:farid@fidexa.org`, and Zoho Bookings destinations through Zoho's Insert Link control and verify the rendered targets in the signed-in browser. Any material edit requires a new independent review of the exact rendered message. Do not test multiple variables at once when the cohort is too small to interpret.

### 4. Measure comparable cohorts with provenance

For each campaign, preserve a campaign/wave ID, cohort definition, target/variant, evidence and review version, and event provenance. Track counts through researched → qualified → reviewed → sent → delivered/permanent bounce → attributable reply → qualified reply → booking → attended, plus opt-outs and follow-up outcomes. Separate `manual Zoho browser-verified` events from historical gateway/Resend records. A message with uncertain origin is un-attributed, not a campaign reply. Report denominators and missingness; do not infer deliverability, cap clearance, suppression state, or outcomes from stale aggregate totals.

The primary outcome is qualified replies or attended qualified conversations per delivered, eligible prospect. Secondary diagnostics are each stage's conversion and hard-blocker mix. Email opens are excluded as a success measure. Do not add invasive tracking.

### 5. Close every wave, and revisit it when due

Before a send, record the campaign's response-check due date; do not invent a universal duration. At wave close, record the factual state and candidate learning. At the due date, inspect the signed-in Zoho folders available and classify as attributable response/outcome, no reply observed in the folders actually checked, or mailbox state unavailable/unverified. Compare outcome with the original hypothesis, write a cautious explanation as a hypothesis, record a specific next action and expected measure, and carry it into the next comparable cohort. An absent response does not by itself explain why the campaign failed.

Keep an append-only learning log for source facts, plus a concise experiment/action register for proposed, active, and evaluated changes. Link each attributable event to its exact reviewed packet/immutable message variant and the visible Zoho identifier. Before logging a packet hash for outcome attribution, register an append-only manual handoff of the independent PASS packet ID and exact hash; every verified send must include its visible Zoho message ID and a registered hash. A due-date no-reply result requires Inbox, Spam, and Sent checks plus the exact complete set of persisted verified send observations; event timestamps come from the server. The manual PASS/hash entry is an operator attestation because the free Zoho browser workflow and separate review store are not programmatically joined. Apply only low-risk reversible process changes supported by at least three comparable signals or ten relevant records; otherwise preserve the idea as a recommendation. Legal copy, sender identity, recipient-domain policy, sending limits, provider, or other high-impact changes require the user's decision.

**Automatic low-risk action rule:** Once the evidence threshold is met, the campaign agent applies the reversible change to the operating playbook (for example research order, evidence checklist, targeting emphasis, message framing, subject, bounded offer, or follow-up timing) and uses it in the next eligible campaign without asking the user to re-approve that routine process change. Before changing the playbook, record the supporting cohort, the before/after rule, expected metric, measurement window, and rollback condition in the action register; after the change, add a dated versioned note to the agent handoff so future runs actually follow it. Keep the previous wording/history. At the checkpoint, retain, refine, or roll back based on the observed comparable result. A threshold only supports the particular low-risk change evidenced; it never waives recipient, evidence, review, deliverability, suppression, or cap gates. If evidence is below threshold, record a recommendation and do not change the active playbook. Changes to legal/opt-out copy, sender identity, recipient-domain policy, sending limits, provider, or other high-impact rules still require the user's decision.

### 6. Follow-up as a reviewed reminder, never a hidden sender

Record follow-up eligibility, due date, reason, and prior message identity. Replies asking for later contact create a dated review reminder. At that date, refresh context, suppression, and contact evidence; research and review any proposed message from scratch as required. No background or CRM follow-up is considered sent. The final send action remains manual in signed-in Zoho, after applicable review and deliverability checks.

## Data and operating boundaries

- Zoho Free: signed-in browser UI only for campaign send/reply inspection. No API, OAuth, webhook, or automated mailbox synchronization is part of this proposal.
- Zoho Mail remains the campaign sending surface; Resend stays disabled for this campaign. Do not enable or deploy a sender, mailbox sync, or production integration as part of the plan.
- Separate browser-verified Zoho events from gateway history and mark source, observation time, operator, visible identifier, and confidence. If the UI fails to expose a status or identity, store unknown/unverified rather than guess.
- Keep daily cap, legal/opt-out language, recipient rules, and the exact-message independent adversarial review intact. An already stated standing send authorization does not certify a specific recipient or bypass a gate.
- User may choose a response-check date appropriate to each campaign; this design intentionally does not impose an arbitrary number of days.

## Decisions and non-goals

This approval covers the process plan and local, non-production implementation of the manual learning workflow. It does not authorize production deployment or database migration, production data mutation, sender/provider changes, automated dispatch, bulk sending, or changes to legal copy/caps. No emails are sent by this document. No CRM or Zoho draft may be created before exact-copy independent pre-review passes, consistent with the existing handoff.

Not in scope: optimizing an unverified sending quota; asserting a statistically winning sector from the current small sample; inferring individual emails; automatic scraping; open tracking; unattended campaign sending; or treating formal procurement as ordinary cold outreach.

## Success criteria

1. Each sent campaign has a cohort ID, exact reviewed message version, verified recipient evidence, and a recorded response-check due date.
2. Each close-out and due-date review records source, checked scope, attribution confidence, outcomes, unknowns, hypothesis, and next action.
3. Campaign metrics can distinguish browser-verified Zoho from gateway/other-channel history and show denominators and missing data.
4. Prior research/contact history prevents duplicate targets; material new facts can reopen a hold without erasing its prior disposition.
5. A process change has a written expected result, measurement window, and rollback condition. A threshold-supported low-risk reversible change is applied automatically to the operating playbook and next eligible campaign, with its old/new wording and version retained; below threshold it remains a recommendation. High-impact changes wait for the user's decision.
6. No implementation weakens existing qualification, review, suppression, deliverability, or send-cap controls, and no mailbox API or automated send path is introduced.
