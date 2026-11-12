"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-driven "multiplayer build" effect.
 *
 * Every [data-build] element inside a [data-build-section] moves through
 * ghost → wire → skeleton → live as it scrolls into view. Elements in a
 * section are shared round-robin between four cursors that drag out the
 * wireframe, sketch the skeleton and "click" the element live. Progress
 * follows the scroll position (scrolling back up un-builds the page), but
 * both progress and cursor positions are eased towards their targets every
 * frame so the motion stays smooth even with notchy mouse wheels.
 *
 * Content stays fully visible without JS or with reduced motion: the CSS
 * only hides anything once <html> has the `build-ready` class.
 */

const CURSORS = [
  { name: "Yash Pandey", color: "var(--mint)" },
  { name: "Yashita", color: "var(--tint-blue)" },
  { name: "Khyati", color: "var(--tint-orange)" },
  { name: "Roushan", color: "var(--tint-violet)" },
];

type BuildState = "ghost" | "wire" | "skeleton" | "live";

const WIRE_START = 0.06;
const SKELETON_START = 0.5;
const LIVE_START = 0.8;
const LINGER_END = 0.93;

/** Time constants (ms) for the exponential easing: lower is snappier. */
const PROGRESS_SMOOTHING = 140;
const CURSOR_SMOOTHING = 110;
const SETTLE_EPSILON = 0.0005;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const range = (p: number, start: number, end: number) => clamp((p - start) / (end - start));
/** Frame-rate independent blend factor for exponential smoothing. */
const blend = (dt: number, tau: number) => 1 - Math.exp(-dt / tau);

function stateFor(progress: number): BuildState {
  if (progress < WIRE_START) return "ghost";
  if (progress < SKELETON_START) return "wire";
  if (progress < LIVE_START) return "skeleton";
  return "live";
}

type Item = { el: HTMLElement; order: number; cursor: number; progress: number; state?: BuildState };
type Target = { x: number; y: number; score: number; size?: string };
type CursorMotion = { x: number; y: number; tx: number; ty: number; placed: boolean; active: boolean };

export function BuildOnScroll() {
  const cursorRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const items: Item[] = [...document.querySelectorAll<HTMLElement>("[data-build-section]")].flatMap((section) =>
      [...section.querySelectorAll<HTMLElement>("[data-build]")].map((el, order) => ({ el, order, cursor: order % CURSORS.length, progress: -1 })),
    );
    const cursors = cursorRefs.current;
    const sizeLabels = cursors.map((cursor) => cursor?.querySelector<HTMLElement>(".build-cursor__size") ?? null);
    const motion: CursorMotion[] = CURSORS.map(() => ({ x: 0, y: 0, tx: 0, ty: 0, placed: false, active: false }));
    const clickTimers: number[] = [];
    let frame = 0;
    let lastTime = 0;

    const click = (index: number) => {
      const cursor = cursors[index];
      if (!cursor) return;
      cursor.classList.remove("is-clicking");
      void cursor.offsetWidth; // restart the pulse animation
      cursor.classList.add("is-clicking");
      window.clearTimeout(clickTimers[index]);
      clickTimers[index] = window.setTimeout(() => cursor.classList.remove("is-clicking"), 450);
    };

    const tick = (time: number) => {
      frame = 0;
      // When the loop restarts after settling there is no previous frame, so assume one 60fps step.
      // (The very first placement of items and cursors snaps separately, see `progress < 0` / `placed`.)
      const dt = lastTime ? Math.min(time - lastTime, 64) : 16;
      lastTime = time;
      const progressBlend = blend(dt, PROGRESS_SMOOTHING);
      const cursorBlend = blend(dt, CURSOR_SMOOTHING);

      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
      const remaining = root.scrollHeight - vh - window.scrollY;
      // Near the bottom of the page there is no more scroll to build with, so finish everything in view.
      const endBoost = clamp(1 - remaining / (vh * 0.35));
      const targets: (Target | null)[] = CURSORS.map(() => null);
      let moving = false;

      for (const item of items) {
        const rect = item.el.getBoundingClientRect();
        const stagger = (item.order % CURSORS.length) * 0.055;
        const goal = clamp((vh * 0.96 - rect.top) / (vh * 0.55) - stagger + endBoost);
        item.progress = item.progress < 0 ? goal : item.progress + (goal - item.progress) * progressBlend;
        if (Math.abs(goal - item.progress) > SETTLE_EPSILON) moving = true;
        else item.progress = goal;

        const progress = item.progress;
        const state = stateFor(progress);
        if (state !== item.state) {
          if (state === "live" && (item.state === "skeleton" || item.state === "wire")) click(item.cursor);
          item.el.dataset.state = state;
          item.state = state;
        }

        const t = easeInOut(range(progress, WIRE_START, SKELETON_START));
        const s = easeInOut(range(progress, SKELETON_START, LIVE_START));
        item.el.style.setProperty("--build-size", t.toFixed(4));
        item.el.style.setProperty("--build-skeleton", range(progress, SKELETON_START, SKELETON_START + 0.08).toFixed(3));

        let target: Target | null = null;
        if (state === "wire") {
          target = {
            x: rect.left + rect.width * t,
            y: rect.top + rect.height * t,
            score: progress,
            size: `${Math.round(rect.width * t)} × ${Math.round(rect.height * t)}`,
          };
        } else if (state === "skeleton" || (state === "live" && progress < LINGER_END)) {
          target = {
            x: rect.left + rect.width * (1 - 0.6 * s),
            y: rect.top + rect.height * (1 - 0.5 * s),
            // A cursor finishes its current element before lingering on a finished one.
            score: state === "live" ? progress - 1 : progress,
          };
        }

        const onScreen = rect.bottom > 0 && rect.top < vh;
        const current = targets[item.cursor];
        if (target && onScreen && (!current || target.score > current.score)) targets[item.cursor] = target;
      }

      targets.forEach((target, index) => {
        const cursor = cursors[index];
        const m = motion[index];
        if (!cursor) return;

        const active = Boolean(target);
        if (active !== m.active) {
          cursor.dataset.active = String(active);
          m.active = active;
        }
        if (!target) return;

        // Keep the cursor on screen even when the element's corner is still below the fold.
        m.tx = clamp(target.x, 12, vw - 140);
        m.ty = clamp(target.y, headerHeight + 12, vh - 64);
        if (!m.placed) {
          m.x = m.tx;
          m.y = m.ty;
          m.placed = true;
        } else {
          m.x += (m.tx - m.x) * cursorBlend;
          m.y += (m.ty - m.y) * cursorBlend;
        }
        if (Math.abs(m.tx - m.x) > 0.3 || Math.abs(m.ty - m.y) > 0.3) moving = true;
        cursor.style.transform = `translate3d(${m.x.toFixed(2)}px, ${m.y.toFixed(2)}px, 0)`;

        cursor.dataset.sizing = target.size ? "true" : "false";
        const sizeLabel = sizeLabels[index];
        if (sizeLabel && target.size && sizeLabel.textContent !== target.size) sizeLabel.textContent = target.size;
      });

      // Keep animating until everything has caught up with the scroll position.
      if (moving) frame = window.requestAnimationFrame(tick);
      else lastTime = 0;
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    root.classList.add("build-ready");
    tick(performance.now());
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      clickTimers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      root.classList.remove("build-ready");
      for (const { el } of items) {
        delete el.dataset.state;
        el.style.removeProperty("--build-size");
        el.style.removeProperty("--build-skeleton");
      }
    };
  }, []);

  return (
    <div className="build-cursors" aria-hidden="true">
      {CURSORS.map((cursor, index) => (
        <div
          className="build-cursor"
          data-active="false"
          key={cursor.name}
          ref={(el) => { cursorRefs.current[index] = el; }}
          style={{ "--cursor-color": cursor.color } as React.CSSProperties}
        >
          <svg className="build-cursor__pointer" viewBox="0 0 20 22" width="20" height="22">
            <path d="M2 1.5 17.5 10l-6.8 1.9L7.4 18.6Z" fill="currentColor" stroke="var(--abyss)" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          <span className="build-cursor__name">{cursor.name}</span>
          <span className="build-cursor__size" />
        </div>
      ))}
    </div>
  );
}
