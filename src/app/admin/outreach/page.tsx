import {
  readOutreachCompanies,
  readOutreachCompany,
  readOutreachFollowUps,
  readOutreachMessages,
  readOutreachSummary,
  isSafeExternalUrl,
  type OutreachCompanyDetail,
} from "@/lib/outreach-reader";
import { classifyOutreachDashboard, getBoundedOutreachCompanyId } from "@/lib/outreach-dashboard";

export const dynamic = "force-dynamic";

function total(items: Array<{ count: number }>) { return items.reduce((sum, item) => sum + Number(item.count), 0); }
function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
}
function Status({ children }: { children: string }) { return <span className="admin-status">{children.replaceAll("_", " ")}</span>; }
function Empty({ children }: { children: string }) { return <p className="admin-muted admin-empty">{children}</p>; }

function CompanyDetail({ detail }: { detail: OutreachCompanyDetail | null }) {
  if (!detail?.company) return <section className="admin-outreach-card"><p className="eyebrow">No match</p><h2>That company is not in the reporting view.</h2><p className="admin-muted">Choose a company from the table to inspect its recorded workflow.</p></section>;
  const { company } = detail;
  return <section className="admin-detail" aria-label={`${company.name} reporting detail`}>
    <header className="admin-outreach-card admin-detail-intro"><p className="eyebrow">Company record</p><div className="admin-section-heading"><div><h2>{company.name}</h2><p className="admin-muted">{company.normalized_domain ?? company.website_url ?? "No public domain recorded"}</p></div><Status>{company.status}</Status></div><dl className="admin-detail-facts"><div><dt>Fit score</dt><dd>{company.fit_score ?? "Not scored"}</dd></div><div><dt>Last updated</dt><dd>{formatDate(company.updated_at)}</dd></div></dl><p className="admin-prose">{company.fit_summary ?? "No fit rationale has been recorded."}</p></header>
    <div className="admin-detail-grid">
      <section className="admin-outreach-card"><p className="eyebrow">Verified contacts</p><h2>Recipients</h2>{detail.contacts.length === 0 ? <Empty>No contacts have been recorded.</Empty> : <ul className="admin-record-list">{detail.contacts.map((contact) => <li key={contact.id}><strong>{contact.name ?? contact.email}</strong><span>{contact.role ?? contact.email}</span><small>{contact.verification_method ? `${contact.verification_method.replaceAll("_", " ")} · ${formatDate(contact.verified_at)}` : "Verification has not been recorded"}</small></li>)}</ul>}</section>
      <section className="admin-outreach-card"><p className="eyebrow">Research runs</p><h2>Run history</h2>{detail.researchRuns.length === 0 ? <Empty>No research runs have been recorded.</Empty> : <ul className="admin-record-list">{detail.researchRuns.map((run) => <li key={run.id}><strong><Status>{run.state}</Status></strong><span>Started {formatDate(run.started_at)}</span><small>{run.completed_at ? `Completed ${formatDate(run.completed_at)}` : run.failure_code ?? "In progress"}</small></li>)}</ul>}</section>
    </div>
    <section className="admin-outreach-card"><p className="eyebrow">Research provenance</p><h2>Findings and evidence</h2>{detail.findings.length === 0 && detail.evidence.length === 0 ? <Empty>No findings or evidence metadata have been recorded.</Empty> : <div className="admin-detail-grid"><ul className="admin-record-list">{detail.findings.map((finding) => <li key={finding.id}><strong>{finding.category} · {finding.confidence}</strong><span>{finding.finding}</span>{isSafeExternalUrl(finding.source_url) ? <a href={finding.source_url} target="_blank" rel="noreferrer">Open recorded source</a> : <small>{finding.source_url}</small>}</li>)}</ul><ul className="admin-record-list">{detail.evidence.map((evidence) => <li key={evidence.id}><strong>{evidence.provenance} · {evidence.content_type}</strong><span>{evidence.source_url ?? "No source URL recorded"}</span><small>{evidence.byte_size.toLocaleString()} bytes · captured {formatDate(evidence.captured_at)}</small><a href={`/api/admin/outreach/evidence/${encodeURIComponent(evidence.id)}`}>Download authenticated evidence</a></li>)}</ul></div>}</section>
    <section className="admin-outreach-card"><p className="eyebrow">Drafts and independent review</p><h2>Review gates</h2>{detail.drafts.length === 0 ? <Empty>No drafts have been recorded.</Empty> : <div className="admin-draft-list">{detail.drafts.map((draft) => <article className="admin-draft" key={draft.id}><div className="admin-section-heading"><div><strong>{draft.subject}</strong><p className="admin-muted">Created {formatDate(draft.created_at)}</p></div><Status>{draft.state}</Status></div><pre>{draft.body}</pre><p className="admin-muted">Claim evidence: {draft.claim_evidence_ids.length ? draft.claim_evidence_ids.join(", ") : "None recorded"}</p>{draft.reviews.length ? <div className="admin-review"><strong>Review history</strong>{draft.reviews.map((review) => <section key={review.id} className="admin-review-entry"><p><Status>{review.decision}</Status> · {review.policy_version} · {formatDate(review.reviewed_at)}</p><ul>{review.findings.map((finding, index) => <li key={`${review.id}-${index}`}>{finding}</li>)}</ul><p className="admin-muted">Checklist: {review.checklist.length ? review.checklist.map((item) => item.replaceAll("_", " ")).join(", ") : "No completed checklist recorded"}</p></section>)}</div> : <p className="admin-muted">No review has been recorded.</p>}</article>)}</div>}</section>
    <div className="admin-detail-grid">
      <section className="admin-outreach-card"><p className="eyebrow">Delivery and replies</p><h2>Messages</h2>{detail.messages.length === 0 ? <Empty>No messages have been recorded.</Empty> : <ul className="admin-record-list">{detail.messages.map((message) => <li key={message.id}><strong>{message.subject}</strong><span><Status>{message.status}</Status> · {message.direction}</span><small>{message.events?.length ? message.events.map((event) => `${event.event_type} (${formatDate(event.created_at)})`).join(" · ") : `Created ${formatDate(message.created_at)}`}</small></li>)}</ul>}</section>
      <section className="admin-outreach-card"><p className="eyebrow">Next actions</p><h2>Follow-ups</h2>{detail.followUps.length === 0 ? <Empty>No follow-ups are scheduled.</Empty> : <ul className="admin-record-list">{detail.followUps.map((followUp) => <li key={followUp.id}><strong>{followUp.note}</strong><span><Status>{followUp.state}</Status></span><small>Due {formatDate(followUp.due_at)}</small></li>)}</ul>}</section>
    </div>
    <section className="admin-outreach-card"><p className="eyebrow">Workflow history</p><h2>Audit timeline</h2>{detail.auditTimeline.length === 0 ? <Empty>No workflow events are available for this company.</Empty> : <ol className="admin-audit-list">{detail.auditTimeline.map((event) => <li key={event.id}><time>{formatDate(event.created_at)}</time><div><strong>{event.tool_name.replaceAll("_", " ")}</strong><p>{event.previous_state ?? "—"} → {event.next_state ?? "—"}{event.credential_role ? ` · ${event.credential_role}` : ""}</p></div></li>)}</ol>}</section>
  </section>;
}

export default async function OutreachAdminPage({ searchParams }: { searchParams: Promise<{ company?: string }> }) {
  const { company: requestedCompany } = await searchParams;
  const companyId = getBoundedOutreachCompanyId(requestedCompany);
  const companyRequested = requestedCompany !== undefined;
  try {
    const [summary, companies, messages, followUps, detail] = await Promise.all([readOutreachSummary(), readOutreachCompanies(), readOutreachMessages(), readOutreachFollowUps(), companyId ? readOutreachCompany(companyId) : Promise.resolve(null)]);
    const dashboardState = classifyOutreachDashboard({ workerAvailable: true, companyRequested, companyFound: Boolean(detail?.company), companyCount: companies.items.length });
    return <main className="admin-outreach">
      <header className="admin-outreach-header"><div><p className="eyebrow">Fidexa / Outreach</p><h1>Client pipeline</h1><p className="admin-muted">Read-only reporting from the outreach Worker. Research, review, delivery, and inbound sync remain recorded there.</p></div><a className="admin-secondary" href="/admin">Back to admin</a></header>
      <section className="admin-stat-grid" aria-label="Outreach totals"><article className="admin-stat"><span>Companies</span><strong>{total(summary.companies)}</strong></article><article className="admin-stat"><span>Drafts</span><strong>{total(summary.drafts)}</strong></article><article className="admin-stat"><span>Messages</span><strong>{total(summary.messages)}</strong></article></section>
      <section className="admin-outreach-card"><div className="admin-section-heading"><div><p className="eyebrow">Discovered accounts</p><h2>Research queue</h2></div><span className="admin-muted">{companies.items.length} shown</span></div>{companies.items.length === 0 ? <Empty>No companies have been recorded yet.</Empty> : <div className="admin-table-scroll"><table className="admin-company-table"><caption className="sr-only">Companies in the outreach research queue</caption><thead><tr><th scope="col">Company</th><th scope="col">State</th><th scope="col">Fit</th><th scope="col">Updated</th></tr></thead><tbody>{companies.items.map((company) => <tr key={company.id}><th scope="row"><a href={`/admin/outreach?company=${encodeURIComponent(company.id)}`}>{company.name}</a><small>{company.normalized_domain ?? company.website_url ?? "No public domain recorded"}</small></th><td><Status>{company.status}</Status></td><td>{company.fit_score ?? "—"}</td><td>{formatDate(company.updated_at)}</td></tr>)}</tbody></table></div>}</section>
      {companyRequested ? <CompanyDetail detail={dashboardState === "missing" ? null : detail} /> : <section className="admin-outreach-card"><p className="eyebrow">Company drill-down</p><h2>Select a company to inspect its operational record.</h2><p className="admin-muted">The detail view includes recorded research provenance, review gates, delivery and reply events, follow-ups, and audit history.</p></section>}
      <section className="admin-outreach-split"><article className="admin-outreach-card"><p className="eyebrow">Recent delivery history</p><h2>Messages</h2>{messages.items.length === 0 ? <Empty>No messages recorded yet.</Empty> : <ul className="admin-record-list">{messages.items.slice(0, 8).map((message) => <li key={message.id}><strong>{message.subject}</strong><span><Status>{message.status}</Status></span></li>)}</ul>}</article><article className="admin-outreach-card"><p className="eyebrow">Next actions</p><h2>Follow-ups</h2>{followUps.items.length === 0 ? <Empty>No follow-ups scheduled yet.</Empty> : <ul className="admin-record-list">{followUps.items.slice(0, 8).map((followUp) => <li key={followUp.id}><strong>{followUp.note}</strong><span><Status>{followUp.state}</Status></span></li>)}</ul>}</article></section>
    </main>;
  } catch {
    return <main className="admin-outreach"><header className="admin-outreach-header"><div><p className="eyebrow">Fidexa / Outreach</p><h1>Client pipeline</h1></div><a className="admin-secondary" href="/admin">Back to admin</a></header><section className="admin-outreach-card"><p className="eyebrow">Not connected</p><h2>Outreach data is not available yet.</h2><p className="admin-muted">Configure the server-side Worker origin and read capability to display reporting. No browser credential is used here.</p></section></main>;
  }
}
