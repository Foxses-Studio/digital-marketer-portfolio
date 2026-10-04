/**
 * Creates (or resets the password of) an admin account.
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... npm run admin:create
 *
 * Values can also come from .env.local. Runs outside Next.js, so it opens
 * its own connection instead of importing src/db.
 */
import { loadEnvConfig } from "@next/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../src/db/schema/users";
import { hashPassword } from "../src/lib/auth/password";

loadEnvConfig(process.cwd());

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set.");
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");

  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle({ client });
  const passwordHash = await hashPassword(password);

  await db
    .insert(users)
    .values({ email, name, passwordHash })
    .onConflictDoUpdate({ target: users.email, set: { name, passwordHash, updatedAt: new Date() } });

  console.log(`Admin account ready: ${email}`);
  await client.end();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
