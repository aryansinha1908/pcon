import { DM_Mono, DM_Sans, Manrope, Press_Start_2P } from "next/font/google";

/*
 * Self-hosted at build time by next/font: no render-blocking request to Google,
 * size-adjusted fallbacks (no layout shift when the web font swaps in), and only
 * the weights the site actually uses. Each font exposes a CSS variable that
 * app/globals.css maps onto the --sans / --display / --mono / --pixel tokens.
 */
export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin"],
  // 800 is only drawn into the footer {;} halftone canvas.
  weight: ["500", "600", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap",
  // Decorative taglines only; don't compete with the body fonts for bandwidth.
  preload: false,
});

export const fontVariables = [dmSans.variable, manrope.variable, dmMono.variable, pressStart.variable].join(" ");
