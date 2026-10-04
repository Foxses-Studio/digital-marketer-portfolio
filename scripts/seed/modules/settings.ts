import type { SettingsDocument } from "../../../src/db/schema";
import { settingsSchemas, type SettingsGroup } from "../../../src/validation/settings";
import { DEMO_IDENTITY, DEMO_SEO, DEMO_SOCIAL } from "../demo-content";
import { DEMO_FOOTER } from "../demo-home";
import { applyUnit, type SeedContext } from "../ledger";

/** Global settings groups: General, Social, SEO, Footer. */
export async function seedSettings(ctx: SeedContext) {
  const groups: Array<[SettingsGroup, unknown]> = [
    ["site", DEMO_IDENTITY],
    ["social", DEMO_SOCIAL],
    ["seo", DEMO_SEO],
    ["footer", DEMO_FOOTER],
  ];
  const settings = ctx.db.collection<SettingsDocument>("settings");

  for (const [group, demo] of groups) {
    // Store exactly what the admin form would store, so an unchanged
    // re-save in the admin keeps the content recognizably "untouched".
    const next = settingsSchemas[group].parse(demo);
    const doc = await settings.findOne({ _id: group });
    await applyUnit(ctx, {
      key: `settings:${group}`,
      current: doc?.value,
      next,
      write: async (value) => {
        const now = new Date();
        await settings.updateOne(
          { _id: group },
          { $set: { value, updatedAt: now }, $setOnInsert: { createdAt: now } },
          { upsert: true },
        );
      },
    });
  }
}
