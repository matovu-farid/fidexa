import Link from "next/link";
import { headers } from "next/headers";
import { ArrowUpRight, BookOpen, Building2, ShieldCheck } from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
  {
    title: "Company pipeline",
    description: "Search researched companies and review their records.",
    detail: "Company research, evidence, and delivery history in one place.",
    href: "/admin/outreach",
    action: "Open pipeline",
    icon: Building2,
  },
  {
    title: "Campaign learning",
    description: "Review outcomes and record what the outreach process learns.",
    detail: "Use campaign outcomes to inform the next outreach decision.",
    href: "/admin/outreach/learning",
    action: "Open learning",
    icon: BookOpen,
  },
];

export default async function AdminPage() {
  const session = await getAdminSession(await headers());

  return (
    <main id="admin-main" className="admin-overview">
      <header className="admin-page-heading">
        <Badge variant="outline"><ShieldCheck />Authenticated</Badge>
        <h1>Outreach operations</h1>
        <p>Review company research, delivery history, and campaign outcomes.</p>
        <p className="admin-session-label">Signed in as <span>{session?.user.email}</span></p>
      </header>
      <nav className="admin-overview-tools" aria-label="Admin tools">
        {tools.map((tool) => (
          <Card key={tool.href} className="admin-tool-card">
            <CardHeader>
              <div className="admin-tool-icon" aria-hidden="true"><tool.icon /></div>
              <CardTitle><h2>{tool.title}</h2></CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent><p className="admin-tool-detail">{tool.detail}</p></CardContent>
            <CardFooter>
              <Button asChild variant={tool.href === "/admin/outreach" ? "default" : "outline"}>
                <Link href={tool.href}>{tool.action}<ArrowUpRight data-icon="inline-end" /></Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </nav>
    </main>
  );
}
