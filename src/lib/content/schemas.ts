import { z } from "zod";
import { METRIC_VALUE_PATTERN } from "@/lib/metrics";
import { linkUrlSchema, mediaIdSchema } from "@/validation/cms";

/** Reusable Zod building blocks for sections and collections. */

export const optionalText = (max: number) =>
  z.string().trim().max(max, `Keep this under ${max} characters.`).default("");

export const requiredText = (max: number, message = "This field is required.") =>
  z.string().trim().min(1, message).max(max, `Keep this under ${max} characters.`);

export const optionalMedia = mediaIdSchema.nullable().default(null);

export const itemId = z.uuid();

/** A metric value stored as prefix + numeric string + suffix (see lib/metrics). */
export const metricFields = {
  prefix: z.string().trim().max(3, "Up to 3 characters.").regex(/^[^\d]*$/, "No numbers here.").default(""),
  value: z.string().trim().regex(METRIC_VALUE_PATTERN, "Use a number like 4.8, 1200 or 98.5 (no commas)."),
  suffix: z.string().trim().max(4, "Up to 4 characters.").regex(/^[^\d]*$/, "No numbers here.").default(""),
};

export const ctaSchema = z
  .object({
    enabled: z.boolean().default(false),
    label: optionalText(32),
    url: linkUrlSchema.default(""),
  })
  .superRefine((cta, ctx) => {
    if (!cta.enabled) return;
    if (!cta.label) ctx.addIssue({ code: "custom", path: ["label"], message: "Enter the button label." });
    if (!cta.url) ctx.addIssue({ code: "custom", path: ["url"], message: "Enter the button link." });
  });

export const CTA_DEFAULT = { enabled: false, label: "", url: "" };

/** Section heading block shared by most homepage sections. */
export const sectionHeaderSchema = {
  label: optionalText(40),
  heading: optionalText(120),
  highlight: optionalText(60),
  description: optionalText(300),
};

/** Art-directed cover palettes used when an entry has no cover image. */
export const COVER_STYLES = [
  { value: "ember", label: "Ember" },
  { value: "ink", label: "Ink" },
  { value: "moss", label: "Moss" },
  { value: "slate", label: "Slate" },
  { value: "sand", label: "Sand" },
] as const;
export const coverStyleSchema = z.enum(["ember", "ink", "moss", "slate", "sand"]).default("ink");

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter a URL slug.")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.");

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2026-03-14.");
