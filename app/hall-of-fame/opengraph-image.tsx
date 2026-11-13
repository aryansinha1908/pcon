import { ImageResponse } from "next/og";
import { achievements } from "@/lib/hall-of-fame";
import { logoDataUrl, OG_SIZE, OgFrame } from "@/lib/og";
import { siteUrl } from "@/lib/site-url";

export const alt = "PCON Hall of Fame — winners from contests and hackathons run by the Programming Club of NIT Jamshedpur.";
export const size = OG_SIZE;
export const contentType = "image/png";

const MEDALS = { 1: "#f5c451", 2: "#cbd5e1", 3: "#e0915a" } as const;

export default async function HallOfFameOpengraphImage() {
  const logo = await logoDataUrl();
  const latest = achievements[0];
  return new ImageResponse(
    (
      <OgFrame>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src={logo} width={117} height={70} alt="" style={{ filter: "brightness(1.5)" }} />
          <div style={{ fontSize: 26, color: "#a9bdb2", letterSpacing: 3 }}>PCON · HALL OF FAME</div>
        </div>
        <div style={{ display: "flex", fontSize: 120, fontWeight: 800, letterSpacing: -5, lineHeight: 1 }}>
          Hall of&nbsp;<span style={{ color: "#f5c451" }}>Fame.</span>
        </div>
        {latest ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#a9bdb2" }}>
            <span style={{ display: "flex", color: "#f3f2e9" }}>{latest.event}:</span>
            {[...latest.podium].sort((a, b) => a.rank - b.rank).map((place) => (
              <div key={place.rank} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `2px solid ${MEDALS[place.rank]}`, borderRadius: 999, color: MEDALS[place.rank], whiteSpace: "nowrap" }}>
                {place.rank}. {place.name}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", fontSize: 28, color: "#a9bdb2" }}>Winners from the club&apos;s contests and hackathons.</div>
        )}
        <div style={{ display: "flex", fontSize: 20, color: "#748d81" }}>{siteUrl().host}/hall-of-fame</div>
      </OgFrame>
    ),
    size,
  );
}
