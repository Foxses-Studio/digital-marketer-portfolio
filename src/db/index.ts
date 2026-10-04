import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

function createClient() {
  const client = postgres(env().DATABASE_URL, { max: 10 });
  return drizzle({ client, schema, casing: "snake_case" });
}

type Database = ReturnType<typeof createClient>;

// Reuse one connection pool across hot reloads in development.
const globalForDb = globalThis as unknown as { db?: Database };

export const db: Database = globalForDb.db ?? createClient();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;

export { schema };
