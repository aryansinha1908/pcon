"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*§£+/?><~";

const PCON_PHRASES = [
  "WELCOME TO PCON",
  "A COMMUNITY THAT BUILDS TOGETHER",
  "IF YOU LOVE CODING",
  "YOU'RE AT THE RIGHT PLACE",
];

const DELTA_PHRASES = [
  "WELCOME TO DELTA FORCE",
  "A COMMUNITY THAT BUILDS TOGETHER",
  "IF YOU LOVE CODING",
  "YOU'RE AT THE RIGHT PLACE",
];

interface HackerScrambleProps {
  phrases?: string[];
  holdDuration?: number; // ms to pause on completed phrase
  scrambleSpeed?: number; // ms per scramble tick
  className?: string;
}

export function HackerScramble({
  phrases = PCON_PHRASES,
  holdDuration = 2800,
  scrambleSpeed = 38,
  className = "",
}: HackerScrambleProps) {
  const [currentPhrases, setCurrentPhrases] = useState(phrases);
  const [displayText, setDisplayText] = useState(currentPhrases[0] ?? "");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  // Only animate while on screen and the tab is visible: off-screen it would keep
  // re-rendering React ~30 times a second for nobody.
  const [inView, setInView] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let onScreen = true;
    const sync = () => setInView(onScreen && document.visibilityState === "visible");
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    observer.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail === "delta") {
        setCurrentPhrases(DELTA_PHRASES);
        setPhraseIndex(0);
      } else if (custom.detail === "pcon") {
        setCurrentPhrases(PCON_PHRASES);
        setPhraseIndex(0);
      } else {
        setCurrentPhrases((prev) => (prev === PCON_PHRASES ? DELTA_PHRASES : PCON_PHRASES));
        setPhraseIndex(0);
      }
    };
    window.addEventListener("pcon:toggle-matrix", handleToggle);
    return () => window.removeEventListener("pcon:toggle-matrix", handleToggle);
  }, []);
  const stateRef = useRef({
    animating: false,
    phraseIndex: 0,
    startTime: 0,
  });

  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const longestPhrase = currentPhrases.reduce((a, b) => (b.length > a.length ? b : a), "");

  const advancePhrase = useCallback(() => {
    setPhraseIndex((prev) => (prev + 1) % currentPhrases.length);
  }, [currentPhrases.length]);

  useEffect(() => {
    stateRef.current.phraseIndex = phraseIndex;
    const targetText = currentPhrases[phraseIndex];
    if (!targetText) return;

    // Paused off-screen: the render shows the readable phrase; resume when back in view.
    if (!inView) return;

    if (prefersReducedMotion.current) {
      setDisplayText(targetText);
      setIsHolding(true);
      const timer = setTimeout(advancePhrase, holdDuration);
      return () => clearTimeout(timer);
    }

    setIsHolding(false);
    const targetLength = targetText.length;
    let frameId = 0;
    let lastTick = performance.now();
    let lockIndex = 0;
    const totalLockSteps = targetLength;
    const lockInterval = Math.max(28, Math.min(65, 1200 / totalLockSteps)); // smooth left-to-right resolve
    let lastLockTime = performance.now() + 200; // initial scramble before locking starts
    let holdTimer = 0;

    const tick = (now: number) => {
      // Advance lockIndex
      if (now - lastLockTime >= lockInterval && lockIndex < targetLength) {
        lockIndex++;
        lastLockTime = now;
      }

      if (now - lastTick >= scrambleSpeed) {
        lastTick = now;
        let result = "";
        for (let i = 0; i < targetLength; i++) {
          if (i < lockIndex) {
            result += targetText[i];
          } else if (targetText[i] === " ") {
            // Spaces stay spaces: the pixel font is monospaced, so keeping the word breaks
            // fixed keeps line wrapping (and the hero's height) identical mid-scramble.
            result += " ";
          } else {
            result += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
        }
        setDisplayText(result);
      }

      if (lockIndex >= targetLength) {
        // Completed resolution!
        setDisplayText(targetText);
        setIsHolding(true);
        // Cleared in the effect cleanup (returning it from a rAF callback did nothing).
        holdTimer = window.setTimeout(advancePhrase, holdDuration);
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(holdTimer);
    };
  }, [phraseIndex, currentPhrases, holdDuration, scrambleSpeed, advancePhrase, inView]);

  return (
    <div
      ref={rootRef}
      className={`hacker-scramble ${className}`}
      onClick={advancePhrase}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") advancePhrase();
      }}
      title="Click to cycle next phrase"
    >
      <span className="sr-only">{currentPhrases[phraseIndex]}</span>
      <div className="hacker-scramble__box" aria-hidden="true">
        {/* The visible line and an invisible copy of the longest phrase share one grid
            cell, so the box is always sized for the longest phrase: cycling between
            short and long phrases never changes the hero's height (no layout shift). */}
        <span className="hacker-scramble__stack">
          <span className="hacker-scramble__line">
            <span className="hacker-scramble__text">{inView ? displayText : currentPhrases[phraseIndex]}</span>
            <span
              className={`hacker-scramble__cursor ${
                isHolding ? "hacker-scramble__cursor--blink" : "hacker-scramble__cursor--solid"
              }`}
            >
              _
            </span>
          </span>
          <span className="hacker-scramble__line hacker-scramble__sizer">
            <span className="hacker-scramble__text">{longestPhrase}</span>
            <span className="hacker-scramble__cursor">_</span>
          </span>
        </span>
      </div>
    </div>
  );
}
