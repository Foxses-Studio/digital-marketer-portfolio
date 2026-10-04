import { randomUUID } from "node:crypto";
import type { PageDocument, SectionInstance } from "../../../src/db/schema";
import { PAGE_DEFINITIONS } from "../../../src/config/pages";
import { heroContentSchema } from "../../../src/sections/hero/definition";
import { DEMO_HERO } from "../demo-content";
import { applyUnit, type SeedContext } from "../ledger";

/** Home page → Hero section content (visibility is left as the admin set it). */
export async function seedHomeHero(ctx: SeedContext) {
  const pages = ctx.db.collection<PageDocument>("pages");
  const next = heroContentSchema.parse(DEMO_HERO) as Record<string, unknown>;
  const doc = await pages.findOne({ key: "home" });
  const section = doc?.sections?.find((s) => s.type === "hero");

  await applyUnit(ctx, {
    key: "page:home:hero",
    current: section?.content,
    next,
    write: async (content) => {
      const now = new Date();
      const page = await pages.findOne({ key: "home" });
      if (!page) {
        await pages.insertOne({
          key: "home",
          title: PAGE_DEFINITIONS.home.title,
          seo: {},
          sections: [{ id: randomUUID(), type: "hero", enabled: true, content, config: {} }],
          updatedBy: null,
          createdAt: now,
          updatedAt: now,
        } as PageDocument);
        return;
      }
      const sections: SectionInstance[] = page.sections ?? [];
      const index = sections.findIndex((s) => s.type === "hero");
      if (index >= 0) sections[index] = { ...sections[index]!, content };
      else sections.unshift({ id: randomUUID(), type: "hero", enabled: true, content, config: {} });
      await pages.updateOne({ _id: page._id }, { $set: { sections, updatedAt: now } });
    },
  });
}
