"use client";

import { useEffect } from "react";

/**
 * Pauses the CSS animations inside every [data-pause-offscreen] element while it is
 * off screen (or the tab is hidden), by toggling [data-offscreen] on it; see the
 * rule in app/globals.css. Decorative loops like the hero starfield otherwise keep
 * restyling dozens of elements on every frame while you scroll the rest of the page.
 */
export function PauseOffscreen() {
  useEffect(() => {
    const targets = [...document.querySelectorAll<HTMLElement>("[data-pause-offscreen]")];
    if (targets.length === 0) return;
    const onScreen = new Map<HTMLElement, boolean>();
    const apply = () => {
      const hidden = document.visibilityState !== "visible";
      for (const el of targets) {
        const paused = hidden || !onScreen.get(el);
        if (paused) el.dataset.offscreen = "";
        else delete el.dataset.offscreen;
      }
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) onScreen.set(entry.target as HTMLElement, entry.isIntersecting);
      apply();
    });
    targets.forEach((el) => observer.observe(el));
    document.addEventListener("visibilitychange", apply);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", apply);
      targets.forEach((el) => delete el.dataset.offscreen);
    };
  }, []);

  return null;
}
