import Link from "next/link";

export default function BlogNotFound() {
  return (
    <div style={{ maxWidth: "600px", margin: "90px auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <span className="blog-tag">404</span>
      <h1 style={{ fontSize: "40px", margin: 0, fontWeight: 600 }}>Article Not Found</h1>
      <p style={{ color: "var(--mute)", fontSize: "17px", margin: 0 }}>
        The article you are looking for doesn&apos;t exist, was moved, or is still in draft mode.
      </p>
      <Link href="/blogs" className="blog-join" style={{ marginTop: "12px" }}>
        ← Back to all posts
      </Link>
    </div>
  );
}

