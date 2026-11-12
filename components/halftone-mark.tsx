"use client";

import { useEffect, useRef } from "react";

/**
 * An interactive halftone rendering of a shape (an image's alpha or a line of
 * text), inspired by the footer mark on readme.com.
 *
 * The shape is rasterised once into a mask; dots are laid on a grid wherever
 * the mask is solid and a crisp outline is traced from the mask's edge. Dots
 * swell, brighten and lean away from the pointer, a click sends a ripple
 * through them, and a slow idle wave keeps the mark alive. Rendering pauses
 * when the canvas is off screen; with reduced motion it draws once, statically.
 */

type Source =
  | { kind: "image"; src: string }
  | { kind: "text"; text: string; font: string; color: string };

type Dot = { x: number; y: number; color: string; v: number };
type Ripple = { x: number; y: number; start: number };

const SPACING = 5.5;
const BASE_RADIUS = 0.85;
const MAX_RADIUS = 2.9;
const POINTER_RADIUS = 85;
const PUSH = 5;
const RIPPLE_SPEED = 0.42; // px per ms
const RIPPLE_LIFE = 1400; // ms
const PADDING = 0.1;

const blend = (dt: number, tau: number) => 1 - Math.exp(-dt / tau);

/** Brighten a colour and quantise it, so dots can be batched into a few fill calls. */
function toColor(r: number, g: number, b: number, boost: number) {
  const q = (v: number) => Math.min(255, Math.round((v * boost) / 16) * 16);
  return `rgb(${q(r)} ${q(g)} ${q(b)})`;
}

async function rasterise(source: Source, width: number, height: number, dpr: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.scale(dpr, dpr);
  const boxW = width * (1 - PADDING * 2);
  const boxH = height * (1 - PADDING * 2);

  if (source.kind === "image") {
    const img = new Image();
    img.src = source.src;
    await img.decode();
    const scale = Math.min(boxW / img.naturalWidth, boxH / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
  } else {
    await document.fonts.load(source.font.replace(/\d+px/, "100px"), source.text).catch(() => undefined);
    ctx.font = source.font.replace(/\d+px/, "100px");
    const m = ctx.measureText(source.text);
    const textH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    const size = 100 * Math.min(boxW / m.width, boxH / textH);
    ctx.font = source.font.replace(/\d+px/, `${size.toFixed(1)}px`);
    const fm = ctx.measureText(source.text);
    ctx.fillStyle = source.color;
    ctx.textBaseline = "alphabetic";
    const y = (height + fm.actualBoundingBoxAscent - fm.actualBoundingBoxDescent) / 2;
    ctx.fillText(source.text, (width - fm.width) / 2, y);
  }
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/** Dots on a grid wherever the mask is solid, coloured from the mask. */
function buildDots(mask: ImageData, width: number, height: number, dpr: number, boost: number): Dot[] {
  const dots: Dot[] = [];
  const { data, width: mw } = mask;
  for (let y = SPACING / 2; y < height; y += SPACING) {
    for (let x = SPACING / 2; x < width; x += SPACING) {
      const i = (Math.round(y * dpr) * mw + Math.round(x * dpr)) * 4;
      if (data[i + 3] > 110) dots.push({ x, y, color: toColor(data[i], data[i + 1], data[i + 2], boost), v: 0 });
    }
  }
  return dots;
}

/** A canvas holding just the shape's edge pixels, used as the outline. */
function buildOutline(mask: ImageData, boost: number) {
  const { data, width, height } = mask;
  const out = new ImageData(width, height);
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height && data[(y * width + x) * 4 + 3] >= 128;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!solid(x, y)) continue;
      if (solid(x - 1, y) && solid(x + 1, y) && solid(x, y - 1) && solid(x, y + 1)) continue;
      const i = (y * width + x) * 4;
      out.data[i] = Math.min(255, data[i] * boost);
      out.data[i + 1] = Math.min(255, data[i + 1] * boost);
      out.data[i + 2] = Math.min(255, data[i + 2] * boost);
      out.data[i + 3] = 255;
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.putImageData(out, 0, 0);
  return canvas;
}

export function HalftoneMark({ source, label, boost = 1 }: { source: Source; label: string; boost?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceKey = JSON.stringify(source);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const src = JSON.parse(sourceKey) as Source;

    let dots: Dot[] = [];
    let buckets = new Map<string, Dot[]>();
    let outline: HTMLCanvasElement | null = null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let lastTime = 0;
    let visible = false;
    let disposed = false;
    let buildId = 0;
    const pointer = { x: 0, y: 0, active: false };
    const ripples: Ripple[] = [];

    const draw = (time: number) => {
      frame = 0;
      const dt = lastTime ? Math.min(time - lastTime, 64) : 16;
      lastTime = time;
      const k = blend(dt, 90);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      for (let r = ripples.length - 1; r >= 0; r--) if (time - ripples[r].start > RIPPLE_LIFE) ripples.splice(r, 1);

      for (const [color, group] of buckets) {
        ctx.fillStyle = color;
        ctx.beginPath();
        for (const dot of group) {
          let target = 0;
          let dx = 0;
          let dy = 0;
          if (!reduceMotion) {
            // Slow diagonal idle wave.
            target = 0.12 * (0.5 + 0.5 * Math.sin(time * 0.0016 - (dot.x + dot.y * 0.6) * 0.035));
            if (pointer.active) {
              dx = dot.x - pointer.x;
              dy = dot.y - pointer.y;
              const d = Math.hypot(dx, dy);
              target = Math.max(target, Math.exp(-((d / POINTER_RADIUS) ** 2)));
            }
            for (const ripple of ripples) {
              const age = time - ripple.start;
              const d = Math.hypot(dot.x - ripple.x, dot.y - ripple.y);
              const band = Math.exp(-(((d - age * RIPPLE_SPEED) / 22) ** 2)) * (1 - age / RIPPLE_LIFE);
              target = Math.max(target, band);
            }
          }
          dot.v += (target - dot.v) * (reduceMotion ? 1 : k);

          let x = dot.x;
          let y = dot.y;
          if (pointer.active && dot.v > 0.02) {
            const len = Math.hypot(dx, dy) || 1;
            x += (dx / len) * PUSH * dot.v;
            y += (dy / len) * PUSH * dot.v;
          }
          const radius = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * dot.v;
          ctx.moveTo(x + radius, y);
          ctx.arc(x, y, radius, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      if (outline) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(outline, 0, 0);
      }

      if (!reduceMotion && visible && !disposed) frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (!frame && !disposed) frame = requestAnimationFrame(draw);
    };

    const build = async () => {
      const id = ++buildId;
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      const mask = await rasterise(src, rect.width, rect.height, nextDpr).catch(() => null);
      if (!mask || disposed || id !== buildId) return;
      width = rect.width;
      height = rect.height;
      dpr = nextDpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      dots = buildDots(mask, width, height, dpr, boost);
      buckets = new Map();
      for (const dot of dots) {
        const group = buckets.get(dot.color);
        if (group) group.push(dot);
        else buckets.set(dot.color, [dot]);
      }
      outline = buildOutline(mask, boost);
      lastTime = 0;
      if (reduceMotion) draw(performance.now());
      else start();
    };

    const toLocal = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onMove = (event: PointerEvent) => {
      Object.assign(pointer, toLocal(event), { active: true });
    };
    const onLeave = () => { pointer.active = false; };
    const onDown = (event: PointerEvent) => {
      ripples.push({ ...toLocal(event), start: performance.now() });
      if (ripples.length > 4) ripples.shift();
    };

    const resizeObserver = new ResizeObserver(() => { void build(); });
    resizeObserver.observe(canvas);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        lastTime = 0;
        start();
      }
    });
    visibilityObserver.observe(canvas);

    if (!reduceMotion) {
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("pointerdown", onDown);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, [sourceKey, boost]);

  return <canvas className="halftone-mark" ref={canvasRef} role="img" aria-label={label} />;
}
