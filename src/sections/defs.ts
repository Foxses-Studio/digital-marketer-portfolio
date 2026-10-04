import { z } from "zod";
import { defineSection } from "@/lib/cms/sections/define";
import {
  CTA_DEFAULT,
  ctaSchema,
  itemId,
  metricFields,
  optionalMedia,
  optionalText,
  requiredText,
  sectionHeaderSchema,
} from "@/lib/content/schemas";
import { linkUrlSchema } from "@/validation/cms";
import { ctaField, headerFields, limitField } from "./shared-fields";

/**
 * Homepage section definitions (except the Hero, which has its own file
 * and editor). Each declares its content schema (every field defaulted),
 * the admin editor layout and, where relevant, the collection it shows.
 */

/** "Items to show": stored as the select's string value, e.g. "6". */
const limit = (min: number, max: number, fallback: number) =>
  z
    .string()
    .refine((value) => Number(value) >= min && Number(value) <= max, `Choose ${min} to ${max}.`)
    .default(String(fallback));

// ---------------------------------------------------------------- brands
export const BRAND_STYLES = [
  { value: "sans", label: "Sans" },
  { value: "serif", label: "Serif italic" },
  { value: "mono", label: "Mono" },
  { value: "wide", label: "Wide caps" },
] as const;

export const brandsSection = defineSection({
  type: "brands",
  label: "Trusted brands",
  description: "Client names or logos right after the hero.",
  content: z.object({
    label: optionalText(40),
    heading: optionalText(120),
    highlight: optionalText(60),
    brands: z
      .array(
        z.object({
          id: itemId,
          name: requiredText(40, "Enter the brand name."),
          style: z.enum(["sans", "serif", "mono", "wide"]).default("sans"),
          logoMediaId: optionalMedia,
          url: linkUrlSchema.default(""),
          enabled: z.boolean().default(true),
        }),
      )
      .max(16)
      .default([]),
  }),
  config: z.object({}),
  fields: [
    { title: "Heading", fields: headerFields({ description: false }) },
    {
      title: "Brands",
      description: "Without a logo, the name is set as a wordmark in the chosen style.",
      fields: [
        {
          kind: "list",
          name: "brands",
          label: "Brands",
          max: 16,
          itemLabel: "brand",
          titleField: "name",
          newItem: { name: "", style: "sans", logoMediaId: null, url: "", enabled: true },
          fields: [
            { kind: "text", name: "name", label: "Name", max: 40, half: true },
            { kind: "select", name: "style", label: "Wordmark style", options: BRAND_STYLES, half: true },
            { kind: "text", name: "url", label: "Link", hint: "Optional." },
            { kind: "media", name: "logoMediaId", label: "Logo", hint: "Optional. A transparent PNG works best." },
          ],
        },
      ],
    },
  ],
});

// --------------------------------------------------------------- results
export const resultsSection = defineSection({
  type: "results",
  label: "Results",
  description: "Your headline numbers, told as a short data story.",
  content: z.object({
    ...sectionHeaderSchema,
    metrics: z
      .array(
        z.object({
          id: itemId,
          label: requiredText(40, "Enter a label."),
          ...metricFields,
          note: optionalText(100),
          enabled: z.boolean().default(true),
        }),
      )
      .max(5, "Up to 5 results.")
      .default([]),
    chartLabel: optionalText(40),
    chartPoints: z.array(z.number().finite().min(0)).max(16).default([]),
    footnote: optionalText(160),
  }),
  config: z.object({}),
  fields: [
    { title: "Heading", fields: headerFields() },
    {
      title: "Results",
      description: "Up to 5. Each one takes the stage in turn as visitors scroll.",
      fields: [
        {
          kind: "list",
          name: "metrics",
          label: "Results",
          max: 5,
          itemLabel: "result",
          titleField: "label",
          newItem: { label: "", prefix: "", value: "", suffix: "", note: "", enabled: true },
          fields: [
            { kind: "text", name: "label", label: "Label", max: 40 },
            { kind: "text", name: "prefix", label: "Prefix", max: 3, half: true, placeholder: "$" },
            { kind: "text", name: "value", label: "Value", half: true, placeholder: "4.8" },
            { kind: "text", name: "suffix", label: "Suffix", max: 4, half: true, placeholder: "M" },
            { kind: "text", name: "note", label: "Context", max: 100, hint: "One short line of context." },
          ],
        },
      ],
    },
    {
      title: "Trend line",
      fields: [
        { kind: "text", name: "chartLabel", label: "Line label", max: 40, placeholder: "e.g. Blended ROAS by quarter" },
        { kind: "numbers", name: "chartPoints", label: "Values", max: 16, placeholder: "e.g. 2.1, 2.6, 3.0, 3.8", hint: "Plotted in order across the section." },
        { kind: "text", name: "footnote", label: "Footnote", max: 160 },
      ],
    },
  ],
});

// ----------------------------------------------------------------- about
export const aboutSection = defineSection({
  type: "about",
  label: "About",
  description: "A short introduction with a link to the full About page.",
  content: z.object({
    label: optionalText(40),
    statement: optionalText(220),
    highlight: optionalText(60),
    body: optionalText(600),
    details: z
      .array(z.object({ id: itemId, label: requiredText(30, "Enter a label."), value: requiredText(60, "Enter a value.") }))
      .max(4)
      .default([]),
    imageMediaId: optionalMedia,
    imageAlt: optionalText(160),
    cta: ctaSchema.default(CTA_DEFAULT),
  }),
  config: z.object({}),
  fields: [
    {
      title: "Introduction",
      fields: [
        { kind: "text", name: "label", label: "Label", max: 40, half: true },
        { kind: "text", name: "statement", label: "Statement", max: 220, rows: 3, hint: "The large opening line." },
        { kind: "text", name: "highlight", label: "Highlighted words", max: 60, hint: "Words from the statement shown in the accent style." },
        { kind: "text", name: "body", label: "Introduction", max: 600, rows: 4 },
      ],
    },
    {
      title: "Details",
      fields: [
        {
          kind: "list",
          name: "details",
          label: "Details",
          max: 4,
          itemLabel: "detail",
          titleField: "label",
          newItem: { label: "", value: "" },
          fields: [
            { kind: "text", name: "label", label: "Label", max: 30, half: true },
            { kind: "text", name: "value", label: "Value", max: 60, half: true },
          ],
        },
      ],
    },
    {
      title: "Image and button",
      fields: [
        { kind: "media", name: "imageMediaId", label: "Image", hint: "Optional portrait or workspace photo (4:5)." },
        { kind: "text", name: "imageAlt", label: "Image description", max: 160 },
        ctaField("cta", "Button"),
      ],
    },
  ],
});

// -------------------------------------------------- collection sections
const listSection = <T extends string>(opts: {
  type: T;
  label: string;
  description: string;
  entity: "services" | "caseStudies" | "testimonials" | "experience" | "certifications" | "tools" | "blogPosts";
  limit?: [number, number, number];
  cta?: boolean;
}) =>
  defineSection({
    type: opts.type,
    label: opts.label,
    description: opts.description,
    entity: opts.entity,
    content: z.object({
      ...sectionHeaderSchema,
      limit: opts.limit ? limit(...opts.limit) : z.string().default(""),
      cta: ctaSchema.default(CTA_DEFAULT),
    }),
    config: z.object({}),
    fields: [
      {
        title: "Heading",
        fields: [...headerFields(), ...(opts.limit ? [limitField(opts.limit[0], opts.limit[1])] : [])],
      },
      ...(opts.cta ? [{ title: "Button", fields: [ctaField("cta", "Button")] }] : []),
    ],
  });

export const servicesSection = listSection({
  type: "services",
  label: "Services",
  description: "What you do, as an interactive list.",
  entity: "services",
  limit: [3, 8, 6],
});

export const caseStudiesSection = listSection({
  type: "caseStudies",
  label: "Featured case studies",
  description: "Your strongest work. Shows case studies marked as featured.",
  entity: "caseStudies",
  limit: [2, 5, 3],
  cta: true,
});

export const toolsSection = listSection({
  type: "tools",
  label: "Tools & platforms",
  description: "The platforms you work with.",
  entity: "tools",
});

export const experienceSection = listSection({
  type: "experience",
  label: "Experience",
  description: "Your career, as an editorial timeline.",
  entity: "experience",
  cta: true,
});

export const testimonialsSection = listSection({
  type: "testimonials",
  label: "Testimonials",
  description: "What clients and colleagues say.",
  entity: "testimonials",
});

export const certificationsSection = listSection({
  type: "certifications",
  label: "Certifications",
  description: "Credentials, kept compact.",
  entity: "certifications",
});

export const blogSection = listSection({
  type: "blog",
  label: "Latest insights",
  description: "Recent articles from the blog.",
  entity: "blogPosts",
  limit: [3, 4, 4],
  cta: true,
});

// --------------------------------------------------------------- process
export const processSection = defineSection({
  type: "process",
  label: "Process",
  description: "How you work, step by step.",
  content: z.object({
    ...sectionHeaderSchema,
    steps: z
      .array(
        z.object({
          id: itemId,
          title: requiredText(32, "Enter a title."),
          description: requiredText(200, "Enter a short description."),
          detail: optionalText(40),
        }),
      )
      .max(6, "Up to 6 steps.")
      .default([]),
  }),
  config: z.object({}),
  fields: [
    { title: "Heading", fields: headerFields() },
    {
      title: "Steps",
      fields: [
        {
          kind: "list",
          name: "steps",
          label: "Steps",
          max: 6,
          itemLabel: "step",
          titleField: "title",
          newItem: { title: "", description: "", detail: "" },
          fields: [
            { kind: "text", name: "title", label: "Title", max: 32, half: true },
            { kind: "text", name: "detail", label: "Timing or output", max: 40, half: true, placeholder: "e.g. Week 1" },
            { kind: "text", name: "description", label: "Description", max: 200, rows: 2 },
          ],
        },
      ],
    },
  ],
});

// ------------------------------------------------------------- final CTA
export const finalCtaSection = defineSection({
  type: "finalCta",
  label: "Final call to action",
  description: "The closing invitation to get in touch.",
  content: z.object({
    label: optionalText(40),
    heading: optionalText(100),
    highlight: optionalText(40),
    description: optionalText(240),
    primaryCta: ctaSchema.default(CTA_DEFAULT),
    secondaryCta: ctaSchema.default(CTA_DEFAULT),
    note: optionalText(80),
    showEmail: z.boolean().default(true),
  }),
  config: z.object({}),
  fields: [
    {
      title: "Message",
      fields: [
        { kind: "text", name: "label", label: "Label", max: 40, half: true },
        { kind: "text", name: "heading", label: "Heading", max: 100, rows: 2 },
        { kind: "text", name: "highlight", label: "Highlighted words", max: 40 },
        { kind: "text", name: "description", label: "Description", max: 240, rows: 2 },
      ],
    },
    {
      title: "Actions",
      fields: [
        ctaField("primaryCta", "Primary button"),
        ctaField("secondaryCta", "Secondary link"),
        { kind: "text", name: "note", label: "Note", max: 80, placeholder: "e.g. Replies within one business day" },
        { kind: "boolean", name: "showEmail", label: "Show contact email", hint: "From Settings → General." },
      ],
    },
  ],
});

export type BrandsContent = z.infer<typeof brandsSection.content>;
export type ResultsContent = z.infer<typeof resultsSection.content>;
export type AboutContent = z.infer<typeof aboutSection.content>;
export type ListSectionContent = z.infer<typeof servicesSection.content>;
export type ProcessContent = z.infer<typeof processSection.content>;
export type FinalCtaContent = z.infer<typeof finalCtaSection.content>;
