"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * The page entrance (content flowing up after the splash) is keyed on
 * `html.is-entering`, which the server HTML starts with. Remove it once the
 * entrance has played, or as soon as the visitor navigates within the app,
 * so pages opened later appear immediately instead of replaying the delay.
 */
const ENTRANCE_DONE_MS = 2900;

export function EntranceGate() {
  const pathname = usePathname();
  const firstPath = useRef(pathname);

  useEffect(() => {
    const timer = window.setTimeout(() => document.documentElement.classList.remove("is-entering"), ENTRANCE_DONE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (pathname !== firstPath.current) document.documentElement.classList.remove("is-entering");
  }, [pathname]);

  return null;
}
