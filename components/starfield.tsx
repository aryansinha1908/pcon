/**
 * A faint field of drifting, twinkling stars, a nod to the 5★ goal. Pure CSS;
 * positions come from a seeded generator so server and client markup match.
 * A handful of brighter four-point stars sit near the top.
 */

import { PauseOffscreen } from "@/components/pause-offscreen";

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = { x: number; y: number; size: number; opacity: number; duration: number; delay: number; bright: boolean };

function makeStars(count: number, seed: number): Star[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => {
    const bright = i < 7;
    // Bright stars cluster near the top of the sky; the rest spread out, thinning towards the bottom.
    const y = bright ? 4 + random() * 30 : random() ** 1.4 * 100;
    return {
      x: bright ? 8 + random() * 84 : random() * 100,
      y,
      size: bright ? 9 + random() * 7 : 1 + random() * 1.6,
      opacity: bright ? 0.75 : 0.25 + random() * 0.55 * (1 - y / 140),
      duration: 2.4 + random() * 4,
      delay: -random() * 6,
      bright,
    };
  });
}

const STARS = makeStars(90, 5);

export function Starfield() {
  return (
    <div className="starfield" aria-hidden="true" data-pause-offscreen>
      <PauseOffscreen />
      <div className="starfield__drift">
        {STARS.map((star, i) => (
          <span
            key={i}
            className={"star" + (star.bright ? " star--bright" : "")}
            style={{
              left: `${star.x.toFixed(2)}%`,
              top: `${star.y.toFixed(2)}%`,
              width: `${star.size.toFixed(2)}px`,
              height: `${star.size.toFixed(2)}px`,
              "--o": star.opacity.toFixed(2),
              "--d": `${star.duration.toFixed(2)}s`,
              animationDelay: `${star.delay.toFixed(2)}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
