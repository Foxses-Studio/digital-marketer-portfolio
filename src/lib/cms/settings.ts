import "server-only";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db, schema } from "@/db";
import {
  settingsSchemas,
  type Settings,
  type SettingsGroup,
} from "@/validation/settings";
import { cacheTags } from "./cache-tags";

/**
 * Reads one settings group. Cached until an admin saves the group
 * (see src/actions/settings.ts), and always returns a complete object:
 * missing or invalid stored values fall back to schema defaults.
 */
export async function getSettings<G extends SettingsGroup>(
  group: G,
): Promise<Settings<G>> {
  "use cache";
  cacheTag(cacheTags.settings(group));
  cacheLife("max");

  const [row] = await db
    .select({ value: schema.settings.value })
    .from(schema.settings)
    .where(eq(schema.settings.key, group))
    .limit(1);

  const parsed = settingsSchemas[group].safeParse(row?.value ?? {});
  if (parsed.success) return parsed.data as Settings<G>;

  console.error(`Stored settings "${group}" are invalid; using defaults.`);
  return settingsSchemas[group].parse({}) as Settings<G>;
}

export async function saveSettings<G extends SettingsGroup>(
  group: G,
  value: Settings<G>,
) {
  await db
    .insert(schema.settings)
    .values({ key: group, value })
    .onConflictDoUpdate({
      target: schema.settings.key,
      set: { value, updatedAt: new Date() },
    });
}
