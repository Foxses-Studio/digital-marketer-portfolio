import "server-only";
import { MongoClient, type Collection, type Db } from "mongodb";
import { env } from "@/lib/env";
import { ensureIndexes } from "./indexes";
import type { Collections } from "./schema";

/*
 * One MongoClient (and connection pool) per server process. In development
 * it is kept on globalThis so hot reloads don't open new connections.
 * Indexes are ensured once per process, right after connecting.
 */
const globalForMongo = globalThis as unknown as {
  mongoDb?: Promise<Db>;
};

async function connect(): Promise<Db> {
  const { MONGODB_URI, MONGODB_DB } = env();
  const client = await new MongoClient(MONGODB_URI, {
    appName: "digital-marketer-portfolio",
  }).connect();
  const db = client.db(MONGODB_DB);
  await ensureIndexes(db);
  return db;
}

export function getDb(): Promise<Db> {
  if (!globalForMongo.mongoDb) {
    globalForMongo.mongoDb = connect().catch((error) => {
      // Allow a retry on the next request instead of caching the failure.
      globalForMongo.mongoDb = undefined;
      throw error;
    });
  }
  return globalForMongo.mongoDb;
}

/** Typed access to a collection, e.g. `await collection("users")`. */
export async function collection<Name extends keyof Collections>(
  name: Name,
): Promise<Collection<Collections[Name]>> {
  return (await getDb()).collection<Collections[Name]>(name);
}
