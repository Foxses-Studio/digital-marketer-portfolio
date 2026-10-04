import { z } from "zod";
import type { FieldDef } from "@/lib/content/fields";
import {
  COVER_STYLES,
  coverStyleSchema,
  isoDateSchema,
  itemId,
  metricFields,
  optionalMedia,
  optionalText,
  requiredText,
  slugSchema,
} from "@/lib/content/schemas";
import { linkUrlSchema } from "@/validation/cms";
import { richTextSchema } from "@/validation/rich-text";

/**
 * Content collections (entries the admin adds, edits, reorders, disables
 * and deletes). Each has its own MongoDB collection; system fields
 * (`enabled`, `sortOrder`, timestamps) are managed by the entries service.
 * Client-safe: used by admin forms and by the server for validation.
 */

const metricSchema = z.object({ id: itemId, label: requiredText(32, "Enter a label."), ...metricFields });
const metricListField = (max: number): FieldDef => ({
  kind: "list",
  name: "metrics",
  label: "Results",
  max,
  itemLabel: "result",
  titleField: "label",
  newItem: { label: "", prefix: "", value: "", suffix: "" },
  fields: [
    { kind: "text", name: "label", label: "Label", max: 32 },
    { kind: "text", name: "prefix", label: "Prefix", max: 3, half: true, placeholder: "$" },
    { kind: "text", name: "value", label: "Value", half: true, placeholder: "4.8" },
    { kind: "text", name: "suffix", label: "Suffix", max: 4, half: true, placeholder: "x" },
  ],
});

const coverFields: FieldDef[] = [
  { kind: "media", name: "coverMediaId", label: "Cover image", hint: "Wide image, at least 1600px. Without one, the cover style is used." },
  { kind: "select", name: "coverStyle", label: "Cover style", options: COVER_STYLES, hint: "Used when there's no cover image." },
];

export const entityDefinitions = {
  services: {
    label: "Services",
    singular: "service",
    adminPath: "/admin/services",
    titleField: "title",
    subtitle: (item: Record<string, unknown>) => String(item.summary ?? ""),
    schema: z.object({
      title: requiredText(60, "Enter a title."),
      summary: requiredText(140, "Enter a one-line summary."),
      description: optionalText(400),
      metricValue: optionalText(16),
      metricLabel: optionalText(40),
      tags: z.array(z.string().trim().min(1).max(24)).max(4).default([]),
    }),
    fields: [
      { kind: "text", name: "title", label: "Title", max: 60 },
      { kind: "text", name: "summary", label: "Summary", max: 140, hint: "One line shown in the list." },
      { kind: "text", name: "description", label: "Description", max: 400, rows: 3 },
      { kind: "text", name: "metricValue", label: "Supporting metric", max: 16, half: true, placeholder: "e.g. -32%" },
      { kind: "text", name: "metricLabel", label: "Metric label", max: 40, half: true, placeholder: "e.g. average CPA" },
      { kind: "tags", name: "tags", label: "Capabilities", max: 4, placeholder: "e.g. Audience strategy" },
    ] satisfies FieldDef[],
  },

  caseStudies: {
    label: "Case studies",
    singular: "case study",
    adminPath: "/admin/case-studies",
    titleField: "title",
    slugged: true,
    subtitle: (item: Record<string, unknown>) => [item.client, item.year].filter(Boolean).join(" · "),
    schema: z.object({
      title: requiredText(90, "Enter a title."),
      slug: slugSchema,
      client: requiredText(60, "Enter the client."),
      industry: optionalText(40),
      service: optionalText(40),
      year: z.string().trim().regex(/^\d{4}$/, "Use a year like 2025."),
      challenge: optionalText(280),
      result: optionalText(280),
      metrics: z.array(metricSchema).max(4).default([]),
      coverMediaId: optionalMedia,
      coverStyle: coverStyleSchema,
      featured: z.boolean().default(true),
      body: richTextSchema.optional(),
    }),
    fields: [
      { kind: "text", name: "title", label: "Title", max: 90 },
      { kind: "text", name: "slug", label: "URL slug", max: 80, half: true, hint: "Used in the case study's address." },
      { kind: "text", name: "year", label: "Year", half: true, placeholder: "2025" },
      { kind: "text", name: "client", label: "Client", max: 60, half: true },
      { kind: "text", name: "industry", label: "Industry", max: 40, half: true },
      { kind: "text", name: "service", label: "Service", max: 40, half: true },
      { kind: "boolean", name: "featured", label: "Feature on the homepage" },
      { kind: "text", name: "challenge", label: "Challenge", max: 280, rows: 3 },
      { kind: "text", name: "result", label: "Result", max: 280, rows: 3 },
      metricListField(4),
      ...coverFields,
      { kind: "richtext", name: "body", label: "Full story", placeholder: "Write the full case study…" },
    ] satisfies FieldDef[],
  },

  blogPosts: {
    label: "Blog posts",
    singular: "post",
    adminPath: "/admin/blog",
    titleField: "title",
    slugged: true,
    enabledLabel: "Published",
    subtitle: (item: Record<string, unknown>) => [item.category, item.publishedAt].filter(Boolean).join(" · "),
    schema: z.object({
      title: requiredText(110, "Enter a title."),
      slug: slugSchema,
      excerpt: requiredText(240, "Enter a short excerpt."),
      category: requiredText(32, "Enter a category."),
      publishedAt: isoDateSchema,
      coverMediaId: optionalMedia,
      coverStyle: coverStyleSchema,
      featured: z.boolean().default(false),
      body: richTextSchema.optional(),
    }),
    fields: [
      { kind: "text", name: "title", label: "Title", max: 110 },
      { kind: "text", name: "slug", label: "URL slug", max: 80, half: true },
      { kind: "date", name: "publishedAt", label: "Publish date", half: true },
      { kind: "text", name: "category", label: "Category", max: 32, half: true, placeholder: "e.g. Paid Social" },
      { kind: "boolean", name: "featured", label: "Feature first on the homepage" },
      { kind: "text", name: "excerpt", label: "Excerpt", max: 240, rows: 3 },
      ...coverFields,
      { kind: "richtext", name: "body", label: "Article", placeholder: "Write the article…" },
    ] satisfies FieldDef[],
  },

  testimonials: {
    label: "Testimonials",
    singular: "testimonial",
    adminPath: "/admin/testimonials",
    titleField: "name",
    subtitle: (item: Record<string, unknown>) => [item.role, item.company].filter(Boolean).join(", "),
    schema: z.object({
      quote: requiredText(320, "Enter the quote."),
      name: requiredText(60, "Enter a name."),
      role: optionalText(60),
      company: optionalText(60),
      avatarMediaId: optionalMedia,
    }),
    fields: [
      { kind: "text", name: "quote", label: "Quote", max: 320, rows: 4, hint: "Two or three sentences read best." },
      { kind: "text", name: "name", label: "Name", max: 60, half: true },
      { kind: "text", name: "role", label: "Role", max: 60, half: true },
      { kind: "text", name: "company", label: "Company", max: 60, half: true },
      { kind: "media", name: "avatarMediaId", label: "Photo", preview: "square", hint: "Optional. Initials are shown without one." },
    ] satisfies FieldDef[],
  },

  experience: {
    label: "Experience",
    singular: "role",
    adminPath: "/admin/experience",
    titleField: "role",
    subtitle: (item: Record<string, unknown>) => [item.company, item.period].filter(Boolean).join(" · "),
    schema: z.object({
      role: requiredText(70, "Enter the role."),
      company: requiredText(60, "Enter the company."),
      period: requiredText(32, "Enter the period."),
      location: optionalText(40),
      description: optionalText(300),
      achievement: optionalText(140),
    }),
    fields: [
      { kind: "text", name: "role", label: "Role", max: 70 },
      { kind: "text", name: "company", label: "Company", max: 60, half: true },
      { kind: "text", name: "period", label: "Period", max: 32, half: true, placeholder: "2021 – Present" },
      { kind: "text", name: "location", label: "Location", max: 40, half: true },
      { kind: "text", name: "description", label: "Description", max: 300, rows: 3 },
      { kind: "text", name: "achievement", label: "Key achievement", max: 140 },
    ] satisfies FieldDef[],
  },

  certifications: {
    label: "Certifications",
    singular: "certification",
    adminPath: "/admin/certifications",
    titleField: "name",
    subtitle: (item: Record<string, unknown>) => [item.issuer, item.year].filter(Boolean).join(" · "),
    schema: z.object({
      name: requiredText(90, "Enter the certification."),
      issuer: requiredText(60, "Enter the issuer."),
      year: z.string().trim().regex(/^\d{4}$/, "Use a year like 2025."),
      credentialUrl: linkUrlSchema.default(""),
      logoMediaId: optionalMedia,
    }),
    fields: [
      { kind: "text", name: "name", label: "Certification", max: 90 },
      { kind: "text", name: "issuer", label: "Issuer", max: 60, half: true },
      { kind: "text", name: "year", label: "Year", half: true, placeholder: "2025" },
      { kind: "text", name: "credentialUrl", label: "Credential link", hint: "Optional link to verify the credential." },
      { kind: "media", name: "logoMediaId", label: "Logo", preview: "square" },
    ] satisfies FieldDef[],
  },

  tools: {
    label: "Tools & platforms",
    singular: "tool",
    adminPath: "/admin/tools",
    titleField: "name",
    subtitle: (item: Record<string, unknown>) => String(item.category ?? ""),
    schema: z.object({
      name: requiredText(40, "Enter the tool name."),
      category: z.enum(["advertising", "analytics", "seo", "crm", "content"]).default("advertising"),
      note: optionalText(60),
    }),
    fields: [
      { kind: "text", name: "name", label: "Name", max: 40, half: true },
      {
        kind: "select",
        name: "category",
        label: "Category",
        half: true,
        options: [
          { value: "advertising", label: "Advertising" },
          { value: "analytics", label: "Analytics & tracking" },
          { value: "seo", label: "SEO" },
          { value: "crm", label: "CRM & email" },
          { value: "content", label: "Content & creative" },
        ],
      },
      { kind: "text", name: "note", label: "Note", max: 60, hint: "Optional, e.g. what you use it for." },
    ] satisfies FieldDef[],
  },
} as const;

export type EntityType = keyof typeof entityDefinitions;
export type EntityDefinition = (typeof entityDefinitions)[EntityType];

export const TOOL_CATEGORY_LABELS: Record<string, string> = {
  advertising: "Advertising",
  analytics: "Analytics & tracking",
  seo: "SEO",
  crm: "CRM & email",
  content: "Content & creative",
};

export function isEntityType(value: string): value is EntityType {
  return Object.hasOwn(entityDefinitions, value);
}

export function getEntityDefinition(type: EntityType) {
  return entityDefinitions[type] as EntityDefinition & {
    schema: z.ZodObject<z.ZodRawShape>;
    fields: FieldDef[];
    slugged?: boolean;
    enabledLabel?: string;
    subtitle: (item: Record<string, unknown>) => string;
  };
}

/** Admin path → entity type, for module routes. */
export const entityByAdminPath = new Map<string, EntityType>(
  (Object.entries(entityDefinitions) as Array<[EntityType, EntityDefinition]>).map(([type, def]) => [def.adminPath, type]),
);

/** Entry as stored: content fields plus system fields. */
export type EntryRecord<T = Record<string, unknown>> = T & {
  id: string;
  enabled: boolean;
  sortOrder: number;
};
