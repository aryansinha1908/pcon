"use client";

import { useEffect } from "react";
import { confettiBurst } from "@/components/confetti";
import { TOGGLE_EVENT, type ToggleDetail } from "@/components/roadmap-progress";

/**
 * Page-level effects for /roadmaps, wired to server-rendered markup through
 * data attributes:
 *
 * - [data-reveal]       plays its entrance once it scrolls into view (the fork diagram)
 * - .timeline-wrap      its line fills in the track colour as you scroll, nodes light up as it passes
 * - [data-tilt="deg"]   tilts towards the pointer with a moving highlight (fine pointers only)
 * - a[data-morph]       jumps to a track with a View Transition: the card morphs into the track header
 * - track completion    confetti + glow when the last step of a track is ticked
 *
 * Everything degrades to the plain page: no JS, reduced motion, or browsers
 * without the relevant APIs simply get the static layout.
 */
export function RoadmapEffects() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];

    // ── Reveal on view ───────────────────────────────────────────────
    if (!reduce) {
      const targets = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "play";
          observer.unobserve(entry.target);
        }
      }, { threshold: 0.25 });
      for (const target of targets) {
        // Only hide what is still below the fold, so nothing visible blinks out.
        if (target.getBoundingClientRect().top > window.innerHeight) target.dataset.reveal = "idle";
        observer.observe(target);
      }
      cleanups.push(() => observer.disconnect());
    }

    // ── Scroll-filled timelines ──────────────────────────────────────
    const wraps = [...document.querySelectorAll<HTMLElement>(".timeline-wrap")];
    if (reduce) {
      wraps.forEach((wrap) => wrap.style.setProperty("--fill", "1"));
    } else if (wraps.length) {
      let nodeOffsets = new Map<HTMLElement, { item: HTMLElement; y: number }[]>();
      const measure = () => {
        nodeOffsets = new Map(wraps.map((wrap) => {
          const top = wrap.getBoundingClientRect().top;
          const items = [...wrap.querySelectorAll<HTMLElement>(".timeline__item")].map((item) => {
            const node = item.querySelector<HTMLElement>(".timeline__node");
            const rect = (node ?? item).getBoundingClientRect();
            return { item, y: rect.top + rect.height / 2 - top };
          });
          return [wrap, items];
        }));
      };
      let frame = 0;
      const update = () => {
        frame = 0;
        const anchor = window.innerHeight * 0.6;
        for (const wrap of wraps) {
          const rect = wrap.getBoundingClientRect();
          const length = Math.max(rect.height - 40, 1);
          const fill = Math.min(1, Math.max(0, (anchor - rect.top - 20) / length));
          const px = fill * length;
          wrap.style.setProperty("--fill", fill.toFixed(4));
          wrap.style.setProperty("--fill-px", `${px.toFixed(1)}px`);
          for (const { item, y } of nodeOffsets.get(wrap) ?? []) {
            const reached = String(px + 20 >= y - 4);
            if (item.dataset.reached !== reached) item.dataset.reached = reached;
          }
        }
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
      const onResize = () => { measure(); schedule(); };
      measure();
      update();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", onResize);
      // Card heights change when fonts load or progress badges appear.
      const resizeObserver = new ResizeObserver(onResize);
      wraps.forEach((wrap) => resizeObserver.observe(wrap));
      cleanups.push(() => {
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", onResize);
        resizeObserver.disconnect();
      });
    }

    // ── Tilt towards the pointer ─────────────────────────────────────
    if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let active: HTMLElement | null = null;
      let frame = 0;
      let last: PointerEvent | null = null;
      const release = (el: HTMLElement) => {
        el.style.removeProperty("--rx");
        el.style.removeProperty("--ry");
        el.removeAttribute("data-tilting");
      };
      const apply = () => {
        frame = 0;
        if (!last) return;
        const target = (last.target as Element | null)?.closest<HTMLElement>("[data-tilt]") ?? null;
        if (active && active !== target) release(active);
        active = target;
        if (!target) return;
        const max = Number(target.dataset.tilt) || 4;
        const rect = target.getBoundingClientRect();
        const px = (last.clientX - rect.left) / rect.width;
        const py = (last.clientY - rect.top) / rect.height;
        target.style.setProperty("--rx", `${((0.5 - py) * max).toFixed(2)}deg`);
        target.style.setProperty("--ry", `${((px - 0.5) * max).toFixed(2)}deg`);
        target.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        target.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
        target.dataset.tilting = "true";
      };
      const onMove = (event: PointerEvent) => {
        last = event;
        if (!frame) frame = requestAnimationFrame(apply);
      };
      const onLeave = () => { if (active) release(active); active = null; };
      document.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        cancelAnimationFrame(frame);
        document.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
      });
    }

    // ── Card → track header morph (View Transitions) ─────────────────
    if (!reduce && "startViewTransition" in document) {
      const onClick = (event: MouseEvent) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[data-morph]");
        const slug = link?.hash.slice(1);
        const section = slug ? document.getElementById(slug) : null;
        const header = section?.querySelector<HTMLElement>(".track__header");
        if (!link || !section || !header) return;
        event.preventDefault();
        link.style.viewTransitionName = "track-morph";
        const transition = document.startViewTransition(() => {
          link.style.viewTransitionName = "";
          header.style.viewTransitionName = "track-morph";
          section.scrollIntoView({ behavior: "instant", block: "start" });
          history.pushState(null, "", `#${slug}`);
        });
        transition.finished.finally(() => { header.style.viewTransitionName = ""; });
      };
      document.addEventListener("click", onClick);
      cleanups.push(() => document.removeEventListener("click", onClick));
    }

    // ── Track completion celebration ─────────────────────────────────
    const timers: number[] = [];
    const onToggle = (event: Event) => {
      const { id, value, done } = (event as CustomEvent<ToggleDetail>).detail;
      if (!value) return;
      const item = document.querySelector<HTMLElement>(`[data-step-id="${CSS.escape(id)}"]`);
      const section = item?.closest<HTMLElement>(".track");
      if (!item || !section) return;
      const ids = [...section.querySelectorAll<HTMLElement>("[data-step-id]")].map((el) => el.dataset.stepId ?? "");
      if (!ids.length || !ids.every((stepId) => done.has(stepId))) return;

      const glowing = [section, ...document.querySelectorAll<HTMLElement>(`.pathway a[href="#${CSS.escape(section.id)}"]`)];
      glowing.forEach((el) => el.classList.add("is-celebrating"));
      timers.push(window.setTimeout(() => glowing.forEach((el) => el.classList.remove("is-celebrating")), 2400));

      if (!reduce) {
        const origin = (item.querySelector(".step-check") ?? item).getBoundingClientRect();
        const tint = getComputedStyle(section).getPropertyValue("--tint").trim() || "#70e3c7";
        confettiBurst(origin.left + origin.width / 2, origin.top + origin.height / 2, [tint, tint, "#f3f2e9", "#70e3c7", "#82cce9"]);
      }
    };
    window.addEventListener(TOGGLE_EVENT, onToggle);
    cleanups.push(() => {
      window.removeEventListener(TOGGLE_EVENT, onToggle);
      timers.forEach((timer) => window.clearTimeout(timer));
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}
