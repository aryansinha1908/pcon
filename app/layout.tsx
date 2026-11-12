import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "PCON — Programming Club of NIT Jamshedpur",
  description: "A community of curious builders at NIT Jamshedpur. We explore competitive programming, development, AI, cloud, and everything in between.",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
};
export const viewport: Viewport = {
  themeColor: "#010806",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
