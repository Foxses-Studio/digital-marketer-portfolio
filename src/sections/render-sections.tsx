import type { ReactNode } from "react";
import type { ResolvedSection } from "@/lib/cms/pages";
import type { HeroContent } from "./hero/definition";
import { HeroSection } from "./hero/hero-section";

/**
 * Maps CMS section types to their public components. Content was already
 * validated against each section's schema by getPublicPage().
 */
const components: Record<string, (section: ResolvedSection) => ReactNode> = {
  hero: (section) => <HeroSection key={section.id} content={section.content as HeroContent} />,
};

export function RenderSections({ sections }: { sections: ResolvedSection[] }) {
  return sections.map((section) => components[section.type]?.(section) ?? null);
}
