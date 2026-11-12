import { describe, expect, it } from "vitest";
import { hasRole, isRole, roleLabel } from "@/lib/roles";

describe("hasRole", () => {
  it("lets each role do everything the roles below it can", () => {
    expect(hasRole("OWNER", "ADMIN")).toBe(true);
    expect(hasRole("OWNER", "MEMBER")).toBe(true);
    expect(hasRole("ADMIN", "MEMBER")).toBe(true);
    expect(hasRole("ADMIN", "ADMIN")).toBe(true);
  });

  it("never lets a lower role pass a higher check", () => {
    expect(hasRole("MEMBER", "ADMIN")).toBe(false);
    expect(hasRole("ADMIN", "OWNER")).toBe(false);
  });

  it("treats a missing role as no access", () => {
    expect(hasRole(undefined, "MEMBER")).toBe(false);
    expect(hasRole(null, "MEMBER")).toBe(false);
  });
});

describe("isRole", () => {
  it("accepts only the three real roles", () => {
    expect(isRole("ADMIN")).toBe(true);
    expect(isRole("admin")).toBe(false);
    expect(isRole("pcon:Owner")).toBe(false);
    expect(isRole("SUPERADMIN")).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });
});

it("roleLabel reads naturally", () => {
  expect(roleLabel("OWNER")).toBe("Owner");
});
