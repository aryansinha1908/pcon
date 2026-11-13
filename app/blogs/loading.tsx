export default function BlogListingLoading() {
  return (
    <>
      <section className="blog-hero">
        <span className="blog-tag">THE PCON BLOG</span>
        <h1>
          Ideas worth <span>shipping.</span>
        </h1>
        <p className="blog-lede">
          Tutorials, deep dives and lessons learned, written by the students of NIT Jamshedpur.
        </p>
      </section>

      <div className="blog-filters" aria-hidden="true" style={{ opacity: 0.5 }}>
        {["All", "Algorithms", "Web Dev", "Computer Science", "Machine Learning"].map((c) => (
          <span key={c} className="blog-chip">
            {c}
          </span>
        ))}
      </div>

      <div className="blog-grid" aria-hidden="true">
        {[162, 172, 150, 185, 140, 195].map((h, i) => (
          <div
            key={i}
            className="blog-card"
            style={{ minHeight: "340px", opacity: 0.6 }}
          >
            <div
              style={{
                aspectRatio: "16/9",
                background: `radial-gradient(circle at 70% 30%, hsl(${h}, 70%, 45%, 0.35), hsl(${h}, 60%, 8%, 0.1)) hsl(${h}, 55%, 9%)`,
                position: "relative",
              }}
            />
            <div className="body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ height: "24px", width: "80%", background: "var(--line)", borderRadius: "4px" }} />
              <div style={{ height: "16px", width: "100%", background: "var(--line)", borderRadius: "4px" }} />
              <div style={{ height: "16px", width: "60%", background: "var(--line)", borderRadius: "4px" }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

