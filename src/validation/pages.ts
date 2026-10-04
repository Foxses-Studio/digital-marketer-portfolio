import { z } from "zod";
import { PAGE_DEFINITIONS } from "@/config/pages";

const pageKey = z.enum(Object.keys(PAGE_DEFINITIONS) as [keyof typeof PAGE_DEFINITIONS]);
const sectionId = z.uuid();

/** Section content/config are validated later against the section's own schema. */
export const updateSectionSchema = z.object({
  page: pageKey,
  sectionId,
  content: z.unknown().optional(),
  config: z.unknown().optional(),
});

export const setSectionEnabledSchema = z.object({
  page: pageKey,
  sectionId,
  enabled: z.boolean(),
});

export const reorderSectionsSchema = z.object({
  page: pageKey,
  order: z.array(sectionId).max(50),
});
