"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Blog page error:", error);
  }, [error]);

  return (
    <div style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <span className="blog-tag">ERROR</span>
      <h2 style={{ fontSize: "32px", margin: 0 }}>Something went wrong</h2>
      <p style={{ color: "var(--mute)" }}>
        We couldn&apos;t load the requested post or listing. Please try again or head back to the blogs home.
      </p>
      <div style={{ display: "flex", gap: "12px" }}>
        <button type="button" onClick={() => reset()} className="blog-join">
          Try again
        </button>
        <Link href="/blogs" className="blog-join" style={{ background: "transparent", borderColor: "var(--line)" }}>
          Back to all blogs
        </Link>
      </div>
    </div>
  );
}

