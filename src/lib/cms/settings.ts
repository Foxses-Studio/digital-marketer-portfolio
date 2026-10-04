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
 * Settings storage: one document per group in the `settings` collection.
 * Reads always return a complete object; missing or invalid stored values
 * fall back to the schema defaults field by field where possible.
 */

async function load<G extends SettingsGroup>(group: G): Promise<Settings<G>> {
  const settings = await collection("settings");
  const doc = await settings.findOne({ _id: group }, { projection: { value: 1 } });
  const schema = settingsSchemas[group];
  const stored = (doc?.value ?? {}) as Record<string, unknown>;

  const parsed = schema.safeParse(stored);
  if (parsed.success) return parsed.data as Settings<G>;

  // Keep the valid fields, reset only the invalid ones to defaults.
  const broken = new Set(parsed.error.issues.map((issue) => String(issue.path[0])));
  const repaired = Object.fromEntries(Object.entries(stored).filter(([key]) => !broken.has(key)));
  console.error(`Stored settings "${group}" had invalid fields: ${[...broken].join(", ")}`);
  const retry = schema.safeParse(repaired);
  return (retry.success ? retry.data : schema.parse({})) as Settings<G>;
}

/** Public, cached read. Refreshed when an admin saves the group. */
export async function getSettings<G extends SettingsGroup>(group: G): Promise<Settings<G>> {
  "use cache";
  cacheTag(cacheTags.settings(group));
  cacheLife("max");
  return load(group);
}

/** Uncached read for admin forms and read-modify-write updates. */
export function readSettings<G extends SettingsGroup>(group: G): Promise<Settings<G>> {
  return load(group);
}

export async function saveSettings<G extends SettingsGroup>(group: G, value: Settings<G>) {
  const settings = await collection("settings");
  const now = new Date();
  await settings.updateOne(
    { _id: group },
    { $set: { value, updatedAt: now }, $setOnInsert: { createdAt: now } },
    { upsert: true },
  );
}
