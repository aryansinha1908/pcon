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
      // Only blocks that start fully below the fold get the entrance. Anything already
      // (even partly) on screen at load stays as it is and is never animated: before, a
      // half-visible block was left showing and then replayed its entrance on the first
      // scroll, so cards you had already seen re-drew themselves.
      const targets = [...document.querySelectorAll<HTMLElement>("[data-reveal]")].filter(
        (target) => target.getBoundingClientRect().top >= window.innerHeight,
      );
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "play";
          observer.unobserve(entry.target);
        }
        // Play as soon as the block's top is a little way into view. A share-of-element
        // threshold left tall blocks (the stacked option cards on phones) as an empty
        // gap for a long stretch of scrolling before they appeared.
      }, { rootMargin: "0px 0px -10% 0px" });
      for (const target of targets) {
        target.dataset.reveal = "idle";
        observer.observe(target);
      }
      cleanups.push(() => observer.disconnect());
    }

    // ── Scroll-filled timelines ──────────────────────────────────────
    // The glowing fill and its dot are a CSS scroll timeline (roadmaps.css), moved by the
    // browser in step with the scroll. This code only lights the number nodes as the dot
    // reaches them, measured from where the dot actually is, so they always agree. Browsers
    // without scroll timelines get the same motion from here, written as direct transforms
    // (setting custom properties on the wrap made every element inside it restyle on every
    // scroll frame, which is what made the line lag on phones).
    const wraps = [...document.querySelectorAll<HTMLElement>(".timeline-wrap")];
    const nativeTimeline = CSS.supports("animation-timeline: view()");
    if (!reduce && wraps.length) {
      const visible = new Set<HTMLElement>();
      let frame = 0;

      const update = () => {
        frame = 0;
        const anchor = window.innerHeight * 0.6;
        for (const wrap of visible) {
          const fill = wrap.querySelector<HTMLElement>(".timeline__fill");
          const tip = wrap.querySelector<HTMLElement>(".timeline__tip");
          if (!fill || !tip) continue;

          if (!nativeTimeline) {
            const rect = wrap.getBoundingClientRect();
            const length = Math.max(rect.height - 40, 1);
            const progress = Math.min(1, Math.max(0, (anchor - rect.top - 20) / length));
            fill.style.transform = `scaleY(${progress.toFixed(4)})`;
            tip.style.translate = `0 ${((progress - 1) * 100).toFixed(3)}%`;
            tip.style.opacity = String(Math.min(1, progress * 25, (1 - progress) * 25));
          }

          // The dot is the bottom edge of the tip rail. Read every position first, then
          // write, so the browser lays out once per frame.
          const dotY = tip.getBoundingClientRect().bottom;
          const states = [...wrap.querySelectorAll<HTMLElement>(".timeline__item")].map((item) => {
            const node = item.querySelector<HTMLElement>(".timeline__node");
            // Lit as soon as the dot touches the node's top edge, then it passes behind it.
            return [item, String(dotY >= (node ?? item).getBoundingClientRect().top)] as const;
          });
          for (const [item, reached] of states) {
            if (item.dataset.reached !== reached) item.dataset.reached = reached;
          }
        }
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

      // Only timelines near the screen do any work.
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
          else visible.delete(entry.target as HTMLElement);
        }
        schedule();
      }, { rootMargin: "50% 0px" });
      wraps.forEach((wrap) => observer.observe(wrap));

      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      // Card heights change when fonts load or progress badges appear.
      const resizeObserver = new ResizeObserver(schedule);
      wraps.forEach((wrap) => resizeObserver.observe(wrap));
      cleanups.push(() => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
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
