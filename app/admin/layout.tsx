import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { template: "%s · PCON Admin", default: "PCON Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm-root">{children}</div>;
}
