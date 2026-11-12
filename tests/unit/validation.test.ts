import { describe, expect, it } from "vitest";
import {
  blogSchema,
  blogCategorySchema,
  blogAuthorSchema,
  eventSchema,
  teamMemberSchema,
} from "@/lib/validation";

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
  const validBlog = {
    title: "Intro to DP",
    excerpt: "Learn dynamic programming fundamentals step by step.",
    content: "Dynamic programming breaks complex recursive problems down into memoized subproblems.",
    categoryId: 1,
    authorId: 1,
    status: "draft",
    isFeatured: false,
  };

  it("accepts a valid blog payload", () => {
    const r = blogSchema.safeParse(validBlog);
    expect(r.success).toBe(true);
  });

  it("reads published checkbox or string status", () => {
    expect(blogSchema.parse({ ...validBlog, status: "published" }).status).toBe("published");
    expect(blogSchema.parse({ ...validBlog, status: "on" }).status).toBe("published");
    expect(blogSchema.parse({ ...validBlog, status: "draft" }).status).toBe("draft");
  });

  it("parses featured checkbox", () => {
    expect(blogSchema.parse({ ...validBlog, isFeatured: "on" }).isFeatured).toBe(true);
    expect(blogSchema.parse({ ...validBlog, isFeatured: false }).isFeatured).toBe(false);
  });

  it("rejects very short content", () => {
    expect(blogSchema.safeParse({ ...validBlog, content: "Too short" }).success).toBe(false);
  });

  it("rejects very short excerpt", () => {
    expect(blogSchema.safeParse({ ...validBlog, excerpt: "No" }).success).toBe(false);
  });
});

describe("blogCategorySchema", () => {
  it("accepts valid category and slugifies", () => {
    const r = blogCategorySchema.parse({ name: "Web Dev", hue: 172 });
    expect(r.name).toBe("Web Dev");
    expect(r.hue).toBe(172);
  });
});

describe("blogAuthorSchema", () => {
  it("accepts valid author", () => {
    const r = blogAuthorSchema.parse({
      name: "Aarav Sinha",
      roleTitle: "Pre-final year, CSE",
      bio: "Codeforces specialist",
    });
    expect(r.name).toBe("Aarav Sinha");
    expect(r.roleTitle).toBe("Pre-final year, CSE");
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
