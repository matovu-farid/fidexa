"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Building2, ExternalLink, House, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

const navigation = [
  { label: "Home", href: "/admin", icon: House },
  { label: "Outreach", href: "/admin/outreach", icon: Building2 },
  { label: "Learning", href: "/admin/outreach/learning", icon: BookOpen },
];

function WorkspaceSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  function active(href: string) {
    if (href === "/admin") return pathname === href;
    if (href === "/admin/outreach") return pathname.startsWith(href) && !pathname.startsWith("/admin/outreach/learning");
    return pathname.startsWith(href);
  }

  return (
    <Sidebar className="admin-workspace-sidebar" collapsible="offcanvas">
      <SidebarHeader className="admin-workspace-brand">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/admin" onClick={() => setOpenMobile(false)}>
                <span className="admin-brand-mark"><Logo variant="light" size={36} /></span>
                <span className="admin-brand-copy"><strong>fidexa</strong><span>Workspace</span></span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent role="navigation" aria-label="Workspace navigation">
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={active(item.href)} size="lg">
                    <Link href={item.href} aria-current={active(item.href) ? "page" : undefined} onClick={() => setOpenMobile(false)}>
                      <item.icon /><span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="admin-workspace-account">
        <Button asChild variant="ghost" className="justify-start">
          <Link href="/" onClick={() => setOpenMobile(false)}><ExternalLink data-icon="inline-start" />View public site</Link>
        </Button>
        <Separator />
        <div className="admin-account-copy"><span>Signed in as</span><strong>{email}</strong></div>
        <SignOutButton className="w-full justify-start" />
      </SidebarFooter>
    </Sidebar>
  );
}

function WorkspaceBreadcrumb() {
  const pathname = usePathname();
  const isHome = pathname === "/admin";
  const isLearning = pathname.startsWith("/admin/outreach/learning");
  const isCompany = pathname.startsWith("/admin/outreach/") && !isLearning;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {isHome ? <BreadcrumbPage>Home</BreadcrumbPage> : <BreadcrumbLink asChild><Link href="/admin">Home</Link></BreadcrumbLink>}
        </BreadcrumbItem>
        {!isHome && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {isCompany ? <BreadcrumbLink asChild><Link href="/admin/outreach">Outreach</Link></BreadcrumbLink> : <BreadcrumbPage>{isLearning ? "Learning" : "Outreach"}</BreadcrumbPage>}
            </BreadcrumbItem>
          </>
        )}
        {isCompany && <><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Company record</BreadcrumbPage></BreadcrumbItem></>}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  return (
    <SidebarProvider className="admin-workspace">
      <WorkspaceSidebar email={email} />
      <div className="admin-workspace-body">
        <header className="admin-workspace-topbar">
          <div className="admin-workspace-location">
            <SidebarTrigger className="size-11" />
            <Separator orientation="vertical" className="h-5" />
            <WorkspaceBreadcrumb />
          </div>
          <Badge variant="outline" className="admin-workspace-private"><ShieldCheck />Private workspace</Badge>
        </header>
        {children}
      </div>
    </SidebarProvider>
  );
}
