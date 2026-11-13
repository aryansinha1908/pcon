"use client";

import { useEffect, useRef } from "react";
import { confettiBurst } from "@/components/confetti";

const MEDAL_COLORS = ["#f5c451", "#ffe39a", "#cbd5e1", "#e0915a", "#39ffb8", "#f8fffa"];

/**
 * The podium on /achievements. When it scrolls into view the steps rise
 * (3rd, 2nd, then 1st), the winners appear, the crown drops in, and one
 * confetti burst fires from it. If it's already on screen it plays right
 * away. Without JS, or with reduced motion, the podium is simply shown.
 */
export function PodiumReveal({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const play = () => {
      el.dataset.state = "play";
      timer = window.setTimeout(() => {
        const crown = el.querySelector(".podium__crown") ?? el;
        const box = crown.getBoundingClientRect();
        if (box.bottom > 0 && box.top < window.innerHeight) confettiBurst(box.left + box.width / 2, box.top + box.height / 2, MEDAL_COLORS, 120);
      }, 1500);
    };
    el.dataset.state = "idle";
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      play();
    }, { threshold: 0.35 });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="podium" ref={ref} role="list" aria-label={label}>
      {children}
    </div>
  );
}
