"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type NavItem = { href: string; label: string };

/**
 * Admin top bar. Shows the brand, a horizontal nav and the user block in one
 * row on desktop; below ~860px the nav + user block collapse behind a burger
 * (top right) that toggles a dropdown panel.
 *
 * `brand` and `user` are rendered on the server (the user block carries the
 * sign-out server action) and passed in as slots, so this client component
 * only owns the open/close state and the active-link highlighting.
 */
export function AdminTopbar({
  items,
  brand,
  user,
}: {
  items: NavItem[];
  brand: React.ReactNode;
  user: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="adm-topbar">
      <div className="adm-topbar__inner">
        {brand}
        <button
          type="button"
          className="adm-burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="adm-topbar-menu"
          data-open={open ? "" : undefined}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
        <div id="adm-topbar-menu" className="adm-topbar__menu" data-open={open ? "" : undefined}>
          <nav className="adm-topnav" aria-label="Admin">
            {items.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="adm-topnav__link"
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="adm-topbar__user">{user}</div>
        </div>
      </div>
    </header>
  );
}