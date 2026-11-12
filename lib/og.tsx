import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Shared pieces for the generated social-share images (1200×630). */
export const OG_SIZE = { width: 1200, height: 630 };

/** The official logo as a data URL, read once at build time. */
export async function logoDataUrl() {
  const png = await readFile(join(process.cwd(), "public/pcon-logo.png"));
  return `data:image/png;base64,${png.toString("base64")}`;
}

/** Dark PCON backdrop with the mint glow and a faint dot grid. */
export function OgFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        backgroundColor: "#030f0d",
        backgroundImage:
          "radial-gradient(ellipse 60% 70% at 85% 0%, rgba(39,201,173,0.28), transparent 70%), radial-gradient(circle, rgba(134,193,163,0.16) 1.2px, transparent 1.2px)",
        backgroundSize: "100% 100%, 26px 26px",
        color: "#f3f2e9",
        fontFamily: "sans-serif",
      }}
    >
      {children}
    </div>
  );
}
