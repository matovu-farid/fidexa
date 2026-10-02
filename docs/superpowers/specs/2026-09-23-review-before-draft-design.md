# Review Before Drafting — Campaign Workflow Design

**Status:** Approved operating rule; versioned pre-review packet workflow is implemented locally
**Date:** 2026-09-23

## Problem

The outreach workflow currently persists a CRM draft before independent review. Its state machine is `researched → drafted → in_review → approved`. When review finds a problem, the message remains in the CRM and Zoho Drafts, creating a queue that looks ready to send even though it is not. The user has directed that no unreviewed message appear in either Drafts list.

## Goal and scope

For all future campaign messages, independent adversarial review must pass before a record is created in CRM Drafts or a message is saved in Zoho Drafts. Preserve all current evidence, recipient, fit, suppression, deliverability, signature/link, daily-cap, and send controls. Resend remains disabled; Zoho remains the manual sender.

This design changes the pre-draft review lifecycle. It does not authorize bulk-sending, deleting or altering existing mailbox drafts, weakening existing safeguards, or treating the reviewer's approval as user consent to send.

## Approved policy: recursively improve failed messages

A failed or needs-changes review is a repair signal, not a reason to abandon an otherwise eligible prospect. Keep the candidate in a private review packet; do not create a CRM or Zoho draft yet. For every review finding:

1. Record the exact finding against the reviewed version and classify it as a copy defect, a missing/uncertain fact, or a hard eligibility/safety blocker.
2. Repair copy defects. For evidence gaps, research and verify the missing fact, then update the message only as far as the evidence supports. Never wordsmith around unsupported claims or hard gates.
3. Version the complete packet and record what changed and which finding it resolves.
4. Obtain a fresh independent adversarial review of the full revised message and evidence. A pass on an earlier version never transfers to a material revision.
5. Repeat the repair → fresh review cycle until the exact version passes. There is no arbitrary attempt limit.
6. Hold/disqualify the prospect only if a concrete hard gate remains unresolvable after reasonable research; record the blocker and continue replacement research. Do not lower standards to fill the pipeline.

Only the exact version that passes independent pre-review may be promoted to a CRM draft and proceed through the separate formal review and Zoho drafting gates. Any later material edit invalidates the pass and restarts the loop. This approved operating rule is documented now; the gateway/schema/dashboard refactor below is not claimed to have been implemented.

## Proposed workflow

```text
research + qualify recipient
→ prepare private review packet (not a CRM or Zoho draft)
→ independent adversarial review
   ├─ changes needed → revise packet and review again
   └─ approved → create one CRM draft and prepare Zoho draft
→ verify Zoho rendering against the approved packet
→ if material mismatch, stop; revise and obtain a new review before sending
→ recheck live send gates and send through Zoho
```

The review packet contains the exact intended recipient, subject, body, evidence references, source URLs, proposed hyperlink labels and destinations, signature/opt-out text, and the reviewer checklist. It is held in a private review-only state and never counted or presented as a draft. Each revision invalidates earlier review. Approval is bound to a content revision/hash and reviewer identity; the author and reviewer must be independent.

Only an approved, current review packet may be promoted atomically into a single canonical CRM draft. A duplicate promotion must return the same canonical draft rather than create another. The Zoho draft is composed only from that approved version. Do not make substantive changes after approval. If Zoho's rendered copy materially differs, sending is blocked until the corrected copy passes review. Any newly created Zoho draft that cannot be corrected without changing approved content should be withdrawn from the active Drafts list when a safe reversible option is available; otherwise leave it clearly blocked and notify the operator. Never delete pre-existing user drafts automatically.

## Review and failure behavior

- Reviewer `needs_changes` leaves only a review packet with findings; it creates no CRM draft and no Zoho draft.
- Revisions increment the packet version and invalidate its prior decision. Re-review must cover the full current packet, not only the changed sentence.
- Reviewer approval requires the existing company-fit, evidence, timely-trigger, decision-maker, contact, deliverability, duplicate/prior-outreach, suppression, devil's-advocate, and message-trust checks.
- A stale or incomplete review cannot promote a packet.
- Promotion fails closed if the packet is not approved, the approval does not match its current content hash, the recipient is suppressed/unverified, or duplicate state is unresolved.
- Send-time controls remain separate: verify current mailbox state, daily cap, exact rendered content, and all other existing gates immediately before sending.

## System changes implied

The current gateway's `create_outreach_draft` accepts content at the `researched` stage, while `submit_outreach_for_review` and reviewer approval require an existing draft. Refactor that lifecycle so a private review-packet entity and review decision exist before draft creation. The approved promotion operation should create the CRM draft and audit event transactionally. Update the campaign dashboard so review packets appear under a clearly named **Awaiting review** or **Changes requested** view, never under **Drafts**; draft counts include only approved/promoted copies.

Until that refactor is implemented, prepare and independently review the exact message in a private packet outside CRM and Zoho Drafts. Only after it passes may the operator create one canonical CRM draft, submit it to the gateway's existing formal review, and prepare a Zoho draft after that formal approval. This interim sequence does not claim the proposed review-packet entity already exists, and neither pre-review nor a CRM draft alone authorizes sending.

Keep existing CRM/Zoho drafts as legacy records during migration. Mark/reconcile them as held, do not infer review or send authorization from their presence, and do not delete or send them automatically. Each must be matched to its live rendering and current evidence before any separate disposition.

## Acceptance criteria

1. A candidate failing, awaiting, or needing review creates no CRM Drafts record and no Zoho Draft.
2. Only a current independently approved review packet can produce one canonical CRM draft.
3. Any material candidate edit invalidates approval and requires full independent re-review.
4. Promotion cannot bypass existing fit, evidence, contact, suppression, duplicate, or review-integrity gates.
5. Dashboard labels/counts distinguish review packets from actual drafts.
6. Legacy drafts remain unchanged and unsent during migration; no destructive cleanup is implicit.
7. Zoho rendering is checked against the approved content and destinations; a mismatch blocks sending and triggers correction/re-review.
8. Existing send, retry, cap, opt-out, and audit safeguards remain intact.

## Alternatives considered

1. **Documentation-only ordering:** tell agents to review first but leave `create_outreach_draft` available to researched records. Lowest effort, but the API still permits the exact accumulation problem. Not recommended.
2. **Review packet then promotion (recommended):** add a review-only persisted entity and promote only approved current content to draft. Enforceable, auditable, and aligns dashboard terminology with the user's expectation.
3. **Keep draft-first but hide/quarantine failures:** reduces visible clutter but still creates unreviewed draft records and does not meet the user's rule. Rejected.

## Risks and migration

This is a lifecycle/API change, so existing agents and clients may call the old create-then-review tools. Deprecate or hard-fail the old pre-review creation path after a migration window; do not silently accept calls. Add schema migration and tests for version-bound approval, idempotent promotion, reviewer/author independence, and non-promotion on every failed gate. Preserve existing records and compatibility for read-only historical views. Deploy new review-packet handling before disabling the old mutation path so there is no interval in which qualified campaigns cannot be prepared safely.

## Questions resolved

- “Draft” means both the campaign CRM Drafts list and Zoho Mail Drafts.
- A private internal review packet may hold a proposed subject/body before approval, but it is not a draft and is not presented as send-ready.
- User authorization to send qualifying outreach remains separate from independent review and technical send gates.
