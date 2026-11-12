import { ImageResponse } from "next/og";
import { logoDataUrl, OG_SIZE, OgFrame } from "@/lib/og";
import { siteUrl } from "@/lib/site-url";

export const alt = "PCON — Programming Club of NIT Jamshedpur. Code for the future.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await logoDataUrl();
  return new ImageResponse(
    (
      <OgFrame>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <img src={logo} width={151} height={90} alt="" style={{ filter: "brightness(1.5)" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: 6 }}>PCON</div>
            <div style={{ fontSize: 20, color: "#a9bdb2" }}>NIT Jamshedpur</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, color: "#70e3c7", letterSpacing: 2 }}>PROGRAMMING CLUB OF NIT JAMSHEDPUR</div>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 1.05, marginTop: 10 }}>
            Code for&nbsp;<span style={{ color: "#70e3c7" }}>the future.</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#748d81" }}>
          <div>Competitive programming · Web · AI/ML · DevOps</div>
          <div>{siteUrl().host}</div>
        </div>
      </OgFrame>
    ),
    size,
  );
}
