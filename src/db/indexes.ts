import type { Db } from "mongodb";
import { collectionIndexes } from "./schema";

/**
 * Creates every declared index. Idempotent. A failing index is reported but
 * doesn't stop the others (e.g. TTL indexes on servers that lack them);
 * correctness never depends on TTL cleanup.
 */
export async function ensureIndexes(db: Db, log: (message: string) => void = console.warn) {
  for (const [name, indexes] of Object.entries(collectionIndexes)) {
    for (const { key, ...options } of indexes) {
      try {
        await db.collection(name).createIndex(key, options);
      } catch (error) {
        log(`Could not create index ${name}.${options.name}: ${(error as Error).message}`);
      }
    }
  }
}
