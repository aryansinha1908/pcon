import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "PCON — Programming Club of NIT Jamshedpur",
  description: "A community of curious builders at NIT Jamshedpur. We explore competitive programming, development, AI, cloud, and everything in between.",
  icons: { icon: "/pcon-mark.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
