# Outreach Supplemental-Evidence Recovery

## Goal

Allow a researched company to recover from a remediable evidence or review gap without creating a duplicate company, overwriting prior evidence, or weakening any campaign safety gate.

## Current failure

The outreach Worker currently permits `researching → researched` but does not permit `researched → researching`. Consequently, public contact evidence discovered after initial completion cannot be stored, even though the company otherwise remains suitable.

## Design

Add an operator-only `start_supplemental_research_run` MCP action. It accepts a company in `researched` status and creates a new research run for that existing company. The new run records that it is supplemental and why it was opened. The company moves to `researching` while the evidence gap is resolved.

Existing evidence refs, findings, contacts, drafts, review runs, messages, suppressions, and workflow events remain untouched. New evidence and findings remain append-only and are attached to the supplemental run. When the run is completed, the company returns to `researched` and is eligible for the ordinary contact, drafting, and review gates.

## Review recovery

When a reviewer rejects a draft for a remediable reason, the recorded finding must identify the missing fact and evidence standard. The operator opens a supplemental run, records the evidence, then updates or replaces the draft. Any draft whose evidence or recipient changed cannot retain an earlier approval: it must be submitted for a new independent review.

## Safety constraints

- Supplemental research is only available to the operator role and only for a previously researched company.
- It cannot create another company or modify/delete existing evidence.
- It does not permit a send while the company is researching or a draft is failed/in review.
- Contact creation still requires verification evidence, a public professional address, duplicate checks, and suppression checks.
- Sending still requires an approved, fresh review and obeys the existing daily send limit.
- Every recovery action emits the existing idempotency and workflow audit events, with a reason recorded in metadata.

## API and state behavior

`start_supplemental_research_run` accepts `company_id`, `reason`, `workflow_run_id`, `idempotency_key`, and `schema_version`. It returns the new `research_run_id`, `state: "researching"`, and `supplemental: true`.

The existing `store_evidence`, `record_finding`, and `complete_research_run` actions continue to operate against the newly created run. No database migration is needed: supplemental status and reason are stored in the existing workflow-event metadata, and the run is identified by its standard lifecycle state and creation order.

## Tests

Tests must first prove that a researched company cannot use the existing initial-research action, then prove that the supplemental action creates a new run, returns the company to `researching`, and permits normal evidence collection. Tests must also prove that the operation rejects discovered/researching companies and that no send-path safety behavior regresses.

## Live recovery

Use the new action for La’Oli Financial Advisory and Sam West Distributors. Attach their already verified public mailbox evidence, create their contacts and personalized drafts, obtain fresh independent approvals, and send only while within the three-message daily limit.
