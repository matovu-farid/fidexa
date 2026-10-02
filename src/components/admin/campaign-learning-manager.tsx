"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { effectiveVerifiedSentObservationIds, kampalaLocalDateTimeToIso } from "@/lib/campaign-learning";

type CampaignSummary = {
  sent: number;
  delivered: number;
  bounced: number;
  attributableReplies: number;
  unattributedReplies: number;
  qualifiedReplies: number;
  optOuts: number;
  booked: number;
  attended: number;
  followUps: number;
  unknownEvents: number;
};

type CampaignRow = {
  id: string;
  name: string;
  cohort: string;
  hypothesis: string;
  state: string;
  responseCheckDueAt: string;
  responseCheckDue: boolean;
  createdAt: string;
  summary: CampaignSummary;
  observations: Array<{ id: string; eventType: string; outcome: string; attribution: string; observedAt: string; checkedFolders: string[]; checkedSentObservationIds: string[]; resolvesObservationId: string | null; resolutionStatus: string | null; visibleMessageId: string | null; note: string | null; quantity: number; variantId: string | null; source: string }>;
};

type ActionRow = {
  id: string;
  campaignId: string;
  hypothesis: string;
  action: string;
  expectedMetric: string;
  comparableSignals: number;
  relevantRecords: number;
  supportingObservationIds: string[];
  risk: string;
  status: string;
  userDecisionApproved: boolean;
  result: string | null;
  implementationReference: string | null;
  measurementWindowStartAt: string | null;
  measurementWindowEndAt: string | null;
  measurementCheckpointAt: string | null;
  rationale: string | null;
  evidenceRefs: string[] | null;
  decision: string | null;
  createdAt: string;
  history: Array<{ id: string; eventKind: string; previousStatus: string | null; status: string; rationale: string; evidenceRefs: string[]; decision: string; implementationReference: string | null; result: string | null; createdBy: string; createdAt: string }>;
};

type ResultWindow = { shown: number; total: number; complete: boolean };
type ComparableCohortRow = {
  cohort: string;
  variantId: string | null;
  campaignCount: number;
  sent: number;
  delivered: number;
  bounced: number;
  attributableReplies: number;
  qualifiedReplies: number;
  optOuts: number;
  booked: number;
  attended: number;
  unknownEvents: number;
  qualifiedReplyRate: number | null;
  attendedRate: number | null;
};
export type CampaignLearningInitialData = {
  campaigns: CampaignRow[];
  actions: ActionRow[];
  comparableCohorts: ComparableCohortRow[];
  completeness: { campaigns: ResultWindow; observations: ResultWindow; actions: ResultWindow; actionHistory: ResultWindow; summariesComplete: boolean };
};

const folderOptions = ["inbox", "sent", "spam", "drafts", "outbox"] as const;
const eventOptions = ["approved_variant", "sent", "send_resolution", "delivered", "bounce", "reply", "qualified_reply", "opt_out", "booked", "attended", "follow_up", "close_out", "response_check"] as const;

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Kampala" });
}

function rateLabel(value: number | null) {
  return value === null ? "—" : new Intl.NumberFormat("en-GB", { style: "percent", maximumFractionDigits: 1 }).format(value);
}

function label(value: string) { return value.replaceAll("_", " "); }
function evidenceRefsFrom(value: FormDataEntryValue | null) { return String(value ?? "").split("\n").map((item) => item.trim()).filter(Boolean); }

function Field({ label: fieldLabel, children }: { label: string; children: React.ReactNode }) {
  return <label className="campaign-field"><span>{fieldLabel}</span>{children}</label>;
}

export function CampaignLearningManager({ initialData }: { initialData: CampaignLearningInitialData }) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [campaignId, setCampaignId] = useState(initialData.campaigns[0]?.id ?? "");
  const [observationEventType, setObservationEventType] = useState<(typeof eventOptions)[number]>("sent");
  const campaigns = useMemo(() => initialData.campaigns, [initialData.campaigns]);
  const selectedCampaign = campaigns.find((campaign) => campaign.id === campaignId);
  const approvedHashes = new Set(selectedCampaign?.observations.filter((observation) => observation.eventType === "approved_variant" && observation.outcome === "verified").map((observation) => observation.variantId?.toLowerCase()).filter(Boolean));
  const verifiedSends = selectedCampaign?.observations.filter((observation) => observation.eventType === "sent" && observation.outcome === "verified" && observation.source === "manual_zoho_browser") ?? [];
  const sendResolutions = selectedCampaign?.observations.filter((observation) => observation.eventType === "send_resolution" && observation.source === "manual_zoho_browser") ?? [];
  const resolvedAttemptIds = new Set(sendResolutions.map((observation) => observation.resolvesObservationId).filter(Boolean));
  const unresolvedSendAttempts = selectedCampaign?.observations.filter((observation) => observation.eventType === "sent" && observation.outcome !== "verified" && observation.source === "manual_zoho_browser" && !resolvedAttemptIds.has(observation.id)) ?? [];
  const resolvableSendAttempts = unresolvedSendAttempts.filter((observation) => observation.visibleMessageId && observation.variantId && /^[a-f0-9]{64}$/i.test(observation.variantId) && approvedHashes.has(observation.variantId.toLowerCase()));
  const allPossibleSends = selectedCampaign?.observations.filter((observation) => observation.eventType === "sent" && observation.source === "manual_zoho_browser") ?? [];
  const effectiveIds = effectiveVerifiedSentObservationIds(allPossibleSends, sendResolutions);
  const eligibleNoReplySends = selectedCampaign?.observations.filter((observation) => effectiveIds.includes(observation.id) && observation.visibleMessageId && observation.variantId && approvedHashes.has(observation.variantId.toLowerCase())) ?? [];
  const requestIds = useRef(new Map<string, string>());
  function requestIdFor(key: string) {
    let requestId = requestIds.current.get(key);
    if (!requestId) {
      requestId = crypto.randomUUID();
      requestIds.current.set(key, requestId);
    }
    return requestId;
  }
  function clearRequestId(key: string) { requestIds.current.delete(key); }

  async function submit(kind: string, payload: Record<string, unknown>) {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/campaign-learning", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, ...payload }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "campaign_learning_unavailable");
      setNotice("Saved as an operator-entered Zoho browser observation; it was not independently read from Zoho.");
      router.refresh();
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message.replaceAll("_", " ") : "Could not save this entry.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function createCampaign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const dueInput = String(form.get("responseCheckDueAt") ?? "");
    const dueAt = kampalaLocalDateTimeToIso(dueInput);
    if (!dueAt) {
      setError("Choose a valid response-check date.");
      return;
    }
    const saved = await submit("create_campaign", {
      clientRequestId: requestIdFor("create_campaign"),
      name: form.get("name"),
      cohort: form.get("cohort"),
      hypothesis: form.get("hypothesis"),
      responseCheckDueAt: dueAt,
    });
    if (saved) { formElement.reset(); clearRequestId("create_campaign"); }
  }

  async function recordObservation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const folders = folderOptions.filter((folder) => form.getAll("checkedFolders").includes(folder));
    const checkedSentObservationIds = form.getAll("checkedSentObservationIds").map(String);
    const messageId = String(form.get("visibleMessageId") ?? "").trim();
    const saved = await submit("record_observation", {
      campaignId: form.get("campaignId"),
      eventType: form.get("eventType"),
      source: "manual_zoho_browser",
      outcome: form.get("outcome"),
      attribution: form.get("attribution"),
      checkedFolders: folders,
      ...(checkedSentObservationIds.length ? { checkedSentObservationIds } : {}),
      ...(form.get("resolvesObservationId") ? { resolvesObservationId: form.get("resolvesObservationId") } : {}),
      ...(form.get("resolutionStatus") ? { resolutionStatus: form.get("resolutionStatus") } : {}),
      quantity: ["approved_variant", "send_resolution"].includes(observationEventType) ? 0 : Number(form.get("quantity") ?? 1),
      ...(messageId ? { visibleMessageId: messageId } : {}),
      ...(form.get("variantId") ? { variantId: form.get("variantId") } : {}),
      ...(form.get("note") ? { note: form.get("note") } : {}),
      clientRequestId: requestIdFor("record_observation"),
    });
    if (saved) { formElement.reset(); setObservationEventType("sent"); clearRequestId("record_observation"); }
  }

  async function createAction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const measurementWindowStartAt = kampalaLocalDateTimeToIso(String(form.get("measurementWindowStartAt") ?? ""));
    const measurementWindowEndAt = kampalaLocalDateTimeToIso(String(form.get("measurementWindowEndAt") ?? ""));
    const measurementCheckpointAt = kampalaLocalDateTimeToIso(String(form.get("measurementCheckpointAt") ?? ""));
    if (!measurementWindowStartAt || !measurementWindowEndAt || !measurementCheckpointAt) {
      setError("Enter a valid measurement window and checkpoint in Kampala time.");
      return;
    }
    const saved = await submit("create_action", {
      campaignId: form.get("campaignId"),
      hypothesis: form.get("hypothesis"),
      action: form.get("action"),
      expectedMetric: form.get("expectedMetric"),
      supportingObservationIds: form.getAll("supportingObservationIds").map(String),
      risk: form.get("risk"),
      measurementWindowStartAt,
      measurementWindowEndAt,
      measurementCheckpointAt,
      rationale: form.get("rationale"),
      evidenceRefs: evidenceRefsFrom(form.get("evidenceRefs")),
      decision: form.get("decision"),
      clientRequestId: requestIdFor("create_action"),
    });
    if (saved) { formElement.reset(); clearRequestId("create_action"); }
  }

  async function transitionAction(event: React.FormEvent<HTMLFormElement>, action: ActionRow) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const requestKey = `transition_action:${action.id}`;
    const saved = await submit("transition_action", {
      actionId: action.id,
      expectedStatus: action.status,
      status: form.get("status"),
      rationale: form.get("rationale"),
      evidenceRefs: evidenceRefsFrom(form.get("evidenceRefs")),
      decision: form.get("decision"),
      ...(form.get("implementationReference") ? { implementationReference: form.get("implementationReference") } : {}),
      ...(form.get("result") ? { result: form.get("result") } : {}),
      clientRequestId: requestIdFor(requestKey),
    });
    if (saved) { formElement.reset(); clearRequestId(requestKey); }
  }

  function nextActionStatuses(action: ActionRow) {
    if (action.status === "proposed") return action.risk === "high" ? ["needs_user_decision", "rejected"] : ["applied", "needs_user_decision", "rejected"];
    if (action.status === "needs_user_decision") return ["proposed", "user_approved", "rejected"];
    if (action.status === "user_approved") return ["applied", "rejected"];
    if (action.status === "applied") return ["evaluated"];
    return [];
  }

  function supportingDeliveryOptions(cohort: string) {
    const normalized = cohort.trim().toLocaleLowerCase().replace(/\s+/g, " ");
    return campaigns.flatMap((campaign) => campaign.cohort.trim().toLocaleLowerCase().replace(/\s+/g, " ") === normalized
      ? campaign.observations.filter((observation) => observation.eventType === "delivered" && observation.source === "manual_zoho_browser" && observation.outcome === "verified" && observation.attribution === "attributable" && observation.quantity === 1 && /^[a-f0-9]{64}$/i.test(observation.variantId ?? "")).map((observation) => ({ campaign, observation }))
      : []);
  }

  return <main className="admin-outreach campaign-learning-page">
    <header className="admin-outreach-header">
      <div><p className="eyebrow">Fidexa / Campaign learning</p><h1>Close the loop.</h1><p className="admin-muted">A manual record of what Zoho visibly confirms, what remains unknown, and what to test next.</p></div>
      <a className="admin-secondary" href="/admin/outreach">Back to outreach</a>
    </header>

    <section className="admin-outreach-card campaign-browser-boundary">
      <p className="eyebrow">Zoho Free · browser-only</p>
      <p>Record only observations made in the signed-in Zoho browser. This page does not read Zoho, send messages, or sync mail. Do not paste message bodies or recipient email addresses. If a folder cannot be checked, record “unavailable” or “unverified,” not “no reply.”</p>
    </section>

    {campaigns.some((campaign) => campaign.state === "closed" && campaign.responseCheckDue) ? <section className="admin-outreach-card" aria-labelledby="campaign-response-checks-heading">
      <p className="eyebrow">Manual Zoho task · due now</p><h2 id="campaign-response-checks-heading">Response checks to complete</h2>
      <p className="admin-muted">Open the signed-in Zoho browser, inspect Inbox and Spam, then record only what was visible. This reminder does not read the mailbox or send anything.</p>
      <ul className="campaign-observation-list">{campaigns.filter((campaign) => campaign.state === "closed" && campaign.responseCheckDue).map((campaign) => <li key={campaign.id}><strong>{campaign.name}</strong><span>{campaign.cohort} · due {dateLabel(campaign.responseCheckDueAt)}</span><button type="button" className="admin-secondary" onClick={() => { setCampaignId(campaign.id); document.getElementById("campaign-observation-form")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Record Zoho check</button></li>)}</ul>
    </section> : null}

    <section className="admin-outreach-card">
      <p className="eyebrow">Before the first send</p><h2>Start a campaign record</h2>
      <form className="campaign-form" onSubmit={createCampaign}>
        <Field label="Campaign / wave name"><input name="name" required maxLength={160} placeholder="Wave 466" /></Field>
        <Field label="Comparable cohort"><input name="cohort" required maxLength={160} placeholder="Named operators with a verified active workflow gap" /></Field>
        <Field label="What are we testing?"><textarea name="hypothesis" required maxLength={2_000} rows={3} placeholder="One evidence-based targeting or message hypothesis" /></Field>
        <Field label="Response-check date (Kampala time)"><input type="datetime-local" name="responseCheckDueAt" required /></Field>
        <p className="admin-muted">Choose a date appropriate to this campaign; no fixed interval is assumed. A future response check cannot be recorded until the wave is closed and its due date arrives.</p>
        <button className="admin-primary" disabled={saving}>Create campaign record</button>
      </form>
    </section>

    <section className="admin-outreach-card">
      <p className="eyebrow">Manual outcome reconciliation</p><h2>Record a Zoho observation</h2>
      {campaigns.length === 0 ? <p className="admin-muted">Create a campaign record before logging its events.</p> : <form id="campaign-observation-form" className="campaign-form" onSubmit={recordObservation}>
        <Field label="Campaign"><select name="campaignId" value={campaignId} onChange={(event) => setCampaignId(event.target.value)} required>{campaigns.map((campaign) => <option value={campaign.id} key={campaign.id}>{campaign.name} · {label(campaign.state)}</option>)}</select></Field>
        <Field label="Observed event"><select name="eventType" value={observationEventType} onChange={(event) => setObservationEventType(event.target.value as (typeof eventOptions)[number])} required>{eventOptions.map((value) => <option value={value} key={value}>{label(value)}</option>)}</select></Field>
        <Field label="What did the checked browser view establish?"><select name="outcome" required><option value="verified">Verified event/status</option><option value="no_reply_observed">No reply observed in checked folders</option><option value="unavailable">Mailbox/folder unavailable</option><option value="unverified">Could not verify</option></select></Field>
        <Field label="Attribution"><select name="attribution" required><option value="unknown">Unknown / not matched</option><option value="attributable">Matched to this campaign</option><option value="unattributed">Visible but not matched</option></select></Field>
        {observationEventType === "approved_variant" ? <p className="admin-muted">Use this registration only after the independent reviewer has passed the exact immutable pre-review packet. Copy its packet ID and exact content SHA-256. This records a manual handoff; it does not query the mailbox or gateway.</p> : observationEventType === "send_resolution" ? <p className="admin-muted">This appends an evidence record; it never contacts Zoho or edits the original attempt. Resolve only against the same exact SHA-256 and a visible message ID. A not-sent claim requires Sent, Outbox, and Drafts to show the matching draft attempt. If uncertain, leave it unresolved.</p> : <Field label="Count represented"><input type="number" name="quantity" min={0} max={10_000} defaultValue={1} required /></Field>}
        {observationEventType === "send_resolution" ? <><Field label="Uncertain send attempt to resolve"><select name="resolvesObservationId" required><option value="">Select an unresolved attempt</option>{resolvableSendAttempts.map((observation) => <option key={observation.id} value={observation.id}>{observation.visibleMessageId} · {dateLabel(observation.observedAt)} · {observation.outcome}</option>)}</select></Field>{!resolvableSendAttempts.length ? <p className="admin-muted">No unresolved attempt has both a registered reviewed-message hash and its original visible Zoho message ID. Without both, this path cannot safely link a later Sent/Drafts item; keep the attempt unresolved rather than guessing.</p> : null}<Field label="What does the exact message evidence show?"><select name="resolutionStatus" required><option value="verified_sent">Matching message is visible in Sent</option><option value="verified_not_sent">Matching attempt is still a draft; not sent</option></select></Field></> : null}
        <Field label={observationEventType === "approved_variant" ? "Immutable PASS packet ID" : observationEventType === "send_resolution" ? "Visible Zoho message or draft ID (not a thread ID)" : "Visible Zoho message ID (not a thread ID; if shown)"}><input name="visibleMessageId" maxLength={240} autoComplete="off" required={observationEventType === "approved_variant" || observationEventType === "send_resolution"} /></Field>
        <Field label="Approved message SHA-256 (64 hexadecimal characters)"><input name="variantId" maxLength={64} minLength={64} pattern="[A-Fa-f0-9]{64}" required={observationEventType === "approved_variant" || observationEventType === "send_resolution"} /></Field>
        <p className="admin-muted">Before attributing a message outcome, register that exact packet/hash as a PASS above. Do not attribute by subject line or packet label alone.</p>
        <fieldset className="campaign-folders"><legend>Folders actually checked</legend><p className="admin-muted">A final “no reply observed” check requires Inbox, Spam, and Sent, plus selection of every verified sent-message observation for this campaign. A “not sent” resolution additionally requires Outbox and Drafts.</p>{folderOptions.map((folder) => <label key={folder}><input type="checkbox" name="checkedFolders" value={folder} /> {label(folder)}</label>)}</fieldset>
        {observationEventType === "response_check" ? <fieldset className="campaign-folders"><legend>Sent messages covered by this check</legend>{eligibleNoReplySends.map((observation) => <label key={observation.id}><input type="checkbox" name="checkedSentObservationIds" value={observation.id} /> {observation.visibleMessageId} · {dateLabel(observation.observedAt)}</label>)}{unresolvedSendAttempts.length ? <p className="admin-muted">{unresolvedSendAttempts.length} possible send attempt{unresolvedSendAttempts.length === 1 ? " remains" : "s remain"} unresolved. Do not record “no reply observed” until each is reconciled with this exact reviewed hash and visible Zoho evidence.</p> : null}{!eligibleNoReplySends.length ? <p className="admin-muted">No verified sent message with a visible ID and registered PASS hash is available. This campaign cannot be finalized as “no reply observed.”</p> : null}{eligibleNoReplySends.length < verifiedSends.length ? <p className="admin-muted">Some verified sends lack a visible ID or registered PASS hash. A partial set cannot finalize this campaign.</p> : null}</fieldset> : null}
        <Field label={observationEventType === "approved_variant" ? "PASS reviewer / factual registration note (no email or message body)" : observationEventType === "close_out" ? "Factual close-out checkpoint (required; no message body or email address)" : observationEventType === "send_resolution" ? "Factual browser evidence (no full message or email address)" : "Factual note (no full message or email address)"}><textarea name="note" maxLength={2_000} rows={2} required={observationEventType === "close_out" || observationEventType === "approved_variant" || observationEventType === "send_resolution"} placeholder={observationEventType === "approved_variant" ? "PASS confirmed by independent review of the exact packet/hash above." : observationEventType === "close_out" ? "Facts: verified sends, delivery/bounces, replies, opt-outs, bookings; note unknowns. Keep explanations as hypotheses." : observationEventType === "send_resolution" ? "Identify the exact checked folders, matching draft/sent message ID, and reviewed hash; state any uncertainty." : "What was observed, and any limit on what it proves"} /></Field>
        <button className="admin-primary" disabled={saving}>Save observation</button>
      </form>}
    </section>

    <section className="admin-outreach-card">
      <p className="eyebrow">Experiment and action register</p><h2>Record the next improvement</h2>
      {campaigns.length === 0 ? <p className="admin-muted">A campaign record is required to attach a learning action.</p> : <form className="campaign-form" onSubmit={createAction}>
        <Field label="Originating campaign"><select name="campaignId" value={campaignId} onChange={(event) => setCampaignId(event.target.value)} required>{campaigns.map((campaign) => <option value={campaign.id} key={campaign.id}>{campaign.name}</option>)}</select></Field>
        <Field label="Hypothesis"><textarea name="hypothesis" required maxLength={2_000} rows={2} /></Field>
        <Field label="Concrete next action"><textarea name="action" required maxLength={2_000} rows={2} /></Field>
        <Field label="Expected measure"><input name="expectedMetric" required maxLength={300} placeholder="Qualified replies per delivered eligible prospect" /></Field>
        {(() => {
          const selectedCampaign = campaigns.find((campaign) => campaign.id === campaignId);
          const supportOptions = selectedCampaign ? supportingDeliveryOptions(selectedCampaign.cohort) : [];
          return <fieldset className="campaign-folders"><legend>Comparable evidence (verified Zoho deliveries)</legend><p className="admin-muted">Choose earlier delivered observations in this same cohort and exact reviewed-message version. The system derives the signal and record counts; unmatched, unverified, or different-version items cannot satisfy the threshold. Leaving this blank keeps the recommendation below threshold.</p>{supportOptions.length ? supportOptions.map(({ campaign, observation }) => <label key={observation.id}><input type="checkbox" name="supportingObservationIds" value={observation.id} /> {campaign.name} · {dateLabel(observation.observedAt)} · {observation.variantId?.slice(0, 12)}</label>) : <p className="admin-muted">No qualifying observed deliveries are available for this cohort.</p>}</fieldset>;
        })()}
        <div className="campaign-form-row"><Field label="Risk"><select name="risk"><option value="low">Low / reversible</option><option value="high">High-impact / user decision required</option></select></Field><Field label="Measurement window starts (Kampala time)"><input name="measurementWindowStartAt" type="datetime-local" required /></Field></div>
        <div className="campaign-form-row"><Field label="Measurement window ends (Kampala time)"><input name="measurementWindowEndAt" type="datetime-local" required /></Field><Field label="Review checkpoint (Kampala time)"><input name="measurementCheckpointAt" type="datetime-local" required /></Field></div>
        <Field label="Why do the evidence and counter-signals support this?"><textarea name="rationale" required maxLength={2_000} rows={2} /></Field>
        <Field label="Evidence references (one dated source/path per line)"><textarea name="evidenceRefs" required maxLength={5_000} rows={3} placeholder="Wave log, review record, dated checkpoint" /></Field>
        <Field label="Current decision"><textarea name="decision" required maxLength={1_000} rows={2} placeholder="Propose only; no process change until evidence threshold is met" /></Field>
        <p className="admin-muted">New actions always begin as recommendations. Supporting counts come from selected persisted observations, not numbers entered manually. Low-risk changes may be marked applied only with at least three comparable campaigns or ten individually identified delivered messages, plus an implementation reference. High-impact changes require a separate recorded user-approval status. Evaluation is allowed only after the checkpoint and requires an observed result. This register does not execute changes.</p>
        <button className="admin-primary" disabled={saving}>Save learning action</button>
      </form>}
    </section>

    {error ? <p className="admin-error campaign-feedback" role="alert">{error}</p> : null}
    {notice ? <p className="admin-success campaign-feedback" role="status">{notice}</p> : null}

    <section className="admin-outreach-card">
      <p className="eyebrow">Campaign history</p><h2>Observed outcomes</h2>
      {!initialData.completeness.campaigns.complete || !initialData.completeness.observations.complete ? <p className="admin-muted" role="note">Showing {initialData.completeness.campaigns.shown} of {initialData.completeness.campaigns.total} campaign records and {initialData.completeness.observations.shown} of {initialData.completeness.observations.total} event details. Outcome totals remain complete for the campaigns shown; older event details may be omitted.</p> : null}
      {campaigns.length === 0 ? <p className="admin-muted">No campaign observations recorded yet.</p> : <div className="campaign-history-list">{campaigns.map((campaign) => <article className="campaign-history-card" key={campaign.id}>
        <header><div><h3>{campaign.name}</h3><p>{campaign.cohort}</p></div><span className="admin-status">{label(campaign.state)}</span></header>
        <p><strong>Hypothesis:</strong> {campaign.hypothesis}</p>
        <p><strong>Response check due:</strong> {dateLabel(campaign.responseCheckDueAt)}{campaign.responseCheckDue ? " · due now; inspect Zoho" : ""}</p>
        <dl className="campaign-outcome-grid"><div><dt>Sent</dt><dd>{campaign.summary.sent}</dd></div><div><dt>Delivered</dt><dd>{campaign.summary.delivered}</dd></div><div><dt>Bounced</dt><dd>{campaign.summary.bounced}</dd></div><div><dt>Matched replies</dt><dd>{campaign.summary.attributableReplies}</dd></div><div><dt>Unmatched replies</dt><dd>{campaign.summary.unattributedReplies}</dd></div><div><dt>Qualified replies</dt><dd>{campaign.summary.qualifiedReplies}</dd></div><div><dt>Booked / attended</dt><dd>{campaign.summary.booked} / {campaign.summary.attended}</dd></div><div><dt>Opt-outs</dt><dd>{campaign.summary.optOuts}</dd></div></dl>
        {campaign.summary.unknownEvents ? <p className="admin-muted">{campaign.summary.unknownEvents} event(s) remain unverified and are excluded from outcome claims.</p> : null}
        {campaign.observations.length ? <ol className="campaign-observation-list">{campaign.observations.map((observation) => <li key={observation.id}><strong>{label(observation.eventType)} · {label(observation.outcome)}</strong><span>{dateLabel(observation.observedAt)} · {label(observation.attribution)}{observation.checkedFolders.length ? ` · checked: ${observation.checkedFolders.map(label).join(", ")}` : ""}</span>{observation.note ? <p>{observation.note}</p> : null}</li>)}</ol> : <p className="admin-muted">No observations for this campaign yet.</p>}
      </article>)}</div>}
    </section>

    <section className="admin-outreach-card">
      <p className="eyebrow">Like-for-like view</p><h2>Comparable cohort results</h2>
      <p className="admin-muted">Rows combine only the same declared cohort and exact reviewed-message SHA-256, using outcomes manually verified in Zoho and matched to that message. Rates use verified delivered messages as the denominator. Unmatched or unknown events are not counted as results; different message versions are never merged.</p>
      {!initialData.completeness.campaigns.complete ? <p className="admin-muted" role="note">This view uses the {initialData.completeness.campaigns.shown} most recent campaign records of {initialData.completeness.campaigns.total}; older cohorts may be omitted.</p> : null}
      {initialData.comparableCohorts.length === 0 ? <p className="admin-muted">No attributable, version-linked outcomes are available for comparison yet.</p> : <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Cohort</th><th>Reviewed version</th><th>Matched waves</th><th>Sent</th><th>Delivered</th><th>Bounces</th><th>Matched replies</th><th>Qualified</th><th>Qualified / delivered</th><th>Booked / attended</th><th>Opt-outs</th><th>Unknown</th></tr></thead><tbody>{initialData.comparableCohorts.map((row) => <tr key={`${row.cohort}:${row.variantId ?? "unlinked"}`}><td>{row.cohort}</td><td>{row.variantId ? row.variantId.slice(0, 12) : "Unlinked / unknown"}</td><td>{row.campaignCount}</td><td>{row.sent}</td><td>{row.delivered}</td><td>{row.bounced}</td><td>{row.attributableReplies}</td><td>{row.qualifiedReplies}</td><td>{rateLabel(row.qualifiedReplyRate)}</td><td>{row.booked} / {row.attended}</td><td>{row.optOuts}</td><td>{row.unknownEvents}</td></tr>)}</tbody></table></div>}
      <p className="admin-muted">Descriptive results only: this table does not declare a winning message or prove causation. Treat an improvement as a candidate only after at least 3 comparable signals or 10 relevant records, and evaluate it at its recorded checkpoint. A dash means there is no verified delivered denominator.</p>
    </section>

    <section className="admin-outreach-card">
      <p className="eyebrow">Action register</p><h2>Recommendations and decisions</h2>
      {!initialData.completeness.actions.complete || !initialData.completeness.actionHistory.complete ? <p className="admin-muted" role="note">Showing {initialData.completeness.actions.shown} of {initialData.completeness.actions.total} actions and {initialData.completeness.actionHistory.shown} of {initialData.completeness.actionHistory.total} history entries.</p> : null}
      {initialData.actions.length ? <ul className="campaign-observation-list">{initialData.actions.map((action) => <li key={action.id}><strong>{action.action}</strong><span>{label(action.status)} · {label(action.risk)} risk · {action.comparableSignals} comparable signals / {action.relevantRecords} records · {dateLabel(action.createdAt)}</span><p><strong>Hypothesis:</strong> {action.hypothesis}</p><p><strong>Why / evidence:</strong> {action.rationale ?? "Legacy action; rationale not recorded."} {action.evidenceRefs?.length ? `(${action.evidenceRefs.join(", ")})` : ""}</p><p><strong>Expected measure:</strong> {action.expectedMetric}</p><p><strong>Measurement window:</strong> {action.measurementWindowStartAt && action.measurementWindowEndAt ? `${dateLabel(action.measurementWindowStartAt)} – ${dateLabel(action.measurementWindowEndAt)}` : "not recorded"}; <strong>checkpoint:</strong> {action.measurementCheckpointAt ? dateLabel(action.measurementCheckpointAt) : "not recorded"}</p><p><strong>Decision:</strong> {action.decision ?? "Legacy action; decision not recorded."}</p>{action.implementationReference ? <p><strong>Change reference:</strong> {action.implementationReference}</p> : null}{action.result ? <p><strong>Observed result:</strong> {action.result}</p> : null}{action.history.length ? <details><summary>Status history ({action.history.length})</summary><ol>{action.history.map((entry) => <li key={entry.id}><strong>{entry.eventKind === "migration_snapshot" ? "History begins at migration snapshot: " : `${entry.previousStatus ? `${label(entry.previousStatus)} → ` : ""}`}{label(entry.status)}</strong><span>{dateLabel(entry.createdAt)} · {entry.createdBy}</span><p>{entry.rationale}</p><p><strong>Decision:</strong> {entry.decision}</p>{entry.evidenceRefs.length ? <p><strong>Evidence:</strong> {entry.evidenceRefs.join(", ")}</p> : null}{entry.result ? <p><strong>Measured result:</strong> {entry.result}</p> : null}</li>)}</ol></details> : null}{nextActionStatuses(action).length ? <details><summary>Record a status change</summary><form className="campaign-form" onSubmit={(event) => transitionAction(event, action)}><Field label="New status"><select name="status" required>{nextActionStatuses(action).map((status) => <option value={status} key={status}>{label(status)}</option>)}</select></Field><Field label="Rationale"><textarea name="rationale" required maxLength={2_000} rows={2} /></Field><Field label="Evidence references (one per line)"><textarea name="evidenceRefs" required maxLength={5_000} rows={2} /></Field><Field label="Decision"><textarea name="decision" required maxLength={1_000} rows={2} /></Field><Field label="Implementation reference (required when applying)"><input name="implementationReference" maxLength={500} /></Field><Field label="Observed result (required when evaluating)"><textarea name="result" maxLength={2_000} rows={2} /></Field><button className="admin-primary" disabled={saving}>Save status event</button></form></details> : null}</li>)}</ul> : <p className="admin-muted">No improvement actions recorded.</p>}
    </section>
  </main>;
}
