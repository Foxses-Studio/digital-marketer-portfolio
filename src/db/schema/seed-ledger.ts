import type { CollectionIndexes } from "./types";

/**
 * Development seed bookkeeping (see scripts/seed). One document per seeded
 * unit (a settings group, a menu item, a page section...). The hash is the
 * fingerprint of what the seed last wrote, so a re-run can tell untouched
 * demo content (safe to update) from content an admin has edited (kept).
 */
export type SeedLedgerDocument = {
  /** Stable unit key, e.g. "settings:site" or "navigation:item:<id>". */
  _id: string;
  hash: string;
  appliedAt: Date;
};

export const seedLedgerIndexes: CollectionIndexes = [];
