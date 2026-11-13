"use client";

import { useEffect, useRef, useState } from "react";
import { resolveFontToken } from "@/lib/font-token";

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

// Delta triangle logo map for the alternate variant
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

const SOLID_GLYPHS = ["P", "C", "O", "N", "p", "c", "n", "b", "k", "h", "d", "0", "X", "Z", "U", "8", "#", "%"];
const LIGHT_GLYPHS = ["+", "{", "}", "[", "]", "(", ")", "/", "\\", "*", "~", ".", ":", ";", "1"];
const RAIN_GLYPHS = ["#", "@", "%", "&", "X", "Z", "0", "1", "P", "C", "N", "b", "d", "k", "h", "/", "$", "!", "*", "+"];

interface Cell {
  gridX: number;
  gridY: number;
  screenX: number;
  screenY: number;
  density: number;
  glyph: string;
  tier: "solid" | "light" | "ambient";
  seed: number;
  offsetX: number;
  offsetY: number;
  vx: number;
  vy: number;
}

interface ColumnStream {
  col: number;
  x: number;
  speed: number;
  delay: number;
  trailLength: number;
  maxTargetY: number;
}

interface BrandMatrixProps {
  variant?: "pcon" | "delta";
}

export function BrandMatrix({ variant = "pcon" }: BrandMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeVariant, setActiveVariant] = useState<"pcon" | "delta">(variant);

  // Restart animation key when variant changes
  const animStartTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const custom = e as CustomEvent;
      animStartTimeRef.current = performance.now(); // re-trigger falling on shape toggle!
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
    let idleTimer = 0;
    let visible = false;
    const monoFamily = resolveFontToken("--mono", "monospace");

    // Low-power phones (few cores / little memory, or Save-Data) skip the falling-rain
    // intro and land on the settled matrix; shimmer and touch ripple still run.
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const lowPower =
      window.matchMedia("(pointer: coarse)").matches &&
      ((navigator.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4 || nav.connection?.saveData === true);

    // Record the exact mount time for falling animation
    animStartTimeRef.current = lowPower ? performance.now() - 5000 : performance.now();
    const FALL_SPEED = 480; // px/sec: smooth and cinematic falling

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

      // Balanced sizing: ~1080px max for clean framing behind PCON title
      const targetLogoWidth = Math.min(1080, Math.max(320, width * 0.82));
      colStep = targetLogoWidth / mapCols;
      rowStep = colStep * 1.25;

      const originX = (width - mapCols * colStep) / 2;
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
            offsetX: 0,
            offsetY: 0,
            vx: 0,
            vy: 0,
          });
        }
      }

      // Build falling streams for each column with natural ripple wave
      columnStreams = Array.from({ length: mapCols }, (_, c) => {
        // Center-outward or wave delay so rain falls in an organic sweep
        const distFromCenter = Math.abs(c - mapCols / 2) / (mapCols / 2);
        const waveDelay = distFromCenter * 350; // center falls first
        const jitter = ((c * 23) % 17) * 35; // natural column variation
        const delay = waveDelay + jitter;
        const speed = FALL_SPEED + ((c * 11) % 7) * 30; // 480 to 680 px/s
        const trailLength = 10 + Math.floor(((c * 7) % 6)); // 10 to 15 characters tall

        return {
          col: c,
          x: originX + (c + 0.5) * colStep,
          speed,
          delay,
          trailLength,
          maxTargetY: colMaxY[c] > 0 ? colMaxY[c] + 30 : originY + mapRows * rowStep,
        };
      });
    };

    const render = (now: number) => {
      frameId = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const elapsed = now - animStartTimeRef.current;
      // Falling animation active for first 3.2 seconds
      const isIntroActive = !reducedMotion.matches && elapsed < 3200;

      const fontSize = Math.max(9, Math.min(16, colStep * 0.88));
      ctx.font = `${fontSize}px ${monoFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const rippleAge = (now - ripple.time) / 1000;
      const hasActiveRipple = rippleAge >= 0 && rippleAge < 1.4;

      // Track the drop head position for each column
      let settled = true;
      const colDropY: number[] = new Array(mapCols);
      for (let c = 0; c < mapCols; c++) {
        const stream = columnStreams[c];
        if (!stream || reducedMotion.matches) {
          colDropY[c] = height + 1000;
        } else {
          const colElapsed = elapsed - stream.delay;
          if (colElapsed <= 0) {
            colDropY[c] = -120; // Waiting to drop
          } else {
            // Drop travels down from -50px above canvas
            colDropY[c] = -50 + (colElapsed / 1000) * stream.speed;
          }
        }
      }

      // 1. Draw Cells: Only revealed when the falling drop reaches their Y position!
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const dropY = colDropY[cell.gridX];

        // BEFORE THE DROP REACHES THIS CELL: DO NOT DRAW (It hasn't fallen yet!)
        if (dropY < cell.screenY) {
          continue;
        }

        // Just-landed impact flash (first 70px as the stream passes)
        const distFromHead = dropY - cell.screenY;
        const isImpact = isIntroActive && distFromHead < 70;

        // Pointer repulsion physics (hover repels particles outward!)
        let targetOffsetX = 0;
        let targetOffsetY = 0;
        let pointerBoost = 0;

        if (pointerActive && !reducedMotion.matches) {
          const dx = cell.screenX - pointerX;
          const dy = cell.screenY - pointerY;
          const dist = Math.hypot(dx, dy);
          const REPEL_RADIUS = 135; // Forcefield reach in pixels
          const MAX_PUSH = 36; // Maximum particle displacement

          if (dist < REPEL_RADIUS && dist > 0.001) {
            const norm = 1 - dist / REPEL_RADIUS;
            const force = norm * norm; // Quadratic force curve
            const angle = Math.atan2(dy, dx);
            targetOffsetX = Math.cos(angle) * force * MAX_PUSH;
            targetOffsetY = Math.sin(angle) * force * MAX_PUSH;
            pointerBoost = norm * 0.95;
          }
        }

        // Spring-damper physics towards target displacement
        const spring = 0.18;
        const friction = 0.74;
        const ax = (targetOffsetX - cell.offsetX) * spring;
        const ay = (targetOffsetY - cell.offsetY) * spring;
        cell.vx = (cell.vx + ax) * friction;
        cell.vy = (cell.vy + ay) * friction;
        cell.offsetX += cell.vx;
        cell.offsetY += cell.vy;
        if (settled && Math.abs(cell.vx) + Math.abs(cell.vy) + Math.abs(cell.offsetX) + Math.abs(cell.offsetY) > 0.05) {
          settled = false;
        }

        // Click ripple impulse
        let rippleBoost = 0;
        if (hasActiveRipple && !reducedMotion.matches) {
          const rDist = Math.hypot(cell.screenX - ripple.x, cell.screenY - ripple.y);
          const targetDist = rippleAge * 390;
          const waveDelta = Math.abs(rDist - targetDist);
          if (waveDelta < 60) {
            const rippleForce = (1 - waveDelta / 60) * (1 - rippleAge / 1.4);
            const rAngle = Math.atan2(cell.screenY - ripple.y, cell.screenX - ripple.x);
            cell.vx += Math.cos(rAngle) * rippleForce * 4.2;
            cell.vy += Math.sin(rAngle) * rippleForce * 4.2;
            rippleBoost = rippleForce * 0.95;
          }
        }

        // Living shimmer
        let displayGlyph = cell.glyph;
        const shimmerTick = Math.floor((now + cell.seed) / 300);
        if (cell.tier === "solid" && (shimmerTick + cell.seed) % 8 === 0) {
          displayGlyph = SOLID_GLYPHS[(shimmerTick + cell.seed) % SOLID_GLYPHS.length];
        } else if (cell.tier === "light" && (shimmerTick + cell.seed) % 6 === 0) {
          displayGlyph = LIGHT_GLYPHS[(shimmerTick + cell.seed) % LIGHT_GLYPHS.length];
        }

        let baseAlpha = 0;
        if (cell.tier === "solid") {
          baseAlpha = 0.68 + (cell.density / 10) * 0.28;
        } else if (cell.tier === "light") {
          baseAlpha = 0.30 + (cell.density / 10) * 0.26;
        } else {
          baseAlpha = 0.05;
        }

        const alpha = Math.min(
          1,
          baseAlpha + pointerBoost + rippleBoost + (isImpact ? 0.5 : 0)
        );

        const drawX = cell.screenX + cell.offsetX;
        const drawY = cell.screenY + cell.offsetY;

        // No per-glyph shadowBlur: canvas shadows on hundreds of glyphs a frame are the
        // single most expensive thing this hero did. Brightness alone carries the flash.
        if (isImpact) {
          ctx.fillStyle = "#ffffff";
        } else if (pointerBoost > 0.15 || rippleBoost > 0.25) {
          ctx.fillStyle = `rgba(220, 255, 245, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(0, 245, 160, ${alpha})`;
        }

        ctx.fillText(displayGlyph, drawX, drawY);
      }

      // 2. Draw Falling Code Streams (Matrix Rain cascading from the top)
      if (isIntroActive) {
        for (let c = 0; c < mapCols; c++) {
          const stream = columnStreams[c];
          const dropY = colDropY[c];

          // Stream not active or already finished past bottom
          if (dropY <= -40 || dropY > stream.maxTargetY + 140) continue;

          // Draw the falling rain trail above dropY
          for (let t = 0; t < stream.trailLength; t++) {
            const trailY = dropY - t * rowStep;
            if (trailY < -20 || trailY > height + 20) continue;

            const trailNorm = 1 - t / stream.trailLength; // 1 at lead, 0 at tail
            const charSeed = Math.floor(now / 50 + c * 19 + t * 7);
            const glyph = RAIN_GLYPHS[charSeed % RAIN_GLYPHS.length];

            if (t === 0) {
              // Luminous White Lead Drop Tip!
              ctx.shadowColor = "rgba(255, 255, 255, 1)";
              ctx.shadowBlur = 12;
              ctx.fillStyle = "#ffffff";
            } else if (t === 1) {
              // Bright mint second glyph, no shadow (only the lead tip glows)
              ctx.shadowBlur = 0;
              ctx.fillStyle = "#39ffb8";
            } else {
              // Cascading Green Trail fading upward
              ctx.shadowBlur = 0;
              ctx.fillStyle = `rgba(0, 245, 160, ${Math.max(0.12, 0.9 * trailNorm)})`;
            }

            ctx.fillText(glyph, stream.x, trailY);
          }
        }
      }

      ctx.shadowBlur = 0;

      if (visible && !reducedMotion.matches) {
        if (isIntroActive || pointerActive || hasActiveRipple || !settled) {
          frameId = requestAnimationFrame(render);
        } else {
          // Idle: only the shimmer changes, a few glyphs every 300ms. Redraw on a slow
          // timer instead of every frame so the CPU/GPU can rest on phones.
          idleTimer = window.setTimeout(wake, 150);
        }
      }
    };

    function wake() {
      window.clearTimeout(idleTimer);
      idleTimer = 0;
      if (visible && !frameId) frameId = requestAnimationFrame(render);
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
      pointerActive = true;
      if (reducedMotion.matches) render(performance.now());
      else wake();
    };

    const onPointerDown = (e: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      ripple = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        time: performance.now(),
      };
      if (reducedMotion.matches) render(performance.now());
      else wake();
    };

    const onPointerLeave = () => {
      pointerActive = false;
      pointerX = -1000;
      pointerY = -1000;
    };

    // Replay animation on double click anywhere on hero
    const onDblClick = () => {
      animStartTimeRef.current = performance.now();
      wake();
    };

    let prevWidth = 0;
    let prevHeight = 0;
    const onResize = () => {
      const rect = hero.getBoundingClientRect();
      // Guard against initial ResizeObserver firing on mount
      if (Math.abs(rect.width - prevWidth) < 2 && Math.abs(rect.height - prevHeight) < 2) {
        return;
      }
      prevWidth = rect.width;
      prevHeight = rect.height;
      buildGrid();
      // If user resized after intro finished, stay settled
      if (performance.now() - animStartTimeRef.current > 4000) {
        animStartTimeRef.current = performance.now() - 5000;
      }
      render(performance.now());
    };

    buildGrid();
    prevWidth = width;
    prevHeight = height;

    const resizeObserver = new ResizeObserver(onResize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reducedMotion.matches) {
        wake();
      } else if (!visible) {
        cancelAnimationFrame(frameId);
        frameId = 0;
        window.clearTimeout(idleTimer);
        idleTimer = 0;
      }
    });

    resizeObserver.observe(hero);
    visibilityObserver.observe(hero);
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerdown", onPointerDown, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave);
    hero.addEventListener("dblclick", onDblClick);

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(idleTimer);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerdown", onPointerDown);
      hero.removeEventListener("pointerleave", onPointerLeave);
      hero.removeEventListener("dblclick", onDblClick);
    };
  }, [activeVariant]);

  return <canvas ref={canvasRef} className="brand-matrix" aria-hidden="true" />;
}
