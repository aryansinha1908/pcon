import { ImageResponse } from "next/og";
import { clubAchievements } from "@/lib/club-achievements";
import { logoDataUrl, OG_SIZE, OgFrame } from "@/lib/og";
import { siteUrl } from "@/lib/site-url";

export const alt = "PCON Achievements — rank 54 and 1st among NITs at ICPC Kanpur 2025, plus national hackathon wins.";
export const size = OG_SIZE;
export const contentType = "image/png";

const TIER = { winner: "#f5c451", "runner-up": "#cbd5e1", finalist: "#70e3c7", rank: "#82cce9" } as const;

export default async function AchievementsOpengraphImage() {
  const logo = await logoDataUrl();
  return new ImageResponse(
    (
      <OgFrame>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src={logo} width={117} height={70} alt="" style={{ filter: "brightness(1.5)" }} />
          <div style={{ fontSize: 26, color: "#a9bdb2", letterSpacing: 3 }}>PCON · ACHIEVEMENTS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
            Where PCON&nbsp;<span style={{ color: "#70e3c7" }}>shows up.</span>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#f5c451", marginTop: 22 }}>Rank 54 · 1st among all NITs at ICPC Kanpur 2025</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {clubAchievements.filter((a) => !a.featured).slice(0, 4).map((a) => (
            <div key={a.slug} style={{ display: "flex", padding: "8px 16px", border: `2px solid ${TIER[a.tier]}`, borderRadius: 999, color: TIER[a.tier], fontSize: 20, whiteSpace: "nowrap" }}>
              {a.result} · {a.title}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#748d81" }}>{siteUrl().host}/achievements</div>
      </OgFrame>
    ),
    size,
  );
}
