import "server-only";
import { MongoClient, type Collection, type Db } from "mongodb";
import { env } from "@/lib/env";
import type { Collections } from "./schema";

/*
 * One MongoClient (and connection pool) per server process. In development
 * it is kept on globalThis so hot reloads don't open new connections.
 */
const globalForMongo = globalThis as unknown as {
  mongoClient?: Promise<MongoClient>;
};

function clientPromise(): Promise<MongoClient> {
  if (!globalForMongo.mongoClient) {
    const client = new MongoClient(env().MONGODB_URI, {
      appName: "digital-marketer-portfolio",
    });
    globalForMongo.mongoClient = client.connect().catch((error) => {
      // Allow a retry on the next request instead of caching the failure.
      globalForMongo.mongoClient = undefined;
      throw error;
    });
  }
  return globalForMongo.mongoClient;
}

export async function getDb(): Promise<Db> {
  return (await clientPromise()).db(env().MONGODB_DB);
}

/** Typed access to a collection, e.g. `await collection("users")`. */
export async function collection<Name extends keyof Collections>(
  name: Name,
): Promise<Collection<Collections[Name]>> {
  return (await getDb()).collection<Collections[Name]>(name);
}
