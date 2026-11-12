import { Brand } from "@/components/brand";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__top">
        <div><Brand compact /><p>Code for the future.<br />Built together at NIT Jamshedpur.</p></div>
        <div className="footer-links"><span>Find your people</span><a href="mailto:pcon@nitjsr.ac.in">pcon@nitjsr.ac.in <span aria-hidden="true">↗</span></a></div>
      </div>
      <div className="shell site-footer__bottom"><span>© {new Date().getFullYear()} PCON · Programming Club of NIT Jamshedpur</span><a href="#top">Back to top ↑</a></div>
    </footer>
  );
}
