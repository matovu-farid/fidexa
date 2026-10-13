import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyDescription } from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from "@/components/ui/table";
import {
  readOutreachCompanies,
  readOutreachFollowUps,
  readOutreachMessages,
  readOutreachSummary,
} from "@/lib/outreach-reader";
import { getBoundedOutreachCompanyId } from "@/lib/outreach-dashboard";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function total(items: Array<{ count: number }>) { return items.reduce((sum, item) => sum + Number(item.count), 0); }
function queueStateQuery(q?: string, status?: string) {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (status) params.set("status", status);
  const query = params.toString();
  return query ? `?${query}` : "";
}
function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Kampala", timeZoneName: "short" });
}
function Status({ children }: { children: string }) { return <Badge variant="secondary">{children.replaceAll("_", " ")}</Badge>; }
function QueueEmpty({ children }: { children: string }) { return <Empty><EmptyHeader><EmptyDescription>{children}</EmptyDescription></EmptyHeader></Empty>; }

export default async function OutreachAdminPage({ searchParams }: { searchParams: Promise<{ company?: string; q?: string; status?: string }> }) {
  const { company: requestedCompany, q, status } = await searchParams;
  const companyId = getBoundedOutreachCompanyId(requestedCompany);
  if (companyId) redirect(`/admin/outreach/${encodeURIComponent(companyId)}${queueStateQuery(q, status)}`);
  try {
    const [summary, companies, messages, followUps] = await Promise.all([readOutreachSummary(), readOutreachCompanies(), readOutreachMessages(), readOutreachFollowUps()]);
    const search = q?.trim().toLocaleLowerCase() ?? "";
    const statuses = [...new Set(companies.items.map((company) => company.status))].sort();
    const filteredCompanies = companies.items.filter((company) => {
      const matchesSearch = !search || [company.name, company.normalized_domain, company.website_url].some((value) => value?.toLocaleLowerCase().includes(search));
      const matchesStatus = !status || company.status === status;
      return matchesSearch && matchesStatus;
    });
    const hasFilters = Boolean(search || status);
    return <main className="admin-outreach-page admin-outreach">
      <header className="admin-outreach-header"><div><p className="eyebrow">Fidexa / Outreach</p><h1>Client pipeline</h1><p className="admin-muted">Read-only gateway history; this view does not read signed-in Zoho Mail. Record browser-verified campaign outcomes separately in the learning ledger.</p></div><div className="admin-header-actions"><Button asChild><Link href="/admin/outreach/learning">Campaign learning</Link></Button><Button variant="outline" asChild><Link href="/admin">Back to admin</Link></Button></div></header>
      <section className="admin-stat-grid" aria-label="Outreach totals"><Card><CardHeader><CardDescription>Companies</CardDescription></CardHeader><CardContent><p className="admin-metric-value">{total(summary.companies)}</p></CardContent></Card><Card><CardHeader><CardDescription>Drafts</CardDescription></CardHeader><CardContent><p className="admin-metric-value">{total(summary.drafts)}</p></CardContent></Card><Card><CardHeader><CardDescription>Messages</CardDescription></CardHeader><CardContent><p className="admin-metric-value">{total(summary.messages)}</p></CardContent></Card></section>
      <Card className="outreach-queue-card"><CardHeader><div className="admin-section-heading"><div><CardDescription>Discovered accounts</CardDescription><CardTitle><h2>Research queue</h2></CardTitle></div><Badge variant="outline">{filteredCompanies.length} of {companies.items.length}</Badge></div></CardHeader><CardContent><form method="get" action="/admin/outreach"><FieldGroup className="outreach-queue-controls grid"><Field><FieldLabel htmlFor="queue-search">Find a company</FieldLabel><Input id="queue-search" type="search" name="q" placeholder="Name or domain" defaultValue={q ?? ""} /></Field><Field><FieldLabel htmlFor="queue-status">Research state</FieldLabel><NativeSelect id="queue-status" name="status" defaultValue={status ?? ""}><NativeSelectOption value="">All states</NativeSelectOption>{statuses.map((item) => <NativeSelectOption value={item} key={item}>{item.replaceAll("_", " ")}</NativeSelectOption>)}</NativeSelect></Field><div className="outreach-filter-actions"><Button variant="outline" type="submit">Apply filters</Button>{hasFilters ? <Button variant="ghost" asChild><Link href="/admin/outreach">Clear</Link></Button> : null}</div></FieldGroup></form>{companies.items.length === 0 ? <QueueEmpty>No companies have been recorded yet.</QueueEmpty> : filteredCompanies.length === 0 ? <QueueEmpty>No companies match those filters. Clear the search or choose another state.</QueueEmpty> : <div className="outreach-table-scroll"><Table className="outreach-company-table"><TableCaption className="sr-only">Companies in the outreach research queue</TableCaption><TableHeader><TableRow><TableHead scope="col">Company</TableHead><TableHead scope="col">State</TableHead><TableHead scope="col">Fit / 100</TableHead><TableHead scope="col">Updated · EAT</TableHead></TableRow></TableHeader><TableBody>{filteredCompanies.map((company) => <TableRow key={company.id}><TableCell><a href={`/admin/outreach/${encodeURIComponent(company.id)}${queueStateQuery(q, status)}`}>{company.name}</a><small>{company.normalized_domain ?? company.website_url ?? "No public domain recorded"}</small></TableCell><TableCell><Status>{company.status}</Status></TableCell><TableCell>{company.fit_score ?? "—"}</TableCell><TableCell>{formatDate(company.updated_at)}</TableCell></TableRow>)}</TableBody></Table></div>}</CardContent><CardFooter><p className="text-sm text-muted-foreground">Fit is a triage score out of 100. It does not mean the company is eligible for contact.</p></CardFooter></Card>
      <section className="admin-outreach-split"><Card><CardHeader><CardDescription>Recent delivery history</CardDescription><CardTitle><h2>Messages</h2></CardTitle></CardHeader><CardContent>{messages.items.length === 0 ? <QueueEmpty>No messages recorded yet.</QueueEmpty> : <ul className="admin-record-list">{messages.items.slice(0, 8).map((message) => <li key={message.id}><strong>{message.subject}</strong><span><Status>{message.status}</Status></span></li>)}</ul>}</CardContent></Card><Card><CardHeader><CardDescription>Next actions</CardDescription><CardTitle><h2>Follow-ups</h2></CardTitle></CardHeader><CardContent>{followUps.items.length === 0 ? <QueueEmpty>No follow-ups scheduled yet.</QueueEmpty> : <ul className="admin-record-list">{followUps.items.slice(0, 8).map((followUp) => <li key={followUp.id}><strong>{followUp.note}</strong><span><Status>{followUp.state}</Status></span></li>)}</ul>}</CardContent></Card></section>
    </main>;
  } catch {
    return <main className="admin-outreach-page admin-outreach"><header className="admin-outreach-header"><div><p className="eyebrow">Fidexa / Outreach</p><h1>Client pipeline</h1></div><Button variant="outline" asChild><Link href="/admin">Back to admin</Link></Button></header><Alert><AlertTitle>Outreach data is not available yet.</AlertTitle><AlertDescription>Configure the server-side Worker origin and read capability to display reporting. No browser credential is used here.</AlertDescription></Alert></main>;
  }
}
