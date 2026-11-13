import Link from "next/link";
import { BackToTop } from "@/components/back-to-top";
import { Brand } from "@/components/brand";
import { HalftoneMark } from "@/components/halftone-mark";
import { navLinks, socialLinks } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <BackToTop />
      <div className="footer-mark">
        <div className="shell footer-mark__inner">
          <figure className="mark-frame mark-frame--logo">
            <figcaption><span>pcon-logo.png</span><span>hover · click</span></figcaption>
            <HalftoneMark source={{ kind: "image", src: "/pcon-logo-480.webp" }} label="PCON logo" boost={1.5} />
            <i className="mark-frame__handle mark-frame__handle--tl" /><i className="mark-frame__handle mark-frame__handle--tr" />
            <i className="mark-frame__handle mark-frame__handle--bl" /><i className="mark-frame__handle mark-frame__handle--br" />
          </figure>
          <figure className="mark-frame mark-frame--text">
            <figcaption><span>{"{;}"}</span><span>code · create · collaborate</span></figcaption>
            <HalftoneMark source={{ kind: "text", text: "{;}", font: "800 100px var(--display)", color: "#70e3c7" }} label="{;}" />
            <i className="mark-frame__handle mark-frame__handle--tl" /><i className="mark-frame__handle mark-frame__handle--tr" />
            <i className="mark-frame__handle mark-frame__handle--bl" /><i className="mark-frame__handle mark-frame__handle--br" />
          </figure>
        </div>
      </div>
      <div className="shell site-footer__top">
        <div className="site-footer__brand">
          <Brand compact />
          <p>Code for the future. Built together at NIT Jamshedpur.</p>
        </div>
        <nav className="footer-col" aria-label="Footer">
          <span>Quick links</span>
          {navLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <div className="footer-col">
          <span>Contact</span>
          <a href="mailto:pcon@nitjsr.ac.in">pcon@nitjsr.ac.in</a>
          <p>NIT Jamshedpur, Adityapur, Jharkhand 831014</p>
        </div>
        <div className="footer-col">
          <span>Follow us</span>
          {socialLinks.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span></a>)}
        </div>
      </div>
      <div className="shell site-footer__bottom"><span>© {new Date().getFullYear()} PCON · Programming Club of NIT Jamshedpur</span><a href="#top">Back to top ↑</a></div>
    </footer>
  );
}
