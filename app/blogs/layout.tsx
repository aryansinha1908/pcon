import type { Metadata } from "next";
import "./blog.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Tutorials, deep dives and lessons learned, written by the students of NIT Jamshedpur.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell blog-theme" id="top">
      <SiteHeader />
      <div className="blog-wrap">
        <main id="main" tabIndex={-1}>{children}</main>
      </div>
      <SiteFooter />
    </div>
  );
}
