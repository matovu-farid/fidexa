import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getBoundedOutreachCompanyId } from "@/lib/outreach-dashboard";
import { readOutreachCompanies, readOutreachCompany, readOutreachFollowUps, readOutreachMessages, readOutreachSummary } from "@/lib/outreach-reader";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getAdminSession(await headers());
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const requestedCompanyId = new URL(request.url).searchParams.get("company");
    const companyId = getBoundedOutreachCompanyId(requestedCompanyId);
    if (requestedCompanyId !== null && !companyId) return NextResponse.json({ error: "invalid_company" }, { status: 400 });
    const [summary, companies, messages, followUps, company] = await Promise.all([
      readOutreachSummary(),
      readOutreachCompanies(),
      readOutreachMessages(),
      readOutreachFollowUps(),
      companyId ? readOutreachCompany(companyId) : Promise.resolve(null),
    ]);
    return NextResponse.json({ summary, companies, messages, followUps, company });
  } catch {
    return NextResponse.json({ error: "outreach_unavailable" }, { status: 503 });
  }
}
