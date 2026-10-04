import { loadEnvConfig } from "@next/env";
import { MongoClient } from "mongodb";

/**
 * Shared setup for CLI scripts. Scripts run outside Next.js, so they load
 * .env files themselves and open their own MongoDB connection.
 */
loadEnvConfig(process.cwd());

export async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set (add it to .env.local).");
  const client = await new MongoClient(uri).connect();
  return { client, db: client.db(process.env.MONGODB_DB || "portfolio") };
}
