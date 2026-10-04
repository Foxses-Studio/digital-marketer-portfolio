/**
 * Account recovery for the site owner, run on the server (requires
 * database access, so it is not a public registration path).
 * Resets the password of an existing account and makes sure it is active.
 * It never creates accounts: the first Super Admin is created at
 * /admin/login, and later admins in the admin panel.
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='new-password-123' npm run admin:recover
 */
import { hashPassword } from "../src/lib/auth/password";
import { passwordSchema } from "../src/validation/auth";
import { connect } from "./env";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email) throw new Error("ADMIN_EMAIL is required.");
  const check = passwordSchema.safeParse(password);
  if (!check.success) throw new Error(`ADMIN_PASSWORD: ${check.error.issues[0]?.message}`);

  const { client, db } = await connect();
  try {
    const users = db.collection("users");
    const user = await users.findOne({ email });
    if (!user) throw new Error(`No account with email ${email}.`);
    await users.updateOne(
      { _id: user._id },
      { $set: { passwordHash: await hashPassword(password), status: "ACTIVE", updatedAt: new Date() } },
    );
    // Sign the account out everywhere.
    await db.collection("sessions").deleteMany({ userId: user._id });
    console.log(`Password reset and account active: ${email}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
