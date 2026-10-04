import { z } from "zod";

/**
 * SEO fields attached to any public entry (page, project, case study, blog
 * post). Every field is optional: blanks fall back to the entry's own
 * title/excerpt and then to the global SEO settings.
 */
export const seoFieldsSchema = z.object({
  title: z.string().trim().max(70).optional(),
  description: z.string().trim().max(160).optional(),
  /** Absolute or root-relative image URL for Open Graph / social cards. */
  ogImage: z.string().trim().optional(),
  canonicalUrl: z.url().optional(),
  noIndex: z.boolean().default(false),
});

export type SeoFields = z.infer<typeof seoFieldsSchema>;
