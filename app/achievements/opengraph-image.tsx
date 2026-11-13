import { ImageResponse } from "next/og";
import { logoDataUrl, OG_SIZE, OgFrame } from "@/lib/og";
import { siteUrl } from "@/lib/site-url";

export const alt = "PCON Achievements — the club at ICPC regionals and national hackathons.";
export const size = OG_SIZE;
export const contentType = "image/png";

const CHIPS = [
  { label: "ICPC regionals", color: "#82cce9" },
  { label: "National hackathons", color: "#f5c451" },
  { label: "Since 2017", color: "#70e3c7" },
];

// Static on purpose: built at build time, when there is no database to read.
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
          <div style={{ display: "flex", fontSize: 30, color: "#a9bdb2", marginTop: 22 }}>PCON at the ICPC regionals and national hackathons.</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {CHIPS.map((chip) => (
            <div key={chip.label} style={{ display: "flex", padding: "8px 18px", border: `2px solid ${chip.color}`, borderRadius: 999, color: chip.color, fontSize: 22, whiteSpace: "nowrap" }}>
              {chip.label}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#748d81" }}>{siteUrl().host}/achievements</div>
      </OgFrame>
    ),
    size,
  );
}
