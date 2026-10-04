import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { routes } from "@/config/routes";
import { db, schema } from "@/db";
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

  const [user] = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
    })
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .limit(1);

  return user ?? null;
});

/** Returns the signed-in admin or redirects to the login page. */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(routes.admin.login);
  return admin;
}
