/**
 * Creates the collections' indexes defined in src/db/schema. Safe to run
 * repeatedly; run it after adding a collection or index.
 *
 *   npm run db:setup
 */
import { connect } from "./env";
import { collectionIndexes } from "../src/db/schema";

async function main() {
  const { client, db } = await connect();
  try {
    for (const [name, indexes] of Object.entries(collectionIndexes)) {
      const existing = await db.listCollections({ name }).hasNext();
      if (!existing) await db.createCollection(name);
      if (indexes.length > 0) await db.collection(name).createIndexes(indexes);
      console.log(`✓ ${name} (${indexes.length} index${indexes.length === 1 ? "" : "es"})`);
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
