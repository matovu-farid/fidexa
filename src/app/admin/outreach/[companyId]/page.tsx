import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { readOutreachCompany } from "@/lib/outreach-reader";
import { getBoundedOutreachCompanyId } from "@/lib/outreach-dashboard";
import { OutreachCompanyDetail } from "@/components/admin/outreach-company-detail";

export const dynamic = "force-dynamic";

export default async function OutreachCompanyPage({ params, searchParams }: { params: Promise<{ companyId: string }>; searchParams: Promise<{ q?: string; status?: string }> }) {
  const [{ companyId: requestedId }, { q, status }] = await Promise.all([params, searchParams]);
  const companyId = getBoundedOutreachCompanyId(requestedId);
  const queueQuery = new URLSearchParams();
  if (q?.trim()) queueQuery.set("q", q.trim());
  if (status) queueQuery.set("status", status);
  const queueHref = queueQuery.size ? `/admin/outreach?${queueQuery.toString()}` : "/admin/outreach";

  if (!companyId) {
    return <main className="admin-outreach-page admin-outreach"><Alert><AlertTitle><h1>That company record cannot be opened.</h1></AlertTitle><AlertDescription>Choose a valid company from the research queue.</AlertDescription><Button variant="outline" asChild><Link href="/admin/outreach">Back to companies</Link></Button></Alert></main>;
  }

  try {
    const detail = await readOutreachCompany(companyId);
    return <main className="admin-outreach-page admin-outreach admin-company-page">
      <nav className="admin-company-nav" aria-label="Company navigation">
        <Button variant="ghost" asChild><Link href={queueHref}>← All companies</Link></Button>
        <div className="admin-header-actions">
          <Button variant="outline" asChild><Link href="/admin/outreach/learning">Campaign learning</Link></Button>
          <Button variant="outline" asChild><Link href="/admin">Admin home</Link></Button>
        </div>
      </nav>
      <OutreachCompanyDetail detail={detail} />
    </main>;
  } catch {
    return <main className="admin-outreach-page admin-outreach admin-company-page">
      <nav className="admin-company-nav" aria-label="Company navigation">
        <Button variant="ghost" asChild><Link href={queueHref}>← All companies</Link></Button>
        <Button variant="outline" asChild><Link href="/admin">Admin home</Link></Button>
      </nav>
      <Alert><AlertTitle><h1>Company details are unavailable.</h1></AlertTitle><AlertDescription>The outreach reporting service could not load this company. Go back to the queue and try again later.</AlertDescription></Alert>
    </main>;
  }
}
