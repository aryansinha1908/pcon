"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavLink = { label: string; href: string };

/**
 * Menu button + full-height sheet for viewports where the inline nav is hidden
 * (below 900px). Closes on link tap, Escape, or when the viewport grows past
 * the breakpoint, and locks page scroll while open.
 */
export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    const wide = window.matchMedia("(min-width: 901px)");
    const onWide = () => { if (wide.matches) setOpen(false); };
    root.classList.add("menu-open");
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      root.classList.remove("menu-open");
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const isCurrent = (href: string) => !href.includes("#") && pathname === href;

  return (
    <>
      <button
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      <div className="mobile-menu" id="mobile-menu" data-open={open} hidden={!open}>
        <nav aria-label="Mobile navigation">
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent(link.href) ? "page" : undefined}
              style={{ "--i": index } as React.CSSProperties}
              onClick={() => setOpen(false)}
            >
              {link.label}
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>
        <Link className="button button--primary mobile-menu__cta" href="/#community" onClick={() => setOpen(false)}>
          Join the club <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </>
  );
}
