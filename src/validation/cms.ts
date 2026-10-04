import { z } from "zod";
import { isSafeUrl } from "@/lib/security/url";

/**
 * Reusable field schemas for section content and entities, so every
 * section validates links, media references and CTAs the same way.
 */

/** Reference to a document in the media collection. */
export const mediaIdSchema = z.string().regex(/^[a-f0-9]{24}$/, "Choose an image.");

/** Internal path, anchor, or http(s)/mailto/tel URL. Empty allowed. */
export const linkUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => value === "" || isSafeUrl(value), "Enter a valid link.");

export const ctaSchema = z.object({
  label: z.string().trim().max(40).default(""),
  url: linkUrlSchema.default(""),
});
