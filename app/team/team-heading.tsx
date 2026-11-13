"use client";

import { useEffect, useState } from "react";
import TechText from "@/components/TechText";

/** Responsive sizes: 120px on large screens, smaller on tablets and phones. */
function sizesFor(width: number) {
  if (width <= 520) return { fontSize: 52, height: 180 };
  if (width <= 820) return { fontSize: 80, height: 260 };
  if (width <= 1100) return { fontSize: 100, height: 320 };
  return { fontSize: 120, height: 360 };
}

export function TeamHeading() {
  const [size, setSize] = useState(() => ({ ...sizesFor(1280), sweep: true }));

  useEffect(() => {
    // Touch screens skip the idle auto-sweep: it redraws the canvas every frame for as
    // long as the heading is on screen. Tap and drag still animate it.
    const update = () =>
      setSize({ ...sizesFor(window.innerWidth), sweep: !window.matchMedia("(pointer: coarse)").matches });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <>
    <h1 id="team-hero-title" className="sr-only">Our team</h1>
    <div
      className="team-heading"
      aria-hidden="true"
      // Height comes from CSS media queries (team.css) matching sizesFor(), so the box is
      // already the right size in the server HTML and nothing shifts on hydration.
      style={{ width: "100%", position: "relative" }}
    >
      <TechText
        text="Our team"
        fontWeight={500}
        fontSize={size.fontSize}
        sweep={size.sweep}
        color="#f3f2e9"
        accentColor="#00f5a0"
        reveal="letter"
        dashLength={4}
        dashGap={2}
        specks={15}
        intro="none"
        introDuration={2}
        clickKick
        guides={false}
        style={undefined}
      />
    </div>
    </>
  );
}
