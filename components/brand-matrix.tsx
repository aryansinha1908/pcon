"use client";

import { useEffect, useRef, useState } from "react";

// Pre-computed 72x32 ASCII density map of the PCON logo emblem
const PCON_LOGO_MAP: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,6,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,6,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,5,0,0,0,3,5,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,7,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,3,0,0,0,0,6,6,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,7,5,0,0,0,0,0,0,6,6,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,5,0,0,0,0,0,0,0,6,6,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,7,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,2,6,7,5,0,0,0,0,0,0,0,0,6,6,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,7,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,4,7,7,6,0,0,0,0,0,0,0,0,0,6,6,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,7,5,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,5,7,7,6,0,0,0,0,0,0,0,0,0,0,6,6,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,7,7,6,2,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,3,6,7,7,7,4,0,0,0,0,0,0,0,0,0,0,6,6,6,3,0,0,0,0,0,3,5,5,5,5,5,5,4,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,7,7,7,7,4,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,4,7,7,7,7,6,0,0,0,0,0,0,0,0,0,0,0,6,6,6,3,0,0,4,6,6,6,6,6,6,6,6,6,6,6,6,5,3,0,0,0,0,0,0,0,0,0,0,0,0,6,7,7,7,7,5,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,6,7,7,7,7,7,5,0,0,0,0,0,0,0,0,0,0,0,6,6,6,4,4,6,6,6,6,6,6,5,5,5,5,5,6,6,6,6,6,5,0,0,0,0,0,0,0,0,0,0,0,4,7,7,7,7,7,6,3,0,0,0,0,0,0],
  [0,0,0,0,0,3,6,7,7,7,7,7,7,2,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,4,3,4,4,5,5,5,4,3,3,5,6,6,6,6,3,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,4,0,0,0,0,0],
  [0,0,0,0,5,7,7,7,7,7,7,7,6,0,0,0,0,0,0,0,0,0,0,0,0,5,6,6,6,6,6,4,3,5,6,6,6,6,6,6,6,6,6,4,3,5,6,6,6,0,0,0,0,0,0,0,0,0,0,6,7,7,7,7,7,7,7,5,0,0,0,0],
  [0,0,0,6,7,7,7,7,7,7,7,7,6,0,0,0,0,0,0,0,0,0,0,0,0,0,4,5,6,5,3,3,6,6,5,3,0,0,0,0,2,4,6,6,5,3,5,6,5,0,0,0,0,0,0,0,0,0,0,6,7,7,7,7,7,7,7,7,6,3,0,0],
  [0,4,7,7,7,7,7,7,7,7,7,7,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,6,6,4,0,3,5,5,5,5,5,0,0,4,6,5,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,7,7,7,7,7,7,7,7,7,5,0],
  [0,4,7,7,7,7,7,7,7,7,7,7,6,0,0,0,0,0,0,0,0,0,0,0,0,4,5,5,0,0,6,6,3,0,5,6,3,0,0,0,4,6,4,0,0,0,0,0,3,5,5,0,0,0,0,0,0,0,0,5,7,7,7,7,7,7,7,7,7,7,5,0],
  [0,0,2,6,7,7,7,7,7,7,7,7,6,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,3,4,6,5,0,4,6,0,0,0,0,0,0,0,6,3,0,0,0,0,6,6,6,4,0,0,0,0,0,0,0,6,7,7,7,7,7,7,7,7,6,3,0,0],
  [0,0,0,0,5,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,3,5,6,4,0,6,4,0,0,5,5,3,0,0,5,5,0,0,0,0,5,6,6,5,0,0,0,0,0,0,0,6,7,7,7,7,7,7,7,6,0,0,0,0],
  [0,0,0,0,0,3,7,7,7,7,7,7,7,3,0,0,0,0,0,0,0,0,0,0,0,6,6,6,3,5,6,4,0,6,4,0,0,5,5,4,0,0,5,5,0,0,0,0,5,6,6,5,0,0,0,0,0,0,2,7,7,7,7,7,7,7,4,0,0,0,0,0],
  [0,0,0,0,0,0,0,6,7,7,7,7,7,5,0,0,0,0,0,0,0,0,0,0,0,6,6,6,4,4,6,6,0,4,6,0,0,0,3,2,0,2,6,3,0,0,0,0,6,6,6,4,0,0,0,0,0,0,5,7,7,7,7,7,6,3,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,4,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,0,6,6,4,0,4,6,4,0,5,0,4,6,4,0,0,0,0,3,6,6,6,2,0,0,0,0,0,0,6,7,7,7,7,5,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,3,6,7,7,7,5,0,0,0,0,0,0,0,0,0,0,6,6,6,6,4,3,6,6,4,0,0,4,3,5,3,4,0,0,5,6,5,0,6,6,6,5,0,0,0,0,0,0,4,7,7,7,7,4,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,6,7,7,7,3,0,0,0,0,0,0,0,0,0,6,6,6,6,6,4,3,6,6,6,4,2,0,4,0,3,5,6,6,5,2,5,6,6,6,2,0,0,0,0,0,0,7,7,7,6,2,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,4,7,7,6,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,5,3,4,6,6,6,6,6,6,6,6,5,3,3,6,6,6,6,3,0,0,0,0,0,0,6,7,7,5,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,3,6,7,6,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,5,3,3,4,4,4,4,4,3,4,5,6,6,6,6,3,0,0,0,0,0,0,5,7,7,4,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,6,0,0,0,0,0,0,0,6,6,6,3,3,5,6,6,6,6,6,5,5,5,5,6,6,6,6,6,6,5,0,0,0,0,0,0,0,5,7,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,7,6,2,0,0,0,0,0,6,6,6,3,0,0,3,5,6,6,6,6,6,6,6,6,6,6,6,4,2,0,0,0,0,0,0,0,6,7,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,6,7,4,0,0,0,0,3,5,4,0,0,0,0,0,0,3,4,5,5,5,5,5,4,2,0,0,0,0,0,0,0,0,4,7,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,6,7,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,6,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,6,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Mathematical Delta triangle logo map for the alternate variant
function generateDeltaMap(cols: number, rows: number): number[][] {
  const map: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const cx = cols / 2;
  const topY = 2;
  const bottomY = rows - 3;
  const baseHalfWidth = cols * 0.38;

  for (let r = topY; r <= bottomY; r++) {
    const progress = (r - topY) / (bottomY - topY);
    const halfWidth = progress * baseHalfWidth;
    const left = cx - halfWidth;
    const right = cx + halfWidth;

    for (let c = 0; c < cols; c++) {
      // Outer triangle boundary thickness
      const dLeft = Math.abs(c - left);
      const dRight = Math.abs(c - right);
      const isBase = r >= bottomY - 3;
      // Crossbar in delta
      const isCrossbar = r >= rows * 0.58 && r <= rows * 0.64 && c >= left && c <= right;

      if (dLeft < 2.5 || dRight < 2.5 || (isBase && c >= left && c <= right) || isCrossbar) {
        map[r][c] = Math.min(8, Math.max(3, Math.floor(7 - Math.min(dLeft, dRight) * 2)));
      } else if (c > left && c < right && r < bottomY - 3) {
        // Subtle interior density
        if (Math.random() < 0.12) map[r][c] = 1;
      }
    }
  }
  return map;
}

const SOLID_GLYPHS = ["b", "k", "h", "d", "z", "p", "c", "n", "0", "X", "Z", "U", "C", "L", "O", "8", "#", "%"];
const LIGHT_GLYPHS = ["+", "{", "}", "[", "]", "(", ")", "/", "\\", "*", "~", ".", ":", ";", "1"];
const AMBIENT_GLYPHS = ["0", "1", "<", ">", "/", ";", ":", "+", "*", ".", "{", "}", "$"];

interface BrandMatrixProps {
  variant?: "pcon" | "delta";
}

export function BrandMatrix({ variant = "pcon" }: BrandMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeVariant, setActiveVariant] = useState<"pcon" | "delta">(variant);

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail === "pcon" || custom.detail === "delta") {
        setActiveVariant(custom.detail);
      } else {
        setActiveVariant((prev) => (prev === "pcon" ? "delta" : "pcon"));
      }
    };
    window.addEventListener("pcon:toggle-matrix", handleToggle);
    return () => window.removeEventListener("pcon:toggle-matrix", handleToggle);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest<HTMLElement>(".hero");
    const ctx = canvas?.getContext("2d");
    if (!canvas || !hero || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frameId = 0;
    let visible = false;

    // Intro stream / reveal animation state
    let startTime = performance.now();
    const cascadeDuration = 1900; // ms to cascade down

    // Pointer interaction
    let pointerX = -1000;
    let pointerY = -1000;
    let pointerActive = false;
    let ripple = { x: -1000, y: -1000, time: -10000 };

    // Cached grid cells
    interface Cell {
      gridX: number;
      gridY: number;
      screenX: number;
      screenY: number;
      density: number;
      glyph: string;
      tier: "solid" | "light" | "ambient";
      seed: number;
      revealDelay: number;
    }

    let cells: Cell[] = [];
    const sourceMap = activeVariant === "pcon" ? PCON_LOGO_MAP : generateDeltaMap(72, 32);
    const mapRows = sourceMap.length;
    const mapCols = sourceMap[0].length;

    const buildGrid = () => {
      const rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Cell size calculation: scale nicely between desktop and mobile
      // We target the logo taking up ~min(780px, width * 0.88)
      const targetLogoWidth = Math.min(840, Math.max(320, width * 0.85));
      const colStep = targetLogoWidth / mapCols;
      const rowStep = colStep * 1.28;

      const originX = (width - mapCols * colStep) / 2;
      // Position logo vertically slightly above center behind the hero text
      const originY = Math.max(20, (height - mapRows * rowStep) / 2 - 15);

      cells = [];

      for (let r = 0; r < mapRows; r++) {
        for (let c = 0; c < mapCols; c++) {
          const density = sourceMap[r][c];
          const screenX = originX + (c + 0.5) * colStep;
          const screenY = originY + (r + 0.5) * rowStep;

          let tier: "solid" | "light" | "ambient" = "ambient";
          let glyph = "";

          if (density >= 4) {
            tier = "solid";
            glyph = SOLID_GLYPHS[(c * 7 + r * 13) % SOLID_GLYPHS.length];
          } else if (density > 0) {
            tier = "light";
            glyph = LIGHT_GLYPHS[(c * 5 + r * 11) % LIGHT_GLYPHS.length];
          } else {
            // Very sparse ambient space outside logo (only 1 in 14 cells)
            if ((c * 17 + r * 31) % 15 === 0) {
              tier = "ambient";
              glyph = AMBIENT_GLYPHS[(c * 3 + r * 7) % AMBIENT_GLYPHS.length];
            } else {
              continue;
            }
          }

          // Progressive reveal delay (top to bottom with slight horizontal jitter)
          const rowNorm = r / mapRows;
          const jitter = ((c * 19) % 11) / 110;
          const revealDelay = Math.max(0, rowNorm * 0.85 + jitter);

          cells.push({
            gridX: c,
            gridY: r,
            screenX,
            screenY,
            density,
            glyph,
            tier,
            seed: c * 47 + r * 73,
            revealDelay,
          });
        }
      }
    };

    const render = (now: number) => {
      frameId = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const elapsed = now - startTime;
      const cascadeProgress = reducedMotion.matches
        ? 1
        : Math.min(1, Math.max(0, elapsed / cascadeDuration));

      ctx.font = `${Math.max(10, Math.min(14, width / 75))}px "DM Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const rippleAge = (now - ripple.time) / 1000;
      const hasActiveRipple = rippleAge >= 0 && rippleAge < 1.4;

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];

        // Cascade stream-in check
        if (!reducedMotion.matches && cascadeProgress < cell.revealDelay) {
          continue; // Not yet revealed
        }

        // Just revealed transition flash
        const isRevealing =
          !reducedMotion.matches &&
          cascadeProgress < cell.revealDelay + 0.12 &&
          cascadeProgress >= cell.revealDelay;

        // Pointer distance
        let pointerBoost = 0;
        if (pointerActive) {
          const dx = cell.screenX - pointerX;
          const dy = cell.screenY - pointerY;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            pointerBoost = (1 - dist / 150) * 0.85;
          }
        }

        // Ripple wave
        let rippleBoost = 0;
        if (hasActiveRipple) {
          const rDist = Math.hypot(cell.screenX - ripple.x, cell.screenY - ripple.y);
          const targetDist = rippleAge * 380; // px / sec
          const waveDelta = Math.abs(rDist - targetDist);
          if (waveDelta < 60) {
            rippleBoost = (1 - waveDelta / 60) * (1 - rippleAge / 1.4) * 0.9;
          }
        }

        // Living shimmer mutation
        let displayGlyph = cell.glyph;
        const shimmerTick = Math.floor((now + cell.seed) / 320);
        if (cell.tier === "solid" && (shimmerTick + cell.seed) % 9 === 0) {
          displayGlyph =
            SOLID_GLYPHS[(shimmerTick + cell.seed) % SOLID_GLYPHS.length];
        } else if (cell.tier === "light" && (shimmerTick + cell.seed) % 7 === 0) {
          displayGlyph =
            LIGHT_GLYPHS[(shimmerTick + cell.seed) % LIGHT_GLYPHS.length];
        }

        // Compute alpha and phosphor glow
        let baseAlpha = 0;
        if (cell.tier === "solid") {
          baseAlpha = 0.62 + (cell.density / 10) * 0.28;
        } else if (cell.tier === "light") {
          baseAlpha = 0.25 + (cell.density / 10) * 0.25;
        } else {
          baseAlpha = 0.045; // ambient background particle
        }

        const alpha = Math.min(
          1,
          baseAlpha + pointerBoost + rippleBoost + (isRevealing ? 0.45 : 0)
        );

        if (pointerBoost > 0.25 || rippleBoost > 0.25 || isRevealing) {
          ctx.shadowColor = "rgba(112, 227, 199, 0.95)";
          ctx.shadowBlur = 10;
          ctx.fillStyle = `rgba(168, 255, 230, ${alpha})`;
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(112, 227, 199, ${alpha})`;
        }

        ctx.fillText(displayGlyph, cell.screenX, cell.screenY);
      }

      ctx.shadowBlur = 0;

      if (visible && !reducedMotion.matches) {
        frameId = requestAnimationFrame(render);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
      pointerActive = true;
      if (reducedMotion.matches) render(performance.now());
      else if (visible && !frameId) frameId = requestAnimationFrame(render);
    };

    const onPointerDown = (e: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      ripple = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        time: performance.now(),
      };
      if (reducedMotion.matches) render(performance.now());
      else if (visible && !frameId) frameId = requestAnimationFrame(render);
    };

    const onPointerLeave = () => {
      pointerActive = false;
    };

    const onResize = () => {
      buildGrid();
      startTime = performance.now() - cascadeDuration; // skip intro on resize
      render(performance.now());
    };

    const resizeObserver = new ResizeObserver(onResize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reducedMotion.matches && !frameId) {
        frameId = requestAnimationFrame(render);
      } else if (!visible && frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    });

    buildGrid();
    resizeObserver.observe(hero);
    visibilityObserver.observe(hero);
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerdown", onPointerDown, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave);

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerdown", onPointerDown);
      hero.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [activeVariant]);

  return <canvas ref={canvasRef} className="brand-matrix" aria-hidden="true" />;
}
