import { describe, expect, it } from "vitest";
import { formatDate, fromSiteLocal, toSiteLocal } from "@/lib/format";

describe("IST date handling", () => {
  it("reads a datetime-local value as Indian time, whatever the server's timezone", () => {
    expect(fromSiteLocal("2026-12-01T18:00")?.toISOString()).toBe("2026-12-01T12:30:00.000Z");
    expect(fromSiteLocal("2026-12-01T00:15")?.toISOString()).toBe("2026-11-30T18:45:00.000Z");
  });

  it("rejects anything that isn't a datetime-local value", () => {
    expect(fromSiteLocal("")).toBeUndefined();
    expect(fromSiteLocal("2026-12-01")).toBeUndefined();
    expect(fromSiteLocal("tomorrow")).toBeUndefined();
  });

  it("writes an instant back as the IST value the form shows", () => {
    expect(toSiteLocal(new Date("2026-12-01T12:30:00Z"))).toBe("2026-12-01T18:00");
    expect(toSiteLocal(new Date("2026-11-30T18:45:00Z"))).toBe("2026-12-01T00:15");
  });

  it("round-trips without drifting", () => {
    for (const v of ["2026-01-01T00:00", "2026-06-15T23:59", "2027-03-31T09:30"]) {
      expect(toSiteLocal(fromSiteLocal(v)!)).toBe(v);
    }
  });

  it("formats dates in IST", () => {
    // 20:00 UTC on 1 Dec is already 2 Dec in India.
    expect(formatDate(new Date("2026-12-01T20:00:00Z"))).toBe("2 Dec 2026");
  });
});
