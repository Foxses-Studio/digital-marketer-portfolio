import { settingsIndexes, type SettingsDocument } from "./settings";
import type { CollectionIndexes } from "./types";
import { usersIndexes, type UserDocument } from "./users";

/**
 * Every MongoDB collection the app uses: its name, document type and
 * indexes. Add an entry here as each feature is built, then run
 * `npm run db:setup` to create the indexes.
 *
 * Conventions:
 * - `_id` is an ObjectId (string keys only where a natural key exists,
 *   like settings groups). The app exposes ids as hex strings.
 * - Every document has `createdAt` / `updatedAt` dates.
 * - Document shapes are validated with Zod before writing.
 */
export type Collections = {
  users: UserDocument;
  settings: SettingsDocument;
};

export const collectionIndexes: Record<keyof Collections, CollectionIndexes> = {
  users: usersIndexes,
  settings: settingsIndexes,
};

export type { SettingsDocument, UserDocument };
