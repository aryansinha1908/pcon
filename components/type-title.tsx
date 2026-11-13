"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A heading that types itself out, terminal-style, the first time it scrolls
 * into view, then settles. The real text is always present for assistive tech
 * and search engines (sr-only), and an invisible copy reserves the final size
 * so nothing shifts while it types. Static with no JS or reduced motion.
 */
export function TypeTitle({ text, id, className }: { text: string; id?: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [shown, setShown] = useState(text.length);
  const [phase, setPhase] = useState<"static" | "typing" | "done">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let interval = 0;
    let doneTimer = 0;
    const startTyping = () => {
      setShown(0);
      setPhase("typing");
      let count = 0;
      interval = window.setInterval(() => {
        count += 1;
        setShown(count);
        if (count >= text.length) {
          window.clearInterval(interval);
          doneTimer = window.setTimeout(() => setPhase("done"), 1400);
        }
      }, Math.max(22, Math.min(45, 900 / text.length)));
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      startTyping();
    }, { threshold: 0.6 });
    // Only type headings that start below the fold; ones already visible stay put.
    const frame = requestAnimationFrame(() => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        setShown(0);
        observer.observe(el);
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.clearInterval(interval);
      window.clearTimeout(doneTimer);
    };
  }, [text]);

  return (
    <h2 className={"type-title" + (className ? ` ${className}` : "")} id={id} ref={ref} data-phase={phase}>
      <span className="sr-only">{text}</span>
      <span className="type-title__ghost" aria-hidden="true">{text}</span>
      <span className="type-title__live" aria-hidden="true">
        {text.slice(0, shown)}
        <span className="type-title__cursor" />
      </span>
    </h2>
  );
}
