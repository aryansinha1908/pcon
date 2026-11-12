import Link from "next/link";
import { Brand } from "@/components/brand";
import { MobileNav } from "@/components/mobile-nav";
import { navLinks } from "@/lib/site-data";
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Brand />
        <nav className="main-nav" aria-label="Main navigation">
          {navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <div className="site-header__actions">
          <Link className="header-cta" href="/#community">Join the club <span aria-hidden="true">↗</span></Link>
          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  );
}
