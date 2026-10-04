import type { AnySectionDefinition } from "./define";

/**
 * Every section type the application provides. Sections are added here as
 * they are designed and built, for example (not built yet):
 *
 *   export const heroSection = defineSection({
 *     type: "hero",
 *     label: "Hero",
 *     content: z.object({
 *       eyebrow: z.string().max(60).default(""),
 *       heading: z.string().max(120).default(""),
 *       highlightedText: z.string().max(60).default(""),
 *       description: z.string().max(400).default(""),
 *       primaryCta: ctaSchema.default({ label: "", url: "" }),
 *       secondaryCta: ctaSchema.default({ label: "", url: "" }),
 *       imageMediaId: mediaIdSchema.nullable().default(null),
 *       availability: z.string().max(80).default(""),
 *     }),
 *     config: z.object({}),
 *   });
 *
 * then registered below and listed on a page in src/config/pages.ts.
 * The public component lives in src/sections/<type>/.
 */
export const sectionRegistry: Record<string, AnySectionDefinition> = {};

export function getSectionDefinition(type: string): AnySectionDefinition | undefined {
  return Object.hasOwn(sectionRegistry, type) ? sectionRegistry[type] : undefined;
}
