import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { collection } from "@/db";
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

  const settings = await collection("settings");
  const doc = await settings.findOne(
    { _id: group },
    { projection: { value: 1 } },
  );

  const parsed = settingsSchemas[group].safeParse(doc?.value ?? {});
  if (parsed.success) return parsed.data as Settings<G>;

  console.error(`Stored settings "${group}" are invalid; using defaults.`);
  return settingsSchemas[group].parse({}) as Settings<G>;
}

export async function saveSettings<G extends SettingsGroup>(
  group: G,
  value: Settings<G>,
) {
  const settings = await collection("settings");
  const now = new Date();
  await settings.updateOne(
    { _id: group },
    { $set: { value, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true },
  );
}
