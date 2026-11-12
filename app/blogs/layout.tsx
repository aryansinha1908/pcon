import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./blog.css";
import { BlogNav, BlogFooter } from "@/components/blog-nav";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blog | PCON NIT Jamshedpur",
  description: "Tutorials, deep dives and lessons learned, written by the students of NIT Jamshedpur.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`blog-theme ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <div className="blog-wrap">
        <BlogNav />
        <main id="app">{children}</main>
        <BlogFooter />
      </div>
    </div>
  );
}

