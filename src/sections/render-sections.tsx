import type { ReactNode } from "react";
import type { ResolvedSection } from "@/lib/cms/pages";
import type { AboutContent, BrandsContent, FinalCtaContent, ListSectionContent, ProcessContent, ResultsContent } from "./defs";
import type { HeroContent } from "./hero/definition";
import { HeroSection } from "./hero/hero-section";
import { AboutSection } from "./home/about-section";
import { BlogSection } from "./home/blog-section";
import { BrandsSection } from "./home/brands-section";
import { CaseStudiesSection } from "./home/case-studies-section";
import { CertificationsSection } from "./home/certifications-section";
import { ExperienceSection } from "./home/experience-section";
import { FinalCtaSection } from "./home/final-cta-section";
import { ProcessSection } from "./home/process-section";
import { ResultsSection } from "./home/results-section";
import { ServicesSection } from "./home/services-section";
import { TestimonialsSection } from "./home/testimonials-section";
import { ToolsSection } from "./home/tools-section";

type Render = (section: ResolvedSection, index: number) => ReactNode;

/**
 * Maps CMS section types to their public components. Content was already
 * validated against each section's schema by getPublicPage().
 */
const components: Record<string, Render> = {
  hero: (s) => <HeroSection key={s.id} content={s.content as HeroContent} />,
  brands: (s) => <BrandsSection key={s.id} id={s.id} content={s.content as BrandsContent} />,
  results: (s, i) => <ResultsSection key={s.id} id={s.id} index={i} content={s.content as ResultsContent} />,
  about: (s, i) => <AboutSection key={s.id} id={s.id} index={i} content={s.content as AboutContent} />,
  services: (s, i) => <ServicesSection key={s.id} id={s.id} index={i} content={s.content as ListSectionContent} />,
  caseStudies: (s, i) => <CaseStudiesSection key={s.id} id={s.id} index={i} content={s.content as ListSectionContent} />,
  process: (s, i) => <ProcessSection key={s.id} id={s.id} index={i} content={s.content as ProcessContent} />,
  tools: (s, i) => <ToolsSection key={s.id} id={s.id} index={i} content={s.content as ListSectionContent} />,
  experience: (s, i) => <ExperienceSection key={s.id} id={s.id} index={i} content={s.content as ListSectionContent} />,
  testimonials: (s, i) => <TestimonialsSection key={s.id} id={s.id} index={i} content={s.content as ListSectionContent} />,
  certifications: (s, i) => <CertificationsSection key={s.id} id={s.id} index={i} content={s.content as ListSectionContent} />,
  blog: (s, i) => <BlogSection key={s.id} id={s.id} index={i} content={s.content as ListSectionContent} />,
  finalCta: (s) => <FinalCtaSection key={s.id} id={s.id} content={s.content as FinalCtaContent} />,
};

/** Sections without a numbered intro. */
const UNNUMBERED = new Set(["hero", "brands", "finalCta"]);

export function RenderSections({ sections }: { sections: ResolvedSection[] }) {
  let chapter = 0;
  return sections.map((section) => {
    const render = components[section.type];
    if (!render) return null;
    const index = UNNUMBERED.has(section.type) ? 0 : ++chapter;
    return render(section, index);
  });
}
