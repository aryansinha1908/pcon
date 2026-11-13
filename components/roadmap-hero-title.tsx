"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*<>/{}_~";

interface RoadmapHeroTitleProps {
  prefix?: string;
  highlight?: string;
  className?: string;
}

export function RoadmapHeroTitle({
  prefix = "Find your ",
  highlight = "path",
  className = "",
}: RoadmapHeroTitleProps) {
  const fullText = prefix + highlight;
  const prefixLen = prefix.length;

  const [displayPrefix, setDisplayPrefix] = useState(prefix);
  const [displayHighlight, setDisplayHighlight] = useState(highlight);
  const [isScrambling, setIsScrambling] = useState(false);
  const animatingRef = useRef(false);

  const startScramble = useCallback(() => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    setIsScrambling(true);

    const length = fullText.length;
    let lockIndex = 0;
    const startTime = performance.now();
    const lockSpeed = 46; // ms per locked character
    let lastTick = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      lockIndex = Math.min(length, Math.floor(elapsed / lockSpeed));

      if (now - lastTick > 32) {
        lastTick = now;
        let currentString = "";
        for (let i = 0; i < length; i++) {
          if (i < lockIndex) {
            currentString += fullText[i];
          } else if (fullText[i] === " ") {
            currentString += " ";
          } else {
            currentString += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
        }

        setDisplayPrefix(currentString.slice(0, prefixLen));
        setDisplayHighlight(currentString.slice(prefixLen));
      }

      if (lockIndex < length) {
        requestAnimationFrame(tick);
      } else {
        setDisplayPrefix(prefix);
        setDisplayHighlight(highlight);
        setIsScrambling(false);
        animatingRef.current = false;
      }
    };

    requestAnimationFrame(tick);
  }, [fullText, prefix, highlight, prefixLen]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => {
      startScramble();
    }, 180);
    return () => clearTimeout(timer);
  }, [startScramble]);

  return (
    <h1
      id="roadmaps-title"
      className={`roadmaps-hero__title ${className} ${isScrambling ? "is-scrambling" : ""}`}
      aria-label={fullText}
      onMouseEnter={() => {
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) startScramble();
      }}
    >
      <span className="roadmaps-title__prefix" aria-hidden="true">{displayPrefix}</span>
      <span className="roadmaps-title__highlight" aria-hidden="true">{displayHighlight}</span>
      {isScrambling && <span className="roadmaps-title__cursor" aria-hidden="true">_</span>}
    </h1>
  );
}
