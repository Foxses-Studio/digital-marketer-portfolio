import {
  aboutSection,
  blogSection,
  brandsSection,
  caseStudiesSection,
  certificationsSection,
  experienceSection,
  finalCtaSection,
  processSection,
  resultsSection,
  servicesSection,
  testimonialsSection,
  toolsSection,
} from "@/sections/defs";
import { heroSection } from "@/sections/hero/definition";
import type { AnySectionDefinition } from "./define";

/**
 * Every section type the application provides. To add one: define it
 * (content schema with defaults, editor fields, optional collection),
 * register it here, list it on a page in src/config/pages.ts, add its
 * public component to src/sections/render-sections.tsx and its demo
 * content to the seed.
 */
const sections = [
  heroSection,
  brandsSection,
  resultsSection,
  aboutSection,
  servicesSection,
  caseStudiesSection,
  processSection,
  toolsSection,
  experienceSection,
  testimonialsSection,
  certificationsSection,
  blogSection,
  finalCtaSection,
];

export const sectionRegistry: Record<string, AnySectionDefinition> = Object.fromEntries(
  sections.map((section) => [section.type, section as unknown as AnySectionDefinition]),
);

export function getSectionDefinition(type: string): AnySectionDefinition | undefined {
  return Object.hasOwn(sectionRegistry, type) ? sectionRegistry[type] : undefined;
}
