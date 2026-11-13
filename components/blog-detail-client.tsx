"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll progress for a post. Writes a compositor-only transform straight to the bar,
 * at most once per frame: no React re-render and no layout on every scroll event.
 */
export function ReadingProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollHeight)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${ratio.toFixed(4)})`;
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return <div ref={barRef} className="blog-bar" aria-hidden="true" />;
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

