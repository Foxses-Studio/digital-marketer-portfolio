import type { CollectionIndexes } from "./types";

/**
 * Global site settings stored as one document per group ("site", "seo",
 * later "contact", "social", ...), keyed by the group name. The shape of
 * `value` is defined and validated by Zod in src/validation/settings.ts.
 */
export type SettingsDocument = {
  _id: string;
  value: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export const settingsIndexes: CollectionIndexes = [];
