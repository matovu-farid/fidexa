import { headers } from "next/headers";
import { getAdminSession } from "@/lib/auth";
import { SignOutButton } from "@/components/admin/sign-out-button";

export default async function AdminPage() {
  const session = await getAdminSession(await headers());

  return (
    <main className="admin-home">
      <header className="admin-home-header">
        <div>
          <p className="eyebrow">Fidexa / Workspace</p>
          <h1>Admin</h1>
        </div>
        <SignOutButton />
      </header>
      <section className="admin-home-card">
        <p className="eyebrow">Authenticated</p>
        <h2>Welcome back.</h2>
        <p className="admin-muted">You are signed in as {session?.user.email}. The private Fidexa workspace is ready for its next admin tools.</p>
      </section>
    </main>
  );
}
