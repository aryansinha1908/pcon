"use client";

import { usePathname } from "next/navigation";

/** The path the visitor asked for, for the 404 terminal. */
export function RequestedPath() {
  return <>{usePathname() || "/"}</>;
}
