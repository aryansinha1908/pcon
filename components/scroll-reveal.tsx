"use client";

import { useEffect } from "react";

/**
 * Progressive-enhancement scroll reveal for elements marked [data-reveal].
 * Without JS (or if something goes wrong), the <html> element never gets
 * `.reveal-ready`, so the reveal CSS never hides anything — cards are
 * visible by default. Mirrors the same safe pattern as the homepage's
 * `html.build-ready [data-build]` system in globals.css.
 */
export function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (targets.length === 0) return;

    root.classList.add("reveal-ready");

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return () => root.classList.remove("reveal-ready");
    }

    targets.forEach((el, i) => {
      el.style.setProperty("--reveal-delay", `${(i % 6) * 70}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      // Leaving the page on a client navigation: don't leave other pages' [data-reveal] hidden.
      root.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
