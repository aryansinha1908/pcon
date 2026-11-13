import { ImageResponse } from "next/og";
import { logoDataUrl, OG_SIZE, OgFrame } from "@/lib/og";
import { siteUrl } from "@/lib/site-url";

export const alt = "PCON Events — contests, hackathons, workshops and talks at NIT Jamshedpur.";
export const size = OG_SIZE;
export const contentType = "image/png";

const KINDS = ["Contests", "Hackathons", "Workshops", "Talks"];

export default async function EventsOpengraphImage() {
  const logo = await logoDataUrl();
  return new ImageResponse(
    (
      <OgFrame>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <img src={logo} width={117} height={70} alt="" style={{ filter: "brightness(1.5)" }} />
          <div style={{ fontSize: 26, color: "#a9bdb2", letterSpacing: 3 }}>PCON · EVENTS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>Contests, builds</div>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 1.05, color: "#70e3c7" }}>and everything between.</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {KINDS.map((kind) => (
            <div key={kind} style={{ display: "flex", padding: "9px 18px", border: "2px solid #70e3c7", borderRadius: 999, color: "#70e3c7", fontSize: 22, whiteSpace: "nowrap" }}>{kind}</div>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 20, color: "#748d81" }}>{siteUrl().host}/events</div>
      </OgFrame>
    ),
    size,
  );
}
