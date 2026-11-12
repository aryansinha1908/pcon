import { describe, expect, it, vi } from "vitest";

// The rule functions are pure; stub the database client so no connection is needed.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
const { EVENT_RULE, eventCutoffDate, isHiddenOnSite } = await import("@/lib/events");

const now = new Date("2026-11-12T12:00:00Z");
const yearsAgo = (y: number, extraMs = 0) => {
  const d = new Date(now);
  d.setFullYear(d.getFullYear() - y);
  return new Date(d.getTime() + extraMs);
};

describe("event display rule", () => {
  it("is 10 events / 4 years", () => {
    expect(EVENT_RULE).toEqual({ maxBeforeCutoff: 10, cutoffYears: 4 });
  });

  it("puts the cutoff exactly 4 years before now", () => {
    expect(eventCutoffDate(now).toISOString()).toBe("2022-11-12T12:00:00.000Z");
  });

  it("hides nothing while there are 10 or fewer events", () => {
    expect(isHiddenOnSite(yearsAgo(7), 10, now)).toBe(false);
    expect(isHiddenOnSite(yearsAgo(7), 1, now)).toBe(false);
  });

  it("hides events older than 4 years once there are more than 10", () => {
    expect(isHiddenOnSite(yearsAgo(5), 11, now)).toBe(true);
    expect(isHiddenOnSite(yearsAgo(4, -1), 11, now)).toBe(true); // one millisecond past the cutoff
  });

  it("keeps events within 4 years, however many there are", () => {
    expect(isHiddenOnSite(yearsAgo(4), 50, now)).toBe(false); // exactly at the cutoff
    expect(isHiddenOnSite(yearsAgo(1), 50, now)).toBe(false);
    expect(isHiddenOnSite(new Date("2027-01-01"), 50, now)).toBe(false); // upcoming
  });
});
