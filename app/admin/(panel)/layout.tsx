import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { requireUser } from "@/lib/auth-guards";
import { hasRole, roleLabel } from "@/lib/roles";
import { AdminNav, type NavItem } from "../_components/admin-nav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  // Members only see their own blogs; admins see content tools; owners also see users.
  const items: NavItem[] = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/blogs", label: hasRole(user.role, "ADMIN") ? "Blogs" : "My blogs" },
    ...(hasRole(user.role, "ADMIN")
      ? [
          { href: "/admin/events", label: "Events" },
          { href: "/admin/team", label: "Team Management" },
        ]
      : []),
    ...(hasRole(user.role, "OWNER") ? [{ href: "/admin/users", label: "Users & roles" }] : []),
  ];

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <Link href="/admin" className="adm-sidebar__brand">
          <Image src="/pcon-logo.png" alt="" width={57} height={34} />
          <span>
            <strong>PCON</strong>
            <small>Admin</small>
          </span>
        </Link>
        <AdminNav items={items} />
        <div className="adm-sidebar__user">
          <div>
            <strong>{user.name ?? user.email}</strong>
            <span className="adm-badge">{roleLabel(user.role)}</span>
          </div>
          <form
            action={async () => {
              "use server";
              const { cookies } = await import("next/headers");
              const cookieStore = await cookies();
              cookieStore.delete("pcon_dev_admin_session");
              try {
                await signOut({ redirectTo: "/admin/login" });
              } catch {
                redirect("/admin/login");
              }
            }}
          >
            <button type="submit" className="adm-btn adm-btn--ghost adm-btn--sm">
              Sign out
            </button>
          </form>
          <Link href="/" className="adm-sidebar__site">
            View site ↗
          </Link>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
