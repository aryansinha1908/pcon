import Link from "next/link";

export function BlogNav() {
  return (
    <nav className="blog-nav" aria-label="Blog navigation">
      <Link className="blog-brand" href="/">
        <i>P</i>
        <span>
          PCON<small>NIT Jamshedpur</small>
        </span>
      </Link>
      <div className="blog-links">
        <Link href="/#about">About</Link>
        <Link href="/#domains">What we do</Link>
        <Link href="/#events">Events</Link>
        <Link className="on" href="/blogs">Blogs</Link>
        <Link href="/#community">Community</Link>
      </div>
      <Link className="blog-join" href="/#community">
        Join the club ↗
      </Link>
    </nav>
  );
}

export function BlogFooter() {
  return (
    <footer className="blog-footer">
      <span>© 2026 PCON, NIT Jamshedpur. Code for the future.</span>
      <Link href="/admin" style={{ opacity: 0.6, fontSize: "12px" }}>
        Admin Panel ↗
      </Link>
    </footer>
  );
}

