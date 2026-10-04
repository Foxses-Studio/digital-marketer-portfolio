/**
 * Checks the MongoDB connection and creates every collection index.
 * Safe to run repeatedly. (The app also does this on first connection.)
 *
 *   npm run db:setup
 */
import { connect } from "./env";

async function main() {
  const { client, db } = await connect();
  try {
    const users = await db.collection("users").countDocuments();
    console.log(`Connected to "${db.databaseName}". Indexes are up to date.`);
    console.log(
      users === 0
        ? "No admin accounts yet: open /admin/login to create the Super Admin."
        : `${users} admin account(s) found.`,
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
