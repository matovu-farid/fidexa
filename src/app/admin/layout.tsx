import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession(await headers());
  if (!session) redirect("/admin-auth");
  return <div className="admin-frame">{children}</div>;
}
