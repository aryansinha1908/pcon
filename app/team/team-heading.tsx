"use client";

import { useEffect, useState } from "react";
import TechText from "@/components/TechText";

/** Responsive sizes: 150px on large screens, smaller on tablets and phones. */
function sizesFor(width: number) {
  if (width <= 520) return { fontSize: 56, height: 240 };
  if (width <= 820) return { fontSize: 84, height: 320 };
  if (width <= 1100) return { fontSize: 116, height: 400 };
  return { fontSize: 150, height: 480 };
}

export function TeamHeading() {
  const [size, setSize] = useState(() => sizesFor(1280));

  useEffect(() => {
    const update = () => setSize(sizesFor(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      className="team-heading"
      style={{ width: "100%", height: `${size.height}px`, position: "relative" }}
    >
      <TechText
        text="OUR TEAM"
        fontFamily='Manrope, sans-serif'
        fontWeight={600}
        fontSize={size.fontSize}
        color="#f3f2e9"
        accentColor="#82cce9"
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
  );
}
