import { randomUUID } from "node:crypto";
import type { PageDocument, SectionInstance } from "../../../src/db/schema";
import { PAGE_DEFINITIONS } from "../../../src/config/pages";
import { getSectionDefinition } from "../../../src/lib/cms/sections/registry";
import { DEMO_HERO } from "../demo-content";
import {
  DEMO_ABOUT,
  DEMO_BLOG_SECTION,
  DEMO_BRANDS,
  DEMO_CASE_STUDIES_SECTION,
  DEMO_CERTIFICATIONS_SECTION,
  DEMO_EXPERIENCE_SECTION,
  DEMO_FINAL_CTA,
  DEMO_HERO_EXTRAS,
  DEMO_PROCESS,
  DEMO_RESULTS,
  DEMO_SERVICES_SECTION,
  DEMO_TESTIMONIALS_SECTION,
  DEMO_TOOLS_SECTION,
} from "../demo-home";
import { applyUnit, type SeedContext } from "../ledger";

const DEMO_SECTIONS: Record<string, unknown> = {
  hero: { ...DEMO_HERO, ...DEMO_HERO_EXTRAS },
  brands: DEMO_BRANDS,
  results: DEMO_RESULTS,
  about: DEMO_ABOUT,
  services: DEMO_SERVICES_SECTION,
  caseStudies: DEMO_CASE_STUDIES_SECTION,
  process: DEMO_PROCESS,
  tools: DEMO_TOOLS_SECTION,
  experience: DEMO_EXPERIENCE_SECTION,
  testimonials: DEMO_TESTIMONIALS_SECTION,
  certifications: DEMO_CERTIFICATIONS_SECTION,
  blog: DEMO_BLOG_SECTION,
  finalCta: DEMO_FINAL_CTA,
};

const ORDER = PAGE_DEFINITIONS.home.sections;

/** Inserts a new section where it belongs in the default order. */
function insertInOrder(sections: SectionInstance[], section: SectionInstance) {
  const rank = ORDER.indexOf(section.type);
  const after = sections.findLastIndex((s) => ORDER.indexOf(s.type) !== -1 && ORDER.indexOf(s.type) < rank);
  sections.splice(after + 1, 0, section);
}

/**
 * Home page section content, one unit per section. Visibility and order
 * are left as the admin set them; new sections are added in default order.
 */
export async function seedHomeSections(ctx: SeedContext) {
  const pages = ctx.db.collection<PageDocument>("pages");

  for (const type of ORDER) {
    const demo = DEMO_SECTIONS[type];
    const definition = getSectionDefinition(type);
    if (!demo || !definition) continue;
    const next = definition.content.parse(demo) as Record<string, unknown>;
    const doc = await pages.findOne({ key: "home" });
    const section = doc?.sections?.find((s) => s.type === type);

    await applyUnit(ctx, {
      key: `page:home:${type}`,
      current: section?.content,
      next,
      write: async (content) => {
        const now = new Date();
        const page = await pages.findOne({ key: "home" });
        const fresh: SectionInstance = { id: randomUUID(), type, enabled: true, content, config: {} };
        if (!page) {
          await pages.insertOne({
            key: "home",
            title: PAGE_DEFINITIONS.home.title,
            seo: {},
            sections: [fresh],
            updatedBy: null,
            createdAt: now,
            updatedAt: now,
          } as PageDocument);
          return;
        }
        const sections: SectionInstance[] = page.sections ?? [];
        const index = sections.findIndex((s) => s.type === type);
        if (index >= 0) sections[index] = { ...sections[index]!, content };
        else insertInOrder(sections, fresh);
        await pages.updateOne({ _id: page._id }, { $set: { sections, updatedAt: now } });
      },
    });
  }
}
