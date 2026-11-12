"use client";

import { useEffect, useState } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const current = (window.scrollY / scrollHeight) * 100;
        setProgress(Math.min(100, Math.max(0, current)));
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div className="blog-bar" style={{ width: `${progress}%` }} aria-hidden="true" />;
}

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // fallback
    }
  }

  return (
    <button type="button" className="blog-copy" onClick={handleCopy}>
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

