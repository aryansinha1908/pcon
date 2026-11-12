import { z } from "zod";

/** https only — blocks javascript: and other schemes in links we render. */
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

export const blogSchema = z.object({
  title: z.string().trim().min(3, "Title is too short.").max(150),
  summary: optionalText(300),
  content: z.string().trim().min(20, "Write a little more before saving.").max(100_000),
  tags: z
    .string()
    .optional()
    .transform((s) =>
      Array.from(
        new Set(
          (s ?? "")
            .split(",")
            .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
            .filter(Boolean),
        ),
      ),
    )
    .pipe(z.array(z.string().max(30, "Tags must be 30 characters or less.")).max(8, "Use at most 8 tags.")),
  published: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
});

export const teamMemberSchema = z.object({
  email: z.preprocess((v) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email("Enter a valid email.")),
  position: z.string().trim().min(2, "Add a position.").max(60),
  // Checked at request time, not when the server starts, so it stays right across New Year.
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

export type FormState = { error?: string; fieldErrors?: Record<string, string[] | undefined>; ok?: string };

/** Flatten a zod error into per-field messages for forms. */
export function fieldErrorsOf(error: z.ZodError): FormState["fieldErrors"] {
  return z.flattenError(error).fieldErrors as FormState["fieldErrors"];
}
