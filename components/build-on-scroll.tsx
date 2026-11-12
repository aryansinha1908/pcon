"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-driven "multiplayer build" effect.
 *
 * Elements in each section move through ghost -> wire -> skeleton -> live
 * as they enter view. Sleek cursor arrows drag out the wireframe, sketch
 * the skeleton, click, and reveal the live container.
 *
 * Requirements:
 * 1. Cursors are clean colored arrows without name tags underneath.
 * 2. The selecting effect runs ONLY ONCE during scroll down; scrolling back
 *    up keeps the normal container visible (no un-building).
 * 3. The selecting animation completes by the time 60% scroll is reached.
 */

const CURSORS = [
  { name: "cursor-1", color: "var(--mint)" },
  { name: "cursor-2", color: "var(--tint-blue)" },
  { name: "cursor-3", color: "var(--tint-orange)" },
  { name: "cursor-4", color: "var(--tint-violet)" },
];

type BuildState = "ghost" | "wire" | "skeleton" | "live";

const WIRE_START = 0.05;
const SKELETON_START = 0.35;
const LIVE_START = 0.70;

/** Time constants (ms) for snappy, smooth exponential easing */
const PROGRESS_SMOOTHING = 80;
const CURSOR_SMOOTHING = 70;
const SETTLE_EPSILON = 0.0005;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const range = (p: number, start: number, end: number) => clamp((p - start) / (end - start));
const blend = (dt: number, tau: number) => 1 - Math.exp(-dt / tau);

function stateFor(progress: number): BuildState {
  if (progress < WIRE_START) return "ghost";
  if (progress < SKELETON_START) return "wire";
  if (progress < LIVE_START) return "skeleton";
  return "live";
}

type Item = {
  el: HTMLElement;
  order: number;
  cursor: number;
  progress: number;
  intro: boolean;
  state?: BuildState;
  hasBuilt: boolean;
};

type Target = { x: number; y: number; score: number };
type CursorMotion = { x: number; y: number; tx: number; ty: number; placed: boolean; active: boolean };

export function BuildOnScroll() {
  const cursorRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const vhInitial = window.innerHeight;

    const items: Item[] = [...document.querySelectorAll<HTMLElement>("[data-build-section]")].flatMap((section) =>
      [...section.querySelectorAll<HTMLElement>("[data-build]")].map((el, order) => {
        const isIntro = section.hasAttribute("data-build-intro");
        const rect = el.getBoundingClientRect();
        // If element is already on-screen or above on initial load, show live right away
        const alreadyInView = !isIntro && rect.top < vhInitial * 0.40;
        if (alreadyInView) {
          el.dataset.state = "live";
          el.style.setProperty("--build-size", "1");
          el.style.setProperty("--build-skeleton", "0");
        }
        return {
          el,
          order,
          cursor: order % CURSORS.length,
          progress: alreadyInView ? 1 : -1,
          intro: isIntro,
          state: alreadyInView ? "live" : undefined,
          hasBuilt: alreadyInView,
        };
      }),
    );

    const cursors = cursorRefs.current;
    const motion: CursorMotion[] = CURSORS.map(() => ({ x: 0, y: 0, tx: 0, ty: 0, placed: false, active: false }));
    const clickTimers: number[] = [];
    const introStartedAt = performance.now();
    let frame = 0;
    let lastTime = 0;
    let lastScrollY = window.scrollY;

    const click = (index: number) => {
      const cursor = cursors[index];
      if (!cursor) return;
      cursor.classList.remove("is-clicking");
      void cursor.offsetWidth; // restart pulse animation
      cursor.classList.add("is-clicking");
      window.clearTimeout(clickTimers[index]);
      clickTimers[index] = window.setTimeout(() => cursor?.classList.remove("is-clicking"), 450);
    };

    const tick = (time: number) => {
      frame = 0;
      const dt = lastTime ? Math.min(time - lastTime, 64) : 16;
      lastTime = time;
      const progressBlend = blend(dt, PROGRESS_SMOOTHING);
      const cursorBlend = blend(dt, CURSOR_SMOOTHING);

      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollY - 2;
      lastScrollY = currentScrollY;

      const remaining = root.scrollHeight - vh - currentScrollY;
      const endBoost = clamp(1 - remaining / (vh * 0.35));
      const targets: (Target | null)[] = CURSORS.map(() => null);
      let moving = false;

      for (const item of items) {
        if (item.hasBuilt) {
          // Permanently live: ensure dataset state remains live
          if (item.state !== "live") {
            item.state = "live";
            item.el.dataset.state = "live";
            item.el.style.setProperty("--build-size", "1");
            item.el.style.setProperty("--build-skeleton", "0");
          }
          continue;
        }

        // On scroll up: immediately resolve any element that was started/on-screen to normal container
        if (isScrollingUp && item.progress > 0) {
          item.hasBuilt = true;
          item.progress = 1;
          item.state = "live";
          item.el.dataset.state = "live";
          item.el.style.setProperty("--build-size", "1");
          item.el.style.setProperty("--build-skeleton", "0");
          continue;
        }

        const rect = item.el.getBoundingClientRect();
        let goal = 0;

        if (item.intro) {
          const introProgress = (time - introStartedAt) / 1100 - item.order * 0.08;
          if (introProgress < 1) moving = true;
          goal = clamp(introProgress);
        } else {
          // 60% SCROLL REACH COMPLETION:
          // The selecting animation starts as element enters viewport (rect.top <= vh * 0.98)
          // and COMPLETES FULLY (1.0) when it reaches 60% of viewport scroll distance (rect.top <= vh * 0.38).
          const rawProgress = (vh * 0.98 - rect.top) / (vh * 0.60);
          const stagger = (item.order % CURSORS.length) * 0.035;

          if (rawProgress <= 0) {
            goal = 0;
          } else if (rawProgress >= 1) {
            goal = 1;
          } else {
            goal = clamp((rawProgress - stagger) / (1 - stagger) + endBoost);
          }
        }

        // Selecting only runs forward on scroll down - never unbuilds
        if (item.progress >= 0) {
          goal = Math.max(item.progress, goal);
        }

        item.progress = item.progress < 0 ? goal : item.progress + (goal - item.progress) * progressBlend;
        if (Math.abs(goal - item.progress) > SETTLE_EPSILON) moving = true;
        else item.progress = goal;

        const progress = item.progress;
        const state = stateFor(progress);

        if (state !== item.state) {
          if (state === "live" && (item.state === "skeleton" || item.state === "wire")) {
            click(item.cursor);
          }
          item.el.dataset.state = state;
          item.state = state;
        }

        // Once it reaches live (or progress >= 0.95), mark built permanently
        if (progress >= LIVE_START) {
          if (progress >= 0.95) {
            item.hasBuilt = true;
          }
        }

        const t = easeInOut(range(progress, WIRE_START, SKELETON_START));
        const s = easeInOut(range(progress, SKELETON_START, LIVE_START));
        item.el.style.setProperty("--build-size", t.toFixed(4));
        item.el.style.setProperty("--build-skeleton", range(progress, SKELETON_START, SKELETON_START + 0.08).toFixed(3));

        // Only assign cursor targets while in wireframe or skeleton phases
        let target: Target | null = null;
        if (!item.hasBuilt) {
          if (state === "wire") {
            target = {
              x: rect.left + rect.width * t,
              y: rect.top + rect.height * t,
              score: progress,
            };
          } else if (state === "skeleton") {
            target = {
              x: rect.left + rect.width * (1 - 0.6 * s),
              y: rect.top + rect.height * (1 - 0.5 * s),
              score: progress,
            };
          }
        }

        const onScreen = rect.bottom > 0 && rect.top < vh;
        const current = targets[item.cursor];
        if (target && onScreen && (!current || target.score > current.score)) {
          targets[item.cursor] = target;
        }
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

        m.tx = clamp(target.x, 12, vw - 40);
        m.ty = clamp(target.y, headerHeight + 12, vh - 40);
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
      });

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
        </div>
      ))}
    </div>
  );
}
