import type { Metadata, Viewport } from "next";
import { EntranceGate } from "@/components/entrance-gate";
import { PconLoader } from "@/components/pcon-loader";
import { fontVariables } from "@/lib/fonts";
import { baseOpenGraph, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, siteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  // Canonical URLs and og:url are set per page; setting them here would leak "/" into every route.
  openGraph: { ...baseOpenGraph, title: SITE_TITLE, description: SITE_DESCRIPTION },
  // Title, description and image fall back to each page's openGraph values.
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = {
  themeColor: "#010806",
  colorScheme: "dark",
};

/**
 * Runs before first paint: the splash plays once per browser session. Later full
 * loads in the same session hide it and skip the entrance straight away. If
 * sessionStorage is unavailable it fails safe and the splash simply plays.
 */
// Phones and tablets (narrow or touch screens), Save-Data and reduced motion skip the
// splash entirely so content paints straight away; it only plays on desktop.
const SPLASH_ONCE_SCRIPT = `(function(){var d=document.documentElement;function skip(){d.classList.add("splash-seen");d.classList.remove("is-entering")}try{var m=window.matchMedia,c=navigator.connection;if(m("(max-width: 1023px)").matches||m("(pointer: coarse)").matches||m("(prefers-reduced-motion: reduce)").matches||(c&&c.saveData)){skip();return}var k="pcon:splash-seen";if(sessionStorage.getItem(k)){skip()}else{sessionStorage.setItem(k,"1")}}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The inline script below may change <html>'s classes before hydration.
    <html lang="en" className={`is-entering ${fontVariables}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SPLASH_ONCE_SCRIPT }} />
      </head>
      <body>
        {/* Full-load splash: always plays its whole sequence, then lifts and the page flows in.
            Pure CSS on a fixed timeline, so it needs no JS and never replays on in-app navigation
            (this layout stays mounted). See "Splash + page entrance" in app/status-pages.css. */}
        <PconLoader variant="splash" />
        <EntranceGate />
        {children}
      </body>
    </html>
  );
}
