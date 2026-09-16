import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { readOutreachEvidence } from "@/lib/outreach-reader";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession(await headers());
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id || id.length > 200) return NextResponse.json({ error: "not_found" }, { status: 404 });

  try {
    const evidence = await readOutreachEvidence(id);
    return new NextResponse(evidence.body, {
      headers: {
        "content-type": evidence.headers.get("content-type") ?? "application/octet-stream",
        "content-disposition": "attachment",
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "evidence_unavailable" }, { status: 404 });
  }
}
