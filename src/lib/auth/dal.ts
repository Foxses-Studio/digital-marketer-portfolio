import "server-only";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { cache } from "react";
import { routes } from "@/config/routes";
import { collection } from "@/db";
import { readSession } from "./session";

/**
 * Data Access Layer for authentication. The proxy only does an optimistic
 * cookie check; every admin page, Server Action and Route Handler must call
 * `requireAdmin()` (or `getCurrentAdmin()`) close to the data it touches.
 */

export type CurrentAdmin = { id: string; name: string; email: string };

/** The signed-in admin, or null. Deduplicated per request. */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const session = await readSession();
  if (!session) return null;

  if (!ObjectId.isValid(session.userId)) return null;

  const users = await collection("users");
  const user = await users.findOne(
    { _id: new ObjectId(session.userId) },
    { projection: { name: 1, email: 1 } },
  );

  return user
    ? { id: user._id.toHexString(), name: user.name, email: user.email }
    : null;
});

/** Returns the signed-in admin or redirects to the login page. */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(routes.admin.login);
  return admin;
}
