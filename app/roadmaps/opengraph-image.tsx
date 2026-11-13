import { ImageResponse } from "next/og";
import { logoDataUrl, OG_SIZE, OgFrame } from "@/lib/og";
import { getPathway } from "@/lib/roadmaps";
import { siteUrl } from "@/lib/site-url";

export const alt = "PCON Roadmaps — find your path: competitive programming, web development, AI/ML and DevOps.";
export const size = OG_SIZE;
export const contentType = "image/png";

const TINTS = { mint: "#70e3c7", blue: "#82cce9", orange: "#f2ad77", violet: "#c69bfa" } as const;

export default async function RoadmapsOpengraphImage() {
  const [logo, { branches }] = await Promise.all([logoDataUrl(), getPathway()]);
  return new ImageResponse(
    (
      <OgFrame>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src={logo} width={117} height={70} alt="" style={{ filter: "brightness(1.5)" }} />
          <div style={{ fontSize: 26, color: "#a9bdb2", letterSpacing: 3 }}>PCON · ROADMAPS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
            Find your&nbsp;<span style={{ color: "#70e3c7" }}>path.</span>
          </div>
          <div style={{ fontSize: 28, color: "#a9bdb2", marginTop: 18 }}>Curated by seniors, for juniors. Problem solving first, then pick a direction.</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {branches.map((branch) => (
            <div
              key={branch.slug}
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 18px", border: `2px solid ${TINTS[branch.tint]}`, borderRadius: 999, color: TINTS[branch.tint], fontSize: 22, whiteSpace: "nowrap" }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: TINTS[branch.tint] }} />
              {branch.title}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#748d81" }}>{siteUrl().host}/roadmaps</div>
      </OgFrame>
    ),
    size,
  );
}
