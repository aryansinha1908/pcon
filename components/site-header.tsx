import { Brand } from "@/components/brand";
import { navLinks } from "@/lib/site-data";
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Brand />
        <nav className="main-nav" aria-label="Main navigation">
          {navLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
        </nav>
        <a className="header-cta" href="#community">Join the club <span aria-hidden="true">↗</span></a>
      </div>
    </header>
  );
}
