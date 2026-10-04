import { z } from "zod";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/config/social";
import { linkUrlSchema, mediaIdSchema } from "./cms";

/**
 * One schema per settings group, stored as one document each in the
 * `settings` collection. Every field has a default, so the site renders
 * before anything is saved, and adding a field needs no migration.
 * These schemas validate admin forms (client and server) and stored data.
 */

const optionalText = (max: number, message?: string) =>
  z.string().trim().max(max, message ?? `Keep this under ${max} characters.`).default("");

const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => value === "" || /^https?:\/\/[^\s]+\.[^\s]+/i.test(value), "Enter a full URL starting with https://");

const optionalMedia = mediaIdSchema.nullable().default(null);

// ------------------------------------------------------------------ general

const siteSchema = z
  .object({
    /** Name of the website, used in titles and as the brand fallback. */
    siteName: z.string().trim().min(1, "Enter the website name.").max(80).default("Portfolio"),
    professionalName: optionalText(80),
    professionalTitle: optionalText(80),
    /** Public base URL, e.g. https://example.com (canonical and OG URLs). */
    siteUrl: z
      .string()
      .trim()
      .max(200)
      .refine((value) => value === "" || /^https?:\/\/[^\s/]+\.[^\s]+$/i.test(value), "Enter a full URL such as https://example.com")
      .default(""),
    contactEmail: z
      .string()
      .trim()
      .toLowerCase()
      .max(254)
      .refine((value) => value === "" || z.email().safeParse(value).success, "Enter a valid email address.")
      .default(""),
    phone: z
      .string()
      .trim()
      .max(40)
      .refine((value) => value === "" || /^[+()\d\s.-]{5,40}$/.test(value), "Use digits, spaces and + ( ) - only.")
      .default(""),
    showPhone: z.boolean().default(false),
    location: optionalText(80),
    showLocation: z.boolean().default(false),
  })
  .superRefine((value, ctx) => {
    if (value.showPhone && !value.phone) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Add a phone number or turn off \"Show phone\"." });
    }
    if (value.showLocation && !value.location) {
      ctx.addIssue({ code: "custom", path: ["location"], message: "Add a location or turn off \"Show location\"." });
    }
  });

// ----------------------------------------------------------------- branding

const brandingSchema = z.object({
  logoMediaId: optionalMedia,
  /** Optional variant for dark mode; the main logo is used when empty. */
  darkLogoMediaId: optionalMedia,
  faviconMediaId: optionalMedia,
});

// ------------------------------------------------------------------- social

const socialLinkSchema = z
  .object({
    enabled: z.boolean().default(false),
    url: httpUrl.default(""),
    /** Only used by the custom "website" link. */
    label: optionalText(30),
  })
  .superRefine((link, ctx) => {
    if (link.enabled && !link.url) {
      ctx.addIssue({ code: "custom", path: ["url"], message: "Add a URL or turn this link off." });
    }
  });

const socialSchema = z.object(
  Object.fromEntries(
    SOCIAL_PLATFORMS.map((platform) => [platform.key, socialLinkSchema.default({ enabled: false, url: "", label: "" })]),
  ) as Record<SocialPlatform, z.ZodDefault<typeof socialLinkSchema>>,
);

// ---------------------------------------------------------------------- seo

const seoSchema = z.object({
  defaultTitle: z.string().trim().max(70, "Keep the title under 70 characters.").default("Portfolio"),
  /** `%s` is replaced with the page title, e.g. "%s | Jane Doe". */
  titleTemplate: z
    .string()
    .trim()
    .max(70)
    .refine((value) => value === "" || value.includes("%s"), "Include %s where the page title goes.")
    .default("%s"),
  defaultDescription: z.string().trim().max(160, "Keep the description under 160 characters.").default(""),
  defaultOgImageMediaId: optionalMedia,
});

// --------------------------------------------------------------- navigation

export const NAV_ITEM_LIMIT = 8;

export const navItemSchema = z.object({
  id: z.uuid(),
  label: z.string().trim().min(1, "Enter a label.").max(30, "Keep labels under 30 characters."),
  url: linkUrlSchema.refine((value) => value !== "", "Enter a link."),
  enabled: z.boolean().default(true),
  newTab: z.boolean().default(false),
});

export const ctaSchema = z
  .object({
    enabled: z.boolean().default(false),
    label: optionalText(40, "Keep the label under 40 characters."),
    url: linkUrlSchema.default(""),
    newTab: z.boolean().default(false),
  })
  .superRefine((cta, ctx) => {
    if (!cta.enabled) return;
    if (!cta.label) ctx.addIssue({ code: "custom", path: ["label"], message: "Enter the button label." });
    if (!cta.url) ctx.addIssue({ code: "custom", path: ["url"], message: "Enter the button link." });
  });

/** Header settings edited on the Navigation page (items have their own actions). */
export const headerSettingsSchema = z.object({
  cta: ctaSchema.default({ enabled: false, label: "", url: "", newTab: false }),
  /** Header stays at the top while scrolling. */
  sticky: z.boolean().default(true),
  /** Sticky header slides away when scrolling down and returns when scrolling up. */
  hideOnScroll: z.boolean().default(false),
});

/** Starting menu; the admin can rename, reorder, disable or delete these. */
const DEFAULT_NAV_ITEMS = [
  { id: "7f1b8f5e-0c55-4d55-9d2e-7b0d1b1e0001", label: "Home", url: "/", enabled: true, newTab: false },
  { id: "7f1b8f5e-0c55-4d55-9d2e-7b0d1b1e0002", label: "About", url: "/about", enabled: true, newTab: false },
  { id: "7f1b8f5e-0c55-4d55-9d2e-7b0d1b1e0003", label: "Case Studies", url: "/case-studies", enabled: true, newTab: false },
  { id: "7f1b8f5e-0c55-4d55-9d2e-7b0d1b1e0004", label: "Blog", url: "/blog", enabled: true, newTab: false },
  { id: "7f1b8f5e-0c55-4d55-9d2e-7b0d1b1e0005", label: "Contact", url: "/contact", enabled: true, newTab: false },
];

const navigationSchema = headerSettingsSchema.extend({
  /** Array order is display order. */
  items: z.array(navItemSchema).max(NAV_ITEM_LIMIT).default(DEFAULT_NAV_ITEMS),
  cta: ctaSchema.default({ enabled: true, label: "Let's work together", url: "/contact", newTab: false }),
});

// ------------------------------------------------------------------- footer

const footerSchema = z.object({
  /** Short line under the brand. */
  description: optionalText(200),
  /** "{year}" is replaced with the current year. Defaults to "© {year} Name". */
  copyright: optionalText(120),
  showNavigation: z.boolean().default(true),
  showSocial: z.boolean().default(true),
});

export const settingsSchemas = {
  site: siteSchema,
  branding: brandingSchema,
  social: socialSchema,
  seo: seoSchema,
  navigation: navigationSchema,
  footer: footerSchema,
} as const;

export type SettingsGroup = keyof typeof settingsSchemas;

export type Settings<G extends SettingsGroup> = z.infer<(typeof settingsSchemas)[G]>;

export type NavItem = z.infer<typeof navItemSchema>;

export function isSettingsGroup(value: string): value is SettingsGroup {
  return Object.hasOwn(settingsSchemas, value);
}

/** Groups saved as a whole from an admin form (navigation items use their own actions). */
export const FORM_SETTINGS_GROUPS = ["site", "branding", "social", "seo", "header", "footer"] as const;
export type FormSettingsGroup = (typeof FORM_SETTINGS_GROUPS)[number];
