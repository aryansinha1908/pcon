"use client";

import { useEffect, useState } from "react";

/**
 * Floating "back to top" button. Appears after about one and a half screens of
 * scrolling, scrolls smoothly (instantly with reduced motion) and hands keyboard
 * focus back to the top of the page.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > window.innerHeight * 1.5);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.querySelector<HTMLElement>(".site-header .brand")?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      className="back-to-top"
      data-visible={visible}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={toTop}
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 15.5v-11m-5 5 5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}
