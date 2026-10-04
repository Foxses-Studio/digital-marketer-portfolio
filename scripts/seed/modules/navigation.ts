import type { SettingsDocument } from "../../../src/db/schema";
import { NAV_ITEM_LIMIT, settingsSchemas, type NavItem, type Settings } from "../../../src/validation/settings";
import { DEMO_HEADER, DEMO_NAV_ITEMS } from "../demo-content";
import { applyUnit, type SeedContext } from "../ledger";

/**
 * Header menu and CTA. Each menu item is its own unit (matched by id), so
 * items an admin added, edited or deleted are left as they are.
 */
export async function seedNavigation(ctx: SeedContext) {
  const settings = ctx.db.collection<SettingsDocument>("settings");

  const load = async () => {
    const doc = await settings.findOne({ _id: "navigation" });
    return doc ? (doc.value as Settings<"navigation">) : null;
  };
  const save = async (value: Settings<"navigation">) => {
    const parsed = settingsSchemas.navigation.parse(value);
    const now = new Date();
    await settings.updateOne(
      { _id: "navigation" },
      { $set: { value: parsed, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );
  };
  const base = async () => (await load()) ?? { ...settingsSchemas.navigation.parse({}), items: [] };

  const header = settingsSchemas.navigation.parse({ ...DEMO_HEADER, items: [] });
  const stored = await load();
  await applyUnit(ctx, {
    key: "settings:navigation:header",
    current: stored ? { cta: stored.cta, sticky: stored.sticky, hideOnScroll: stored.hideOnScroll } : undefined,
    next: { cta: header.cta, sticky: header.sticky, hideOnScroll: header.hideOnScroll },
    write: async (value) => save({ ...(await base()), ...value }),
  });

  for (const demo of DEMO_NAV_ITEMS) {
    const item = settingsSchemas.navigation.shape.items.parse([demo])[0] as NavItem;
    const current = (await load())?.items.find((existing) => existing.id === item.id);
    await applyUnit(ctx, {
      key: `navigation:item:${item.id}`,
      current,
      next: item,
      write: async (value) => {
        const navigation = await base();
        const index = navigation.items.findIndex((existing) => existing.id === value.id);
        if (index >= 0) navigation.items[index] = value;
        else if (navigation.items.length < NAV_ITEM_LIMIT) navigation.items.push(value);
        else throw new Error(`Menu is full (${NAV_ITEM_LIMIT} items); not adding "${value.label}".`);
        await save(navigation);
      },
    });
  }
}
