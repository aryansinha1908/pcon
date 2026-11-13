import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/lib/site-url";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PCON — Programming Club of NIT Jamshedpur",
    short_name: "PCON",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#030f0d",
    theme_color: "#030f0d",
    icons: [
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
  };
}
