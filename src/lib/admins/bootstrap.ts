import "server-only";
import { collection } from "@/db";
import { BOOTSTRAP_MARKER, type UserDocument } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { ConflictError, isDuplicateKeyError } from "@/lib/errors";

/**
 * First-installation setup. The app has no public registration: while the
 * database has zero accounts, /admin/login offers to create the first
 * Super Admin; after that, accounts are created only inside the admin
 * panel by a Super Admin.
 */

export const SETUP_CLOSED_MESSAGE =
  "Setup is already complete. Sign in with an existing account.";

/** Whether any admin account exists. Always reads the database. */
export async function hasAnyAdmin(): Promise<boolean> {
  const users = await collection("users");
  return (await users.countDocuments({}, { limit: 1 })) > 0;
}

/**
 * Creates the first Super Admin, safely under concurrency:
 * 1. Rejects if any account exists (checked again after the slow hash).
 * 2. Inserts the account with the `bootstrap` marker. A unique index on
 *    that field means only one insert can ever succeed: if two requests
 *    pass the checks at the same moment, the second insert fails with a
 *    duplicate-key error and is rejected.
 * The role is always SUPER_ADMIN; it is never taken from the request.
 */
export async function createFirstSuperAdmin(input: {
  name: string;
  email: string;
  password: string;
}): Promise<UserDocument> {
  const users = await collection("users");

  // Guarantee the guard index exists before relying on it.
  await users.createIndex(
    { bootstrap: 1 },
    { name: "bootstrap_unique", unique: true, sparse: true },
  );

  if (await hasAnyAdmin()) throw new ConflictError(SETUP_CLOSED_MESSAGE);
  const passwordHash = await hashPassword(input.password);
  if (await hasAnyAdmin()) throw new ConflictError(SETUP_CLOSED_MESSAGE);

  const now = new Date();
  const user: Omit<UserDocument, "_id"> = {
    name: input.name,
    email: input.email,
    passwordHash,
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    avatarMediaId: null,
    bootstrap: BOOTSTRAP_MARKER,
    createdBy: null,
    lastLoginAt: now,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const { insertedId } = await users.insertOne(user as UserDocument);
    return { ...user, _id: insertedId };
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new ConflictError(SETUP_CLOSED_MESSAGE);
    throw error;
  }
}
