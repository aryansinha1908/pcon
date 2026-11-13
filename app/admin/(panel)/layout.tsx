import Link from "next/link";
import { Brand } from "@/components/brand";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { requireUser } from "@/lib/auth-guards";
import { hasRole, roleLabel } from "@/lib/roles";
import { AdminTopbar, type NavItem } from "../_components/admin-nav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

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
      <AdminTopbar
        items={items}
        brand={
          <div className="adm-topbar__brand">
            <Brand />
            <span className="adm-topbar__label">Admin</span>
          </div>
        }
        user={
          <>
            <span className="adm-topbar__who">
              <strong>{user.name ?? user.email}</strong>
              <span className="adm-badge">{roleLabel(user.role)}</span>
            </span>
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
            <Link href="/" className="adm-topbar__site">
              View site ↗
            </Link>
          </>
        }
      />
      <main className="adm-main">{children}</main>
    </div>
  );
}