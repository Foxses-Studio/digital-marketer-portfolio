import { z } from "zod";
import { defineSection } from "@/lib/cms/sections/define";
import { METRIC_VALUE_PATTERN } from "@/lib/metrics";
import { linkUrlSchema, mediaIdSchema } from "@/validation/cms";

/**
 * Hero: CMS content schema. The design (layout, type, motion) lives in
 * hero-section.tsx; everything here is editable in Admin → Pages → Home.
 */

export const HERO_METRIC_LIMIT = 4;
export const HERO_CHANNEL_LIMIT = 4;
export const HERO_CHART_MAX_POINTS = 12;

const text = (max: number) =>
  z.string().trim().max(max, `Keep this under ${max} characters.`).default("");

const heroCtaSchema = z
  .object({
    enabled: z.boolean().default(false),
    label: text(32),
    url: linkUrlSchema.default(""),
  })
  .superRefine((cta, ctx) => {
    if (!cta.enabled) return;
    if (!cta.label) ctx.addIssue({ code: "custom", path: ["label"], message: "Enter the button label." });
    if (!cta.url) ctx.addIssue({ code: "custom", path: ["url"], message: "Enter the button link." });
  });

export const heroMetricSchema = z.object({
  id: z.uuid(),
  label: z.string().trim().min(1, "Enter a label.").max(32, "Keep labels under 32 characters."),
  prefix: z
    .string()
    .trim()
    .max(3, "Up to 3 characters.")
    .regex(/^[^\d]*$/, "No numbers in the prefix.")
    .default(""),
  value: z
    .string()
    .trim()
    .regex(METRIC_VALUE_PATTERN, "Use a number like 4.8, 1200 or 98.5 (no commas)."),
  suffix: z
    .string()
    .trim()
    .max(4, "Up to 4 characters.")
    .regex(/^[^\d]*$/, "No numbers in the suffix.")
    .default(""),
  enabled: z.boolean().default(true),
});

export const heroContentSchema = z
  .object({
    eyebrow: text(60),
    heading: text(140),
    /** A phrase from the heading to emphasize. Ignored if not found in it. */
    highlight: text(60),
    description: text(280),
    primaryCta: heroCtaSchema.default({ enabled: false, label: "", url: "" }),
    secondaryCta: heroCtaSchema.default({ enabled: false, label: "", url: "" }),
    imageMediaId: mediaIdSchema.nullable().default(null),
    imageAlt: text(160),
    availability: z
      .object({ enabled: z.boolean().default(false), text: text(60) })
      .superRefine((value, ctx) => {
        if (value.enabled && !value.text) {
          ctx.addIssue({ code: "custom", path: ["text"], message: "Enter the availability text." });
        }
      })
      .default({ enabled: false, text: "" }),
    /** Up to 3 short proof points under the buttons, e.g. "9 yrs" / "in paid media". */
    facts: z
      .array(
        z.object({
          id: z.uuid(),
          value: z.string().trim().min(1, "Enter a value.").max(12, "Keep values short."),
          label: z.string().trim().min(1, "Enter a label.").max(32, "Keep labels under 32 characters."),
        }),
      )
      .max(3, "Up to 3 facts.")
      .default([]),
    /** Small caption on the performance visual, e.g. "Campaign performance". */
    visualLabel: text(40),
    /** Live-status line on the visual, e.g. "Scaling". Empty hides it. */
    status: text(24),
    /**
     * The performance graph. Values are plotted in order (e.g. monthly
     * revenue); growth is calculated from the first and last value.
     * Without values the graph shows a neutral illustrative curve.
     */
    chart: z
      .object({
        label: text(40),
        startLabel: text(12),
        endLabel: text(12),
        points: z
          .array(z.number().finite().min(0, "Values can't be negative.").max(1e12))
          .max(HERO_CHART_MAX_POINTS, `Up to ${HERO_CHART_MAX_POINTS} values.`)
          .default([]),
      })
      .superRefine((chart, ctx) => {
        if (chart.points.length === 1) {
          ctx.addIssue({ code: "custom", path: ["points"], message: "Add at least 2 values, or none." });
        }
        if (chart.points.length > 1 && chart.points[0] === 0) {
          ctx.addIssue({ code: "custom", path: ["points"], message: "The first value must be above 0 to calculate growth." });
        }
      })
      .default({ label: "", startLabel: "", endLabel: "", points: [] }),
    /** Channel names shown on the visual, e.g. "Google Ads". */
    channels: z
      .array(z.string().trim().min(1, "Enter a channel name.").max(20, "Keep channel names under 20 characters."))
      .max(HERO_CHANNEL_LIMIT, `Up to ${HERO_CHANNEL_LIMIT} channels.`)
      .default([]),
    /** Array order is display order; the first enabled metric is featured. */
    metrics: z
      .array(heroMetricSchema)
      .max(HERO_METRIC_LIMIT, `Up to ${HERO_METRIC_LIMIT} metrics keep the layout balanced.`)
      .default([]),
  })
  .superRefine((value, ctx) => {
    if (value.highlight && value.heading && !value.heading.includes(value.highlight)) {
      ctx.addIssue({ code: "custom", path: ["highlight"], message: "Use words that appear exactly in the heading." });
    }
  });

export type HeroContent = z.output<typeof heroContentSchema>;
export type HeroMetric = z.output<typeof heroMetricSchema>;

export const heroSection = defineSection({
  type: "hero",
  label: "Hero",
  description: "The first screen: who you are, what you do and the results you deliver.",
  content: heroContentSchema,
  config: z.object({}),
});
