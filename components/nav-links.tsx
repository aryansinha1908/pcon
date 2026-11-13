"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";

type NavLink = { label: string; href: string };

const GLYPHS = "!<>-_\\/[]{}=+*^?#01";

/**
 * Desktop nav with two effects:
 * - a "lamp": one glowing pill that glides to whichever link is hovered or
 *   focused, and rests on the current page's link (hidden when none is current);
 * - a decode scramble on each label when it is hovered or focused.
 * The real label is always in the accessible name; the scrambling copy is
 * aria-hidden and sits over an invisible copy that holds the width, so nothing
 * shifts. Reduced motion keeps the lamp (it just jumps) and skips the scramble.
 */
export function NavLinks({ links, isCurrent }: { links: NavLink[]; isCurrent: (href: string) => boolean }) {
  const navRef = useRef<HTMLElement>(null);
  const lampRef = useRef<HTMLSpanElement>(null);
  const timers = useRef(new Map<HTMLElement, number>());

  const moveLamp = useCallback((target: HTMLElement | null) => {
    const nav = navRef.current;
    const lamp = lampRef.current;
    if (!nav || !lamp) return;
    const to = target ?? nav.querySelector<HTMLElement>('a[aria-current="page"]');
    if (!to) {
      lamp.dataset.on = "false";
      return;
    }
    // Arriving from nothing: appear in place instead of sliding in from the left edge.
    if (lamp.dataset.on !== "true") lamp.dataset.snap = "true";
    lamp.style.setProperty("--lamp-x", `${to.offsetLeft}px`);
    lamp.style.setProperty("--lamp-w", `${to.offsetWidth}px`);
    lamp.dataset.on = "true";
    lamp.dataset.current = String(to.getAttribute("aria-current") === "page");
    requestAnimationFrame(() => { delete lamp.dataset.snap; });
  }, []);

  // Rest on the current link on load, on route change, and when the nav resizes (fonts, floating).
  const currentHref = links.find((link) => isCurrent(link.href))?.href;
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    moveLamp(null);
    const observer = new ResizeObserver(() => {
      if (!nav.matches(":hover, :focus-within")) moveLamp(null);
    });
    observer.observe(nav);
    return () => observer.disconnect();
  }, [currentHref, moveLamp]);

  useEffect(() => {
    const running = timers.current;
    return () => running.forEach((id) => window.clearInterval(id));
  }, []);

  const scramble = (link: HTMLElement) => {
    const live = link.querySelector<HTMLElement>(".nav-link__live");
    const text = live?.dataset.text;
    if (!live || !text || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.clearInterval(timers.current.get(link));
    let frame = 0;
    const total = text.length * 2 + 4;
    const id = window.setInterval(() => {
      frame += 1;
      const locked = Math.floor((frame / total) * text.length);
      live.textContent = [...text].map((char, i) => {
        if (i < locked || char === " ") return char;
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }).join("");
      if (frame >= total) {
        window.clearInterval(id);
        timers.current.delete(link);
        live.textContent = text;
      }
    }, 28);
    timers.current.set(link, id);
  };

  const enter = (event: React.SyntheticEvent<HTMLAnchorElement>) => {
    moveLamp(event.currentTarget);
    scramble(event.currentTarget);
  };

  return (
    <nav
      className="main-nav"
      aria-label="Main navigation"
      ref={navRef}
      onPointerLeave={() => moveLamp(null)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) moveLamp(null); }}
    >
      <span className="main-nav__lamp" ref={lampRef} aria-hidden="true" data-on="false" />
      {links.map((link, index) => (
        <Link
          key={link.href}
          href={link.href}
          className="nav-link"
          aria-current={isCurrent(link.href) ? "page" : undefined}
          onPointerEnter={enter}
          onFocus={enter}
        >
          <span className="nav-link__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <span className="nav-link__label">
            <span className="sr-only">{link.label}</span>
            <span className="nav-link__ghost" aria-hidden="true">{link.label}</span>
            <span className="nav-link__live" aria-hidden="true" data-text={link.label}>{link.label}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
