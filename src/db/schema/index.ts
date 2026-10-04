import { mediaIndexes, type MediaDocument } from "./media";
import { pagesIndexes, type PageDocument } from "./pages";
import { rateLimitsIndexes, type RateLimitDocument } from "./rate-limits";
import { seedLedgerIndexes, type SeedLedgerDocument } from "./seed-ledger";
import { sessionsIndexes, type SessionDocument } from "./sessions";
import { settingsIndexes, type SettingsDocument } from "./settings";
import type { CollectionIndexes } from "./types";
import { usersIndexes, type UserDocument } from "./users";

/**
 * Every MongoDB collection the app uses: its name, document type and
 * indexes. Add an entry here as each feature is built. Indexes are created
 * automatically on first connection and by `npm run db:setup`.
 *
 * Conventions:
 * - `_id` is an ObjectId (a string only where a natural key exists).
 *   Ids leave the data layer as hex strings.
 * - Every document has `createdAt` / `updatedAt` dates.
 * - Documents are validated with Zod before they are written.
 */
export type Collections = {
  users: UserDocument;
  sessions: SessionDocument;
  rateLimits: RateLimitDocument;
  settings: SettingsDocument;
  media: MediaDocument;
  pages: PageDocument;
  seedLedger: SeedLedgerDocument;
};

export const collectionIndexes: Record<keyof Collections, CollectionIndexes> = {
  users: usersIndexes,
  sessions: sessionsIndexes,
  rateLimits: rateLimitsIndexes,
  settings: settingsIndexes,
  media: mediaIndexes,
  pages: pagesIndexes,
  seedLedger: seedLedgerIndexes,
};

export type {
  MediaDocument,
  PageDocument,
  RateLimitDocument,
  SeedLedgerDocument,
  SessionDocument,
  SettingsDocument,
  UserDocument,
};
export type { SectionInstance } from "./pages";
export { BOOTSTRAP_MARKER, USER_STATUSES, type UserStatus } from "./users";
