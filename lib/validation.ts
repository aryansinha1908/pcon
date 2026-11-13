import { z } from "zod";
import { slugify } from "./blog-utils";

/** https or relative URL check for images and links */
const urlPattern = /^(https?:\/\/|\/)/;
const validUrl = z.string().trim().refine((v) => !v || urlPattern.test(v), {
  message: "Use a valid web URL or absolute path.",
});
const optionalUrl = z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), validUrl.optional());

const httpsUrl = z.url({ protocol: /^https$/, message: "Use a full https:// link." });
const optionalHttpsUrl = z.preprocess((v) => (v === "" ? undefined : v), httpsUrl.optional());
const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().max(max).optional());

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
    .min(2000, "Check the batch year.")
    .refine((y) => y <= new Date().getFullYear() + 6, "Check the batch year."),
  order: z.coerce.number().int().min(0).max(999).default(0),
});

export const teamMemberUpdateSchema = teamMemberSchema.omit({ email: true });

export const teamMemberInputSchema = z.object({
  name: z.string().trim().min(2, "Name is required (at least 2 characters).").max(100),
  photo: optionalHttpsUrl,
  batch: z.coerce
    .number()
    .int()
    .min(1950, "Enter a valid batch year.")
    .max(2100, "Enter a valid batch year."),
  designation: optionalText(100),
  domain: optionalText(100),
  github: optionalHttpsUrl,
  linkedin: optionalHttpsUrl,
  portfolio: optionalHttpsUrl,
  email: z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? v.trim().toLowerCase() : undefined),
    z.string().email("Enter a valid email.").optional()
  ),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isActive: z.preprocess(
    (v) => (v === undefined ? true : v === "true" || v === true || v === "on"),
    z.boolean()
  ).default(true),
});

export const teamMemberUpdateApiSchema = teamMemberInputSchema.partial();

export type FormState = { error?: string; fieldErrors?: Record<string, string[] | undefined>; ok?: string; data?: unknown };

/** Flatten a zod error into per-field messages for forms. */
export function fieldErrorsOf(error: z.ZodError): FormState["fieldErrors"] {
  return z.flattenError(error).fieldErrors as FormState["fieldErrors"];
}
