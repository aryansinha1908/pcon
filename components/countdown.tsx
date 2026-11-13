"use client";

import { useEffect, useState } from "react";

const UNITS = [
  { label: "Days", ms: 86_400_000 },
  { label: "Hours", ms: 3_600_000 },
  { label: "Mins", ms: 60_000 },
  { label: "Secs", ms: 1_000 },
] as const;

function split(remaining: number) {
  let rest = Math.max(0, remaining);
  return UNITS.map(({ label, ms }) => {
    const value = Math.floor(rest / ms);
    rest -= value * ms;
    return { label, value: String(value).padStart(2, "0") };
  });
}

/**
 * Terminal-style DD:HH:MM:SS countdown to `to`. The first render uses the
 * server's clock (`serverNow`) so server and client markup match; after mount
 * it follows the visitor's clock every second. Each digit is keyed by its
 * value, so a changed digit remounts and plays its flip-in animation.
 */
export function Countdown({ to, serverNow, label, doneLabel }: { to: string; serverNow: number; label: string; doneLabel: string }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState(serverNow);
  // Digits only animate once the client clock has taken over (not on the first paint).
  const ticking = now !== serverNow;

  useEffect(() => {
    let id = 0;
    const tick = () => {
      setNow(Date.now());
      if (Date.now() >= target) window.clearInterval(id);
    };
    const first = window.setTimeout(tick, 0);
    id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [target]);

  const remaining = target - now;
  const done = remaining <= 0;
  const units = split(remaining);

  return (
    <div className="countdown" data-ticking={ticking} data-done={done}>
      <p className="countdown__label">
        <span aria-hidden="true">$</span> {done ? doneLabel : label}
      </p>
      {/* Announce only the minute, not every second. */}
      <p className="sr-only" aria-live="polite">
        {done ? doneLabel : `${label} ${Number(units[0].value)} days, ${Number(units[1].value)} hours and ${Number(units[2].value)} minutes`}
      </p>
      <div className="countdown__tiles" aria-hidden="true">
        {units.map((unit, i) => (
          <div className="countdown__unit" key={unit.label}>
            {i > 0 && <span className="countdown__sep">:</span>}
            <div className="countdown__tile">
              <span className="countdown__digits">
                {[...unit.value].map((digit, j) => (
                  <span className="countdown__digit" key={`${j}-${digit}`}>{digit}</span>
                ))}
              </span>
              <small>{unit.label}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
