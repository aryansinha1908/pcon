import { ImageResponse } from "next/og";
import { logoDataUrl, OG_SIZE, OgFrame } from "@/lib/og";
import { siteUrl } from "@/lib/site-url";

export const alt = "PCON Hall of Fame — winners from contests and hackathons run by the Programming Club of NIT Jamshedpur.";
export const size = OG_SIZE;
export const contentType = "image/png";

const MEDALS = ["#f5c451", "#cbd5e1", "#e0915a"];

// Static on purpose: built at build time, when there is no database to read.
export default async function HallOfFameOpengraphImage() {
  const logo = await logoDataUrl();
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
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {MEDALS.map((color, i) => (
            <div key={color} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 999, backgroundColor: color, color: "#1a1405", fontSize: 26, fontWeight: 800 }}>
              {i + 1}
            </div>
          ))}
          <div style={{ display: "flex", marginLeft: 10, fontSize: 28, color: "#a9bdb2" }}>Winners of the club&apos;s contests and hackathons.</div>
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#748d81" }}>{siteUrl().host}/hall-of-fame</div>
      </OgFrame>
    ),
    size,
  );
}
