# Fidexa decision-maker-first outreach policy

## Purpose

Every future Fidexa outreach message must be written for a researched decision-maker and the company they represent. A generic company inbox is only an interim research route, never the default target for a new sales message.

This policy applies before a new message is drafted, approved, or sent. It does not retroactively alter messages already delivered under the prior public-inbox workflow. Any follow-up to an earlier recipient must meet this policy before it is prepared.

## Required research record

Each prospect needs two linked evidence sets, stored with source URLs and capture dates.

### Fit and timing threshold

Before a draft is created, record a 0–20 score for each dimension below in the company fit summary. The total must be at least 70/100; a high total must not mask a zero or unsupported dimension.

| Dimension | What earns evidence-backed points |
| --- | --- |
| Urgency | A dated public trigger: expansion, launch, hiring, partnership, compliance change, or visible process signal. No trigger means no draft. |
| Ability to buy | Public evidence that the named company and recipient can sponsor or influence a focused engagement. |
| Technical need | Public systems, workflows, handoffs, product operations, or process complexity that make one narrow improvement plausible. |
| Accessibility | A named, company-linked decision-maker with public authority and a verified professional contact. |
| Credible Fidexa proof | A truthful, relevant Fidexa capability or public product proof that supports the smallest proposed offer. |

Reject direct competitors, large enterprises without a specific accessible workflow owner, and companies without an observable reason to change now. A score is an auditable prioritization aid, not a claim about the prospect.

### Company evidence

- A compact fact/hypothesis brief: offering, customers, geography or scale, public operating workflows or systems, relevant recent changes, and visible change signals. Facts and inferences must be labeled separately.
- At least one credible problem hypothesis grounded in that profile. It must distinguish a fact from an inference.
- A clear Fidexa fit: one workflow where focused software or automation could plausibly reduce a known operational handoff, without promising an unverified result.
- A reason the prospect is worth contacting now, rather than a generic industry claim.

### Decision-maker evidence

- A publicly verifiable professional role, documented remit or public work, and authority or strong influence over the relevant workflow. Explain why this person is the right recipient rather than merely senior. Preferred roles are founder/owner, managing director, CEO, COO, operations leader, head of technology/product, or the named functional owner of the relevant operation.
- A public professional contact path tied to the company: a company-domain business address, company contact page, or a role-specific channel. Do not use personal accounts, scraped data, guessed addresses, or data-broker records.
- The role, source, and why that person is relevant to the proposed workflow.
- A negative result when no suitable decision-maker is publicly identifiable. In that case, keep researching or leave the company queued; do not fall back to a generic inbox merely to fill sending capacity.

## Message standard

Every message must be individually written and must:

1. Address the researched decision-maker by name only when the public source supports it; otherwise use their verified role.
2. Name one real company-specific observation, using only evidence captured in the record.
3. Connect that observation to one narrow workflow hypothesis relevant to the recipient’s remit.
4. Offer a small, low-commitment next step: a short workflow review focused on that one process.
5. Avoid unsupported ROI, transformation, compliance, security, or technology-stack claims.
6. Include a direct reply path, `farid@fidexa.org`, and `https://www.fidexa.org`, followed by a simple opt-out. Honor opt-outs immediately.

## Sender and delivery channel

Decision-maker outreach is sent manually from the signed-in Zoho mailbox as `Farid Matovu <farid@fidexa.org>`. This creates a visible Sent-folder record, gives the recipient a named, accountable correspondent, and preserves the natural reply thread.

The automated Resend send path is disabled in production. It remains part of the codebase for non-campaign operational mail only and must not be re-enabled for sales outreach without an explicit user decision.

Every manual send uses this factual contact footer before the opt-out line:

```text
You can reply directly to this email, email farid@fidexa.org, or see our work at https://www.fidexa.org.

Regards,
Farid Matovu
Fidexa
https://www.fidexa.org
```

After sending, record the exact subject, body, recipient, timestamp, and Zoho message/thread identifier in the outreach ledger. Browser sending does not waive research, independent review, contact verification, suppression, opt-out, or daily-cap rules.

### User authorization

The user has expressly authorized Fidexa to send qualified campaign messages from `Farid Matovu <farid@fidexa.org>` without an additional business-approval pause. This authorization applies to every message that satisfies this policy's research, decision-maker, contact, review, suppression, and daily-cap requirements.

The campaign must therefore progress automatically to the send-ready Zoho state. If the browser-control environment imposes a separate mandatory confirmation immediately at the final Send action, that platform constraint is procedural only; it is not a withdrawal of the user's sending authority or a reason to stop preparation of the message.

## Devil’s-advocate review

The independent reviewer must try to invalidate the outreach before approval. In addition to the existing delivery and suppression checks, the reviewer records whether the draft answers these likely objections:

| Likely objection | Required response in research or message |
| --- | --- |
| “This is not relevant to me.” | Match the workflow to the recipient’s documented remit. |
| “You do not understand our business.” | Use one specific, verifiable company observation; do not generalize from the sector. |
| “We already have software or a team for this.” | Frame Fidexa as a focused workflow review, not a claim to replace an existing system. |
| “This is not urgent or worth time.” | Ask for a small, optional next step and state the narrow process to discuss. |
| “This sounds generic or automated.” | Reject stock wording that could be sent unchanged to another company. |
| “Who are you and why should I trust this?” | Use the accurate Fidexa identity and make no credentials or case-study claims that lack evidence. |
| “Do not contact us.” | Preserve the explicit opt-out and verify no suppression or prior negative signal exists. |

If the reviewer finds an unresolved objection caused by a research gap, the draft enters a supplemental-research run. It must not be approved by weakening the standard.

The reviewer must also answer, in the recorded findings:

1. Why would this person reply this week?
2. What exact public fact makes the message about this person and company?
3. Why would this not read as vendor spam?
4. What is the smallest useful Fidexa offer that does not overpromise?

The reviewer can mark the draft compliant only after confirming the dated trigger, all five fit dimensions, and the recipient’s workflow authority.

## Workflow changes

```text
discover company
→ research company operations
→ record timely trigger and five-dimension fit score
→ identify and verify a public decision-maker
→ record decision-maker and company evidence
→ write a person-and-company-specific draft
→ devil’s-advocate independent review
→ send only when all existing and new gates pass
```

- A company may be researched without becoming sendable. The absence of a public decision-maker is a queue state, not a reason to use a generic inbox.
- Existing company records may be enriched through append-only supplemental research. Do not create duplicates.
- A rejection is a replacement signal, not a stopping condition. Continue researching replacement companies until there are at least three distinct, current, sendable decision-maker opportunities in the pipeline. A candidate with a generic-only mailbox, absent trigger, weak authority evidence, low fit, a competitor conflict, or a prior-contact conflict is rejected and immediately replaced; it must never consume a campaign slot.
- Proceed autonomously through every safe sequential stage: discovery, replacement research, evidence capture, decision-maker verification, drafting, independent review, queue maintenance, reply classification, suppression, follow-up preparation, and learning-log updates. Do not wait for a new user prompt between those stages. Pause only where external communication requires action-time confirmation: immediately before clicking Zoho's final Send control, or when a policy change requires the user's decision.
- The daily send limit never justifies lowering evidence, recipient, personalization, review, opt-out, suppression, or deliverability standards.
- Delivery, replies, bounces, opt-outs, positive responses, and explicit objections must be logged by recipient role and company segment so future changes are based on comparable evidence.

## Rollout and measurement

The first decision-maker-first cohort will be measured separately from the prior public-inbox cohort. Track researched companies, publicly verified decision-makers, sendable drafts, approvals, deliveries, bounces, replies, qualified replies, opt-outs, and the objections that appear in replies.

Do not change message strategy from a handful of outcomes. Record hypotheses separately from facts and make only reversible changes once the learning threshold in the campaign learning log is met.
