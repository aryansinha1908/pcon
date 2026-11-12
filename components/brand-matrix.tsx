"use client";

import { useEffect, useRef, useState } from "react";

// High-resolution 72x32 ASCII density map of the PCON logo emblem (Right-side up)
const PCON_LOGO_MAP: number[][] = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,6,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,6,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,6,7,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,6,7,4,0,0,0,0,3,5,4,0,0,0,0,0,0,3,4,5,5,5,5,5,4,2,0,0,0,0,0,0,0,0,4,7,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,7,6,2,0,0,0,0,0,6,6,6,3,0,0,3,5,6,6,6,6,6,6,6,6,6,6,6,4,2,0,0,0,0,0,0,0,6,7,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,6,0,0,0,0,0,0,0,6,6,6,3,3,5,6,6,6,6,6,5,5,5,5,6,6,6,6,6,6,5,0,0,0,0,0,0,0,5,7,6,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,3,6,7,6,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,5,3,3,4,4,4,4,4,3,4,5,6,6,6,6,3,0,0,0,0,0,0,5,7,7,4,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,4,7,7,6,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,5,3,4,6,6,6,6,6,6,6,6,5,3,3,6,6,6,6,3,0,0,0,0,0,0,6,7,7,5,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,6,7,7,7,3,0,0,0,0,0,0,0,0,0,6,6,6,6,6,4,3,6,6,6,4,2,0,4,0,3,5,6,6,5,2,5,6,6,6,2,0,0,0,0,0,2,7,7,7,6,2,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,3,6,7,7,7,5,0,0,0,0,0,0,0,0,0,0,6,6,6,6,4,3,6,6,4,0,2,4,3,5,3,4,0,0,5,6,5,0,6,6,6,5,0,0,0,0,0,0,4,7,7,7,7,4,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,4,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,2,6,6,4,0,4,6,4,0,5,0,4,6,4,0,0,0,0,3,6,6,6,2,0,0,0,0,0,0,6,7,7,7,7,5,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,6,7,7,7,7,7,5,0,0,0,0,0,0,0,0,0,0,0,6,6,6,4,4,6,6,0,4,6,0,0,0,3,2,0,2,6,3,0,0,0,0,6,6,6,4,0,0,0,0,0,0,5,7,7,7,7,7,6,3,0,0,0,0,0,0],
  [0,0,0,0,0,3,7,7,7,7,7,7,7,3,0,0,0,0,0,0,0,0,0,0,0,6,6,6,3,5,6,4,0,6,4,0,0,5,5,4,0,0,5,5,0,0,0,0,5,6,6,5,0,0,0,0,0,0,2,7,7,7,7,7,7,7,4,0,0,0,0,0],
  [0,0,0,0,5,7,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,3,5,6,4,0,6,4,0,0,5,5,3,0,0,5,5,0,0,0,0,5,6,6,5,0,0,0,0,0,0,0,6,7,7,7,7,7,7,7,6,0,0,0,0],
  [0,0,2,6,7,7,7,7,7,7,7,7,6,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,3,4,6,5,0,4,6,0,0,0,0,0,0,2,6,3,0,0,0,0,6,6,6,4,0,0,0,0,0,0,0,6,7,7,7,7,7,7,7,7,6,3,0,0],
  [0,4,7,7,7,7,7,7,7,7,7,7,6,0,0,0,0,0,0,0,0,0,0,0,0,4,5,5,0,0,6,6,3,0,5,6,3,0,0,0,4,6,4,0,0,0,0,0,3,5,5,0,0,0,0,0,0,0,0,5,7,7,7,7,7,7,7,7,7,7,5,0],
  [0,4,7,7,7,7,7,7,7,7,7,7,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,6,6,4,0,3,5,5,5,5,5,2,0,4,6,5,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,7,7,7,7,7,7,7,7,7,5,0],
  [0,0,2,6,7,7,7,7,7,7,7,7,6,0,0,0,0,0,0,0,0,0,0,0,0,0,4,5,6,5,3,3,6,6,5,3,0,0,0,0,2,4,6,6,5,3,5,6,5,0,0,0,0,0,0,0,0,0,0,6,7,7,7,7,7,7,7,7,6,3,0,0],
  [0,0,0,0,5,7,7,7,7,7,7,7,6,0,0,0,0,0,0,0,0,0,0,0,0,5,6,6,6,6,6,4,3,5,6,6,6,6,6,6,6,6,6,4,3,5,6,6,6,0,0,0,0,0,0,0,0,0,0,6,7,7,7,7,7,7,7,5,0,0,0,0],
  [0,0,0,0,0,3,6,7,7,7,7,7,7,2,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,4,3,4,4,5,5,5,4,3,3,5,6,6,6,6,3,0,0,0,0,0,0,0,0,0,0,7,7,7,7,7,7,7,4,0,0,0,0,0],
  [0,0,0,0,0,0,0,6,7,7,7,7,7,5,0,0,0,0,0,0,0,0,0,0,0,6,6,6,4,4,6,6,6,6,6,6,5,5,5,5,5,6,6,6,6,6,5,2,0,0,0,0,0,0,0,0,0,0,4,7,7,7,7,7,6,3,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,4,7,7,7,7,6,0,0,0,0,0,0,0,0,0,0,0,6,6,6,3,0,0,4,6,6,6,6,6,6,6,6,6,6,6,6,5,3,0,0,0,0,0,0,0,0,0,0,0,0,6,7,7,7,7,5,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,3,6,7,7,7,4,0,0,0,0,0,0,0,0,0,0,6,6,6,3,0,0,0,0,2,3,5,5,5,5,5,5,4,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,7,7,7,7,4,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,5,7,7,6,0,0,0,0,0,0,0,0,0,0,6,6,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,7,7,6,2,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,4,7,7,6,0,0,0,0,0,0,0,0,0,6,6,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,7,5,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,2,6,7,5,0,0,0,0,0,0,0,0,6,6,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,7,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,5,0,0,0,0,0,0,0,6,6,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,7,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,7,5,0,0,0,0,0,0,6,6,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,6,6,3,0,0,0,0,6,6,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,6,6,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,7,5,0,0,0,3,5,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,7,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,6,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,6,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Mathematical Delta triangle logo map for the alternate variant
function generateDeltaMap(cols: number, rows: number): number[][] {
  const map: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const cx = cols / 2;
  const topY = 2;
  const bottomY = rows - 3;
  const baseHalfWidth = cols * 0.40;

  for (let r = topY; r <= bottomY; r++) {
    const progress = (r - topY) / (bottomY - topY);
    const halfWidth = progress * baseHalfWidth;
    const left = cx - halfWidth;
    const right = cx + halfWidth;

    for (let c = 0; c < cols; c++) {
      const dLeft = Math.abs(c - left);
      const dRight = Math.abs(c - right);
      const isBase = r >= bottomY - 3;
      const isCrossbar = r >= rows * 0.58 && r <= rows * 0.64 && c >= left && c <= right;

      if (dLeft < 2.5 || dRight < 2.5 || (isBase && c >= left && c <= right) || isCrossbar) {
        map[r][c] = Math.min(8, Math.max(3, Math.floor(7 - Math.min(dLeft, dRight) * 2)));
      } else if (c > left && c < right && r < bottomY - 3) {
        if (Math.random() < 0.12) map[r][c] = 1;
      }
    }
  }
  return map;
}

const SOLID_GLYPHS = ["b", "k", "h", "d", "z", "p", "c", "n", "0", "X", "Z", "U", "C", "L", "O", "8", "#", "%"];
const LIGHT_GLYPHS = ["+", "{", "}", "[", "]", "(", ")", "/", "\\", "*", "~", ".", ":", ";", "1"];
const RAIN_GLYPHS = ["#", "@", "%", "&", "X", "Z", "0", "1", "b", "d", "k", "h", "/", "$", "!", "*", "+"];

interface Cell {
  gridX: number;
  gridY: number;
  screenX: number;
  screenY: number;
  density: number;
  glyph: string;
  tier: "solid" | "light" | "ambient";
  seed: number;
}

interface ColumnStream {
  col: number;
  x: number;
  speed: number;
  delay: number; // ms offset
  trailLength: number; // number of rain glyphs in the falling tail
  maxTargetY: number;
}

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

    // Intro fall animation state
    let startTime = performance.now();
    const FALL_SPEED_BASE = 520; // px per second

    // Pointer interaction
    let pointerX = -1000;
    let pointerY = -1000;
    let pointerActive = false;
    let ripple = { x: -1000, y: -1000, time: -10000 };

    let cells: Cell[] = [];
    let columnStreams: ColumnStream[] = [];

    const sourceMap = activeVariant === "pcon" ? PCON_LOGO_MAP : generateDeltaMap(72, 32);
    const mapRows = sourceMap.length;
    const mapCols = sourceMap[0].length;

    let colStep = 0;
    let rowStep = 0;

    const buildGrid = () => {
      const rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Balanced logo sizing: adjusted to ~1080px max for clean framing
      const targetLogoWidth = Math.min(1080, Math.max(320, width * 0.82));
      colStep = targetLogoWidth / mapCols;
      rowStep = colStep * 1.25;

      const originX = (width - mapCols * colStep) / 2;
      // Vertically center right behind the big PCON title
      const originY = Math.max(20, (height - mapRows * rowStep) / 2 - 12);

      cells = [];
      const colMaxY: number[] = Array(mapCols).fill(0);

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
            colMaxY[c] = Math.max(colMaxY[c], screenY);
          } else if (density > 0) {
            tier = "light";
            glyph = LIGHT_GLYPHS[(c * 5 + r * 11) % LIGHT_GLYPHS.length];
            colMaxY[c] = Math.max(colMaxY[c], screenY);
          } else {
            // Very sparse ambient space outside logo
            if ((c * 17 + r * 31) % 18 === 0) {
              tier = "ambient";
              glyph = LIGHT_GLYPHS[(c * 3 + r * 7) % LIGHT_GLYPHS.length];
            } else {
              continue;
            }
          }

          cells.push({
            gridX: c,
            gridY: r,
            screenX,
            screenY,
            density,
            glyph,
            tier,
            seed: c * 47 + r * 73,
          });
        }
      }

      // Build falling streams for each column
      columnStreams = Array.from({ length: mapCols }, (_, c) => {
        // Natural stagger pattern across columns: wave + pseudo-random jitter
        const centerDist = Math.abs(c - mapCols / 2) / (mapCols / 2);
        const staggerWave = centerDist * 280; // center falls slightly first or wave outward
        const jitter = ((c * 23) % 19) * 45;
        const delay = staggerWave + jitter;
        const speed = FALL_SPEED_BASE + ((c * 13) % 9) * 35; // 520 to 800 px/sec
        const trailLength = 7 + Math.floor(((c * 7) % 5));

        return {
          col: c,
          x: originX + (c + 0.5) * colStep,
          speed,
          delay,
          trailLength,
          maxTargetY: colMaxY[c] > 0 ? colMaxY[c] + 40 : originY + mapRows * rowStep,
        };
      });
    };

    const render = (now: number) => {
      frameId = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const elapsed = now - startTime;
      const isIntroActive = !reducedMotion.matches && elapsed < 3200;

      // Font size scaled with cell width for crisp, large proportions
      const fontSize = Math.max(9, Math.min(16, colStep * 0.88));
      ctx.font = `${fontSize}px "DM Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const rippleAge = (now - ripple.time) / 1000;
      const hasActiveRipple = rippleAge >= 0 && rippleAge < 1.4;

      // Track the drop position for each column
      const colDropY: number[] = new Array(mapCols);
      for (let c = 0; c < mapCols; c++) {
        const stream = columnStreams[c];
        if (!stream || reducedMotion.matches) {
          colDropY[c] = height + 1000;
        } else {
          const colElapsed = elapsed - stream.delay;
          if (colElapsed <= 0) {
            colDropY[c] = -100; // Not yet started
          } else {
            // Starts dropping from y = -30 above the canvas down past the logo
            colDropY[c] = -30 + (colElapsed / 1000) * stream.speed;
          }
        }
      }

      // 1. Draw cells (Logo elements that have been reached by the falling stream)
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const dropY = colDropY[cell.gridX];

        // Has the falling stream reached or passed this cell?
        if (dropY < cell.screenY) {
          continue; // Hasn't fallen this far yet!
        }

        // Just-landed flash effect
        const distFromHead = dropY - cell.screenY;
        const isJustLanded = isIntroActive && distFromHead < 60;

        // Pointer proximity glow
        let pointerBoost = 0;
        if (pointerActive) {
          const dx = cell.screenX - pointerX;
          const dy = cell.screenY - pointerY;
          const dist = Math.hypot(dx, dy);
          if (dist < 165) {
            pointerBoost = (1 - dist / 165) * 0.9;
          }
        }

        // Ripple boost
        let rippleBoost = 0;
        if (hasActiveRipple) {
          const rDist = Math.hypot(cell.screenX - ripple.x, cell.screenY - ripple.y);
          const targetDist = rippleAge * 390;
          const waveDelta = Math.abs(rDist - targetDist);
          if (waveDelta < 65) {
            rippleBoost = (1 - waveDelta / 65) * (1 - rippleAge / 1.4) * 0.95;
          }
        }

        // Living shimmer: mutate glyphs subtly
        let displayGlyph = cell.glyph;
        const shimmerTick = Math.floor((now + cell.seed) / 300);
        if (cell.tier === "solid" && (shimmerTick + cell.seed) % 8 === 0) {
          displayGlyph = SOLID_GLYPHS[(shimmerTick + cell.seed) % SOLID_GLYPHS.length];
        } else if (cell.tier === "light" && (shimmerTick + cell.seed) % 6 === 0) {
          displayGlyph = LIGHT_GLYPHS[(shimmerTick + cell.seed) % LIGHT_GLYPHS.length];
        }

        // Base alpha calculation
        let baseAlpha = 0;
        if (cell.tier === "solid") {
          baseAlpha = 0.65 + (cell.density / 10) * 0.28;
        } else if (cell.tier === "light") {
          baseAlpha = 0.28 + (cell.density / 10) * 0.26;
        } else {
          baseAlpha = 0.05;
        }

        const alpha = Math.min(
          1,
          baseAlpha + pointerBoost + rippleBoost + (isJustLanded ? 0.55 : 0)
        );

        if (pointerBoost > 0.25 || rippleBoost > 0.25 || isJustLanded) {
          ctx.shadowColor = "rgba(112, 227, 199, 0.98)";
          ctx.shadowBlur = 12;
          ctx.fillStyle = `rgba(180, 255, 235, ${alpha})`;
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(112, 227, 199, ${alpha})`;
        }

        ctx.fillText(displayGlyph, cell.screenX, cell.screenY);
      }

      // 2. Draw the FALLING CODE STREAMS (Rain falling down the screen from top!)
      if (isIntroActive) {
        for (let c = 0; c < mapCols; c++) {
          const stream = columnStreams[c];
          const dropY = colDropY[c];

          // If stream hasn't started or already finished dropping past the logo
          if (dropY <= -20 || dropY > stream.maxTargetY + 120) continue;

          // Draw trailing falling characters above dropY
          for (let t = 0; t < stream.trailLength; t++) {
            const trailY = dropY - t * rowStep;
            if (trailY < -10 || trailY > height + 20) continue;

            const trailNorm = 1 - t / stream.trailLength; // 1 at head, 0 at tail
            const charSeed = Math.floor(now / 55 + c * 17 + t * 7);
            const glyph = RAIN_GLYPHS[charSeed % RAIN_GLYPHS.length];

            if (t === 0) {
              // Leading drop character: bright luminous white/mint!
              ctx.shadowColor = "rgba(255, 255, 255, 0.95)";
              ctx.shadowBlur = 14;
              ctx.fillStyle = "#ffffff";
            } else if (t === 1) {
              ctx.shadowColor = "rgba(112, 227, 199, 0.9)";
              ctx.shadowBlur = 10;
              ctx.fillStyle = `rgba(185, 255, 238, ${0.9 * trailNorm})`;
            } else {
              ctx.shadowBlur = 0;
              ctx.fillStyle = `rgba(112, 227, 199, ${0.75 * trailNorm})`;
            }

            ctx.fillText(glyph, stream.x, trailY);
          }
        }
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
      startTime = performance.now() - 4000; // Skip intro fall on window resize
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
