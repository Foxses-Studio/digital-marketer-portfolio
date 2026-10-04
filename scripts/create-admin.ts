/**
 * Creates (or resets the password of) an admin account.
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... npm run admin:create
 *
 * Values can also come from .env.local.
 */
import { connect } from "./env";
import type { UserDocument } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth/password";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");

  const passwordHash = await hashPassword(password);
  const { client, db } = await connect();
  try {
    const now = new Date();
    await db.collection<UserDocument>("users").updateOne(
      { email },
      {
        $set: { name, passwordHash, updatedAt: now },
        $setOnInsert: { email, lastLoginAt: null, createdAt: now },
      },
      { upsert: true },
    );
    console.log(`Admin account ready: ${email}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
