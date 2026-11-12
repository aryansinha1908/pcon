import { describe, expect, it } from "vitest";
import { blogSchema, eventSchema, teamMemberInputSchema, teamMemberSchema } from "@/lib/validation";

const event = {
  title: "Hack Night",
  description: "An evening of building things together.",
  startDate: new Date("2026-12-01T12:30:00Z"),
  endDate: new Date("2026-12-01T16:30:00Z"),
};

describe("eventSchema", () => {
  it("accepts a normal event", () => {
    expect(eventSchema.safeParse(event).success).toBe(true);
  });

  it("rejects an end before the start", () => {
    const r = eventSchema.safeParse({ ...event, endDate: new Date("2026-12-01T10:00:00Z") });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["endDate"]);
  });

  it("rejects a missing date", () => {
    expect(eventSchema.safeParse({ ...event, startDate: undefined }).success).toBe(false);
  });

  it.each(["javascript:alert(1)", "http://example.com/poster.png", "data:image/png;base64,AAAA", "not a url"])(
    "rejects the link %s",
    (link) => {
      expect(eventSchema.safeParse({ ...event, posterUrl: link }).success).toBe(false);
      expect(eventSchema.safeParse({ ...event, registrationUrl: link }).success).toBe(false);
    },
  );

  it("accepts https links and treats empty ones as absent", () => {
    const r = eventSchema.safeParse({ ...event, posterUrl: "https://i.imgur.com/a.png", registrationUrl: "" });
    expect(r.success).toBe(true);
    expect(r.data?.registrationUrl).toBeUndefined();
  });
});

describe("blogSchema", () => {
  const blog = { title: "Intro to DP", content: "Dynamic programming breaks problems down.", published: "" };

  it("normalises and de-duplicates tags", () => {
    const r = blogSchema.parse({ ...blog, tags: " DSA, Dynamic Programming ,dsa,, " });
    expect(r.tags).toEqual(["dsa", "dynamic-programming"]);
  });

  it("allows at most 8 tags", () => {
    expect(blogSchema.safeParse({ ...blog, tags: "a,b,c,d,e,f,g,h" }).success).toBe(true);
    expect(blogSchema.safeParse({ ...blog, tags: "a,b,c,d,e,f,g,h,i" }).success).toBe(false);
  });

  it("reads the published checkbox", () => {
    expect(blogSchema.parse({ ...blog, published: "on" }).published).toBe(true);
    expect(blogSchema.parse({ ...blog, published: "" }).published).toBe(false);
  });

  it("rejects very short content", () => {
    expect(blogSchema.safeParse({ ...blog, content: "Too short" }).success).toBe(false);
  });
});

describe("teamMemberSchema", () => {
  const member = { email: "x@nitjsr.ac.in", position: "CP Lead", batch: "2028" };

  it("trims and lowercases the email", () => {
    expect(teamMemberSchema.parse({ ...member, email: "  Khyati@NITJSR.ac.in " }).email).toBe("khyati@nitjsr.ac.in");
  });

  it("defaults the display order to 0", () => {
    expect(teamMemberSchema.parse(member).order).toBe(0);
  });

  it("rejects batch years that can't be right", () => {
    expect(teamMemberSchema.safeParse({ ...member, batch: "1999" }).success).toBe(false);
    expect(teamMemberSchema.safeParse({ ...member, batch: String(new Date().getFullYear() + 7) }).success).toBe(false);
    expect(teamMemberSchema.safeParse({ ...member, batch: String(new Date().getFullYear() + 6) }).success).toBe(true);
  });
});

describe("teamMemberInputSchema", () => {
  const validMember = {
    name: "Aarav Sharma",
    batch: 2026,
    designation: "App Development Lead",
    domain: "App Development",
    photo: "https://images.unsplash.com/photo-1",
    github: "https://github.com/aarav",
    linkedin: "https://linkedin.com/in/aarav",
    portfolio: "https://aarav.dev",
    email: "aarav@nitjsr.ac.in",
    displayOrder: 1,
  };

  it("validates valid team member data", () => {
    const res = teamMemberInputSchema.safeParse(validMember);
    expect(res.success).toBe(true);
  });

  it("rejects invalid URL for github", () => {
    const res = teamMemberInputSchema.safeParse({
      ...validMember,
      github: "not-a-valid-url",
    });
    expect(res.success).toBe(false);
  });

  it("rejects invalid batch year", () => {
    const res = teamMemberInputSchema.safeParse({
      ...validMember,
      batch: 1800,
    });
    expect(res.success).toBe(false);
  });

  it("handles empty string optional URLs as null or empty", () => {
    const res = teamMemberInputSchema.safeParse({
      name: "Rohan Deshmukh",
      batch: 2027,
      photo: "",
      github: "",
      linkedin: "",
      portfolio: "",
    });
    expect(res.success).toBe(true);
  });
});
