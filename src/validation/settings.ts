import { z } from "zod";

/**
 * One schema per settings group. Each schema provides defaults so the site
 * renders before anything has been saved in the admin panel. Groups are
 * added as features need them (contact, social, navigation, ...).
 */
export const settingsSchemas = {
  site: z.object({
    siteName: z.string().trim().min(1).max(80).default("Portfolio"),
    /** Public base URL, e.g. https://example.com. Used for canonical and OG URLs. */
    siteUrl: z.url().optional(),
  }),
  seo: z.object({
    defaultTitle: z.string().trim().max(70).default("Portfolio"),
    /** `%s` is replaced with the page title, e.g. "%s | Jane Doe". */
    titleTemplate: z.string().trim().max(70).default("%s"),
    defaultDescription: z.string().trim().max(160).default(""),
    defaultOgImage: z.string().trim().optional(),
  }),
} as const;

export type SettingsGroup = keyof typeof settingsSchemas;

export type Settings<G extends SettingsGroup> = z.infer<
  (typeof settingsSchemas)[G]
>;

export function isSettingsGroup(value: string): value is SettingsGroup {
  return Object.hasOwn(settingsSchemas, value);
}
