"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Curated glyphs without extreme-width characters to avoid glyph-width jitter
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$*+/?";

interface BlogHeroTitleProps {
  prefix?: string;
  highlight?: string;
  className?: string;
}

export function BlogHeroTitle({
  prefix = "Ideas worth",
  highlight = "shipping.",
  className = "",
}: BlogHeroTitleProps) {
  const line1Len = prefix.length;
  const line2Len = highlight.length;
  const totalLength = line1Len + line2Len;

  const [displayPrefix, setDisplayPrefix] = useState(prefix);
  const [displayHighlight, setDisplayHighlight] = useState(highlight);
  const [isScrambling, setIsScrambling] = useState(false);
  const animatingRef = useRef(false);

  const startScramble = useCallback(() => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    setIsScrambling(true);

    let lockIndex = 0;
    const startTime = performance.now();
    const lockSpeed = 44; // ms per locked character
    let lastTick = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      lockIndex = Math.min(totalLength, Math.floor(elapsed / lockSpeed));

      if (now - lastTick > 32) {
        lastTick = now;

        let s1 = "";
        for (let i = 0; i < line1Len; i++) {
          if (i < lockIndex) {
            s1 += prefix[i];
          } else if (prefix[i] === " ") {
            s1 += " ";
          } else {
            s1 += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
        }

        let s2 = "";
        for (let j = 0; j < line2Len; j++) {
          const overallIdx = line1Len + j;
          if (overallIdx < lockIndex) {
            s2 += highlight[j];
          } else if (highlight[j] === " ") {
            s2 += " ";
          } else {
            s2 += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
        }

        setDisplayPrefix(s1);
        setDisplayHighlight(s2);
      }

      if (lockIndex < totalLength) {
        requestAnimationFrame(tick);
      } else {
        setDisplayPrefix(prefix);
        setDisplayHighlight(highlight);
        setIsScrambling(false);
        animatingRef.current = false;
      }
    };

    requestAnimationFrame(tick);
  }, [prefix, highlight, line1Len, line2Len, totalLength]);

  useEffect(() => {
    const timer = setTimeout(() => {
      startScramble();
    }, 180);
    return () => clearTimeout(timer);
  }, [startScramble]);

  return (
    <h1
      className={`blog-hero__title ${className} ${isScrambling ? "is-scrambling" : ""}`}
      onMouseEnter={startScramble}
      onClick={startScramble}
      title="Click or hover to re-scramble"
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startScramble();
        }
      }}
    >
      <span className="blog-hero__title-line">
        <span className="blog-title__prefix">{displayPrefix}</span>
      </span>
      <span className="blog-hero__title-line blog-hero__title-line--highlight">
        <span className="blog-title__highlight">{displayHighlight}</span>
        <span className="blog-title__cursor" aria-hidden="true">_</span>
      </span>
    </h1>
  );
}
