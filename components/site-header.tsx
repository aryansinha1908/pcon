"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { MobileNav } from "@/components/mobile-nav";
import { NavLinks } from "@/components/nav-links";
import { navLinks } from "@/lib/site-data";

// Detach after this much scroll; re-attach only near the very top (hysteresis stops flicker).
const FLOAT_AT = 48;
const DOCK_AT = 12;

export function SiteHeader() {
  const pathname = usePathname();
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setFloating((was) => (was ? y > DOCK_AT : y > FLOAT_AT));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const isCurrent = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header" data-floating={floating}>
      {/* Scroll progress along the header's bottom edge (pure CSS; hidden where unsupported). */}
      <span className="read-progress" aria-hidden="true" />
      <div className="shell site-header__inner">
        <Brand />
        <NavLinks links={navLinks} isCurrent={isCurrent} />
        <div className="site-header__actions">
          <Link className="header-cta" href="/#community">
            <i className="header-cta__dot" aria-hidden="true" />
            Join the club <span aria-hidden="true">↗</span>
          </Link>
          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
    </>
  );
}
