import { z } from "zod";
import { ACHIEVEMENT_KINDS, ACHIEVEMENT_TIER_VALUES, FAME_KINDS } from "./achievement-options";
import { slugify } from "./blog-utils";

/** https or relative URL check for images and links */
const urlPattern = /^(https?:\/\/|\/)/;
const validUrl = z.string().trim().refine((v) => !v || urlPattern.test(v), {
  message: "Use a valid web URL or absolute path.",
});
const optionalUrl = z.preprocess(
  (v) => (v === null || v === undefined || (typeof v === "string" && v.trim() === "") ? undefined : v),
  validUrl.nullable().optional()
);

const httpsUrl = z.url({ protocol: /^https$/, message: "Use a full https:// link." });
const optionalHttpsUrl = z.preprocess(
  (v) => (v === null || v === undefined || (typeof v === "string" && v.trim() === "") ? undefined : v),
  httpsUrl.nullable().optional()
);
const optionalText = (max: number) =>
  z.preprocess(
    (v) => (v === null || v === undefined || (typeof v === "string" && v.trim() === "") ? undefined : v),
    z.string().trim().max(max).nullable().optional()
  );

export const eventSchema = z
  .object({
    title: z.string().trim().min(3, "Title is too short.").max(120),
    description: z.string().trim().min(10, "Add a short description.").max(5000),
    location: optionalText(120),
    posterUrl: optionalHttpsUrl,
    registrationUrl: optionalHttpsUrl,
    startDate: z.coerce.date({ message: "Pick a start date." }),
    endDate: z.coerce.date({ message: "Pick an end date." }),
  })
  .refine((e) => e.endDate >= e.startDate, { path: ["endDate"], message: "End must be after the start." });

export const blogCategorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(60),
  slug: z
    .string()
    .trim()
    .optional()
    .transform((s) => {
      const val = s ? slugify(s) : "";
      return val;
    }),
  hue: z.coerce.number().int().min(0).max(360).default(160),
});

export const blogAuthorSchema = z.object({
  name: z.string().trim().min(2, "Author name is required.").max(100),
  roleTitle: z.string().trim().min(2, "Role / branch is required (e.g. Pre-final year, CSE).").max(100),
  bio: z.string().trim().max(500).default(""),
  avatarUrl: optionalUrl,
  memberId: optionalText(60),
});

export const blogSchema = z.object({
  title: z.string().trim().min(3, "Title is too short.").max(150),
  slug: z
    .string()
    .optional()
    .transform((s) => (s && s.trim() ? slugify(s) : undefined)),
  excerpt: z.string().trim().min(5, "Add a short intro / excerpt.").max(300, "Excerpt must be under 300 characters."),
  content: z.string().trim().min(20, "Write a little more before saving.").max(100_000),
  coverImageUrl: optionalUrl,
  coverImageAlt: optionalText(200),
  categoryId: z.coerce.number({ message: "Please select a category." }).int().positive(),
  authorId: z.coerce.number({ message: "Please select an author." }).int().positive(),
  status: z.preprocess((v) => {
    if (v === "published" || v === "true" || v === "on") return "published";
    return "draft";
  }, z.enum(["draft", "published"])),
  isFeatured: z.preprocess((v) => v === "true" || v === "on" || v === true, z.boolean()).default(false),
});

export const teamMemberSchema = z.object({
  email: z.preprocess((v) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email("Enter a valid email.")),
  position: z.string().trim().min(2, "Add a position.").max(60),
  batch: z.coerce
    .number()
    .int()
    .min(2018, "Check the batch year (must be 2018 or later).")
    .refine((y) => y <= new Date().getFullYear() + 6, "Check the batch year."),
  order: z.coerce.number().int().min(0).max(999).default(0),
});

export const teamMemberUpdateSchema = teamMemberSchema.omit({ email: true });

export const teamMemberInputSchema = z.object({
  name: z.string().trim().min(2, "Name is required (at least 2 characters).").max(100),
  studentId: optionalText(50),
  photo: optionalUrl,
  batch: z.coerce
    .number({ message: "Enter a valid batch year." })
    .int("Batch year must be an integer.")
    .min(2018, "Batch year must be 2018 or later.")
    .max(2100, "Enter a valid batch year."),
  designation: optionalText(100),
  domain: optionalText(100),
  specializations: z.preprocess((val) => {
    if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
    if (typeof val === "string" && val.trim()) {
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return undefined;
  }, z.array(z.string()).optional()),
  github: optionalHttpsUrl,
  linkedin: optionalHttpsUrl,
  portfolio: optionalHttpsUrl,
  email: z.preprocess(
    (v) => (v === null || v === undefined || (typeof v === "string" && v.trim() === "") ? null : typeof v === "string" ? v.trim().toLowerCase() : v),
    z.string().email("Enter a valid email.").nullable().optional()
  ),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isActive: z.preprocess(
    (v) => (v === undefined ? true : v === "true" || v === true || v === "on"),
    z.boolean()
  ).default(true),
});

export const teamMemberUpdateApiSchema = teamMemberInputSchema.partial();

// ───── Achievements (/achievements) ─────

export const achievementSchema = z.object({
  title: z.string().trim().min(3, "Title is too short.").max(140),
  organiser: z.string().trim().min(2, "Who ran it? e.g. ICPC, Adobe.").max(120),
  year: z.coerce
    .number({ message: "Enter a year." })
    .int("Enter a year.")
    .min(2017, "PCON started in 2017.")
    .refine((y) => y <= new Date().getFullYear() + 1, "Check the year."),
  dates: optionalText(60),
  kind: z.enum(ACHIEVEMENT_KINDS, { message: "Pick a type." }),
  result: z.string().trim().min(2, "Add the result, e.g. Winner or Rank 54.").max(40),
  tier: z.enum(ACHIEVEMENT_TIER_VALUES, { message: "Pick a badge colour." }),
  highlight: optionalText(120),
  imageUrl: optionalUrl,
  imageAlt: optionalText(200),
  featured: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()).default(false),
});

// ───── Hall of fame (/hall-of-fame) ─────

/** Roll numbers like 2025UGCS010: letters and digits only, stored uppercase. */
const optionalRoll = z.preprocess(
  (v) => (typeof v === "string" ? (v.trim() === "" ? undefined : v.trim().toUpperCase()) : v),
  z.string().regex(/^[0-9A-Z]{6,16}$/, "Roll numbers are letters and digits, e.g. 2025UGCS010.").optional(),
);

const personName = z.string().trim().min(2, "Name is too short.").max(80);

export const placementSchema = z.object({
  rank: z.union([z.literal(1), z.literal(2), z.literal(3)]).nullable(),
  name: personName,
  roll: optionalRoll,
  award: optionalText(60),
  team: z.array(z.string().trim().min(1).max(80)).max(8, "At most 8 team members.").default([]),
});

export const hallOfFameSchema = z.object({
  event: z.string().trim().min(3, "Event name is too short.").max(140),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick the date.")
    .refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)), "Pick the date."),
  kind: z.enum(FAME_KINDS, { message: "Pick a type." }),
  summary: optionalText(400),
  link: optionalHttpsUrl,
  podium: z.array(placementSchema).min(1, "Add at least the winner."),
  mentions: z.array(placementSchema).max(20, "At most 20 special mentions.").default([]),
});

export type FormState = { error?: string; fieldErrors?: Record<string, string[] | undefined>; ok?: string; data?: unknown };

/** Flatten a zod error into per-field messages for forms. */
export function fieldErrorsOf(error: z.ZodError): FormState["fieldErrors"] {
  return z.flattenError(error).fieldErrors as FormState["fieldErrors"];
}
