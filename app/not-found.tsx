import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/brand";
import { RequestedPath } from "@/components/requested-path";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { navLinks } from "@/lib/site-data";
import "./status-pages.css";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main id="main" className="status-page">
        <div className="shell status-page__inner">
          <div className="eyebrow"><span className="status-dot" /> ERROR 404 · PAGE NOT FOUND</div>
          <div className="status-code" aria-hidden="true">
            <span className="status-code__bracket status-code__bracket--left" />
            <strong>404</strong>
            <span className="status-code__bracket status-code__bracket--right" />
          </div>
          <h1>This page wandered off.</h1>
          <p className="status-page__lede">The link may be broken, or the page may still be under construction. New pages are being built right now.</p>

          <div className="terminal" aria-hidden="true">
            <div className="terminal__bar"><i /><i /><i /> bash — pcon</div>
            <pre className="terminal__body">
              <span className="terminal__prompt">$</span> cd <RequestedPath />{"\n"}
              <span className="terminal__error">bash: cd: <RequestedPath />: No such file or directory</span>{"\n"}
              <span className="terminal__dim">exit 404</span>{"\n"}
              <span className="terminal__prompt">$</span> <span className="terminal__caret" />
            </pre>
          </div>

          <div className="status-actions">
            <Link className="button button--primary" href="/">Back home <ArrowIcon /></Link>
            <Link className="button button--outline" href="/roadmaps">Browse roadmaps <ArrowIcon /></Link>
          </div>
          <ul className="status-links" aria-label="Popular pages">
            {navLinks.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}
          </ul>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
