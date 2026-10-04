import { heroSection } from "@/sections/hero/definition";
import type { AnySectionDefinition } from "./define";

/**
 * Every section type the application provides. To add one: create
 * src/sections/<type>/definition.ts with `defineSection(...)` (content and
 * config schemas, every field with a default), register it here, list it on
 * a page in src/config/pages.ts, and add its component to the public
 * renderer and its editor to the admin editor map.
 */
export const sectionRegistry: Record<string, AnySectionDefinition> = {
  [heroSection.type]: heroSection as unknown as AnySectionDefinition,
};

export function getSectionDefinition(type: string): AnySectionDefinition | undefined {
  return Object.hasOwn(sectionRegistry, type) ? sectionRegistry[type] : undefined;
}
