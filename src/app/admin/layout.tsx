import { privateMetadata } from "@/lib/seo";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = privateMetadata;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession(await headers());
  if (!session) redirect("/admin-auth");

  return <AdminShell email={session.user.email}>{children}</AdminShell>;
}
