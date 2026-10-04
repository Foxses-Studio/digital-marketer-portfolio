import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { routes } from "@/config/routes";
import { collection } from "@/db";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { hasPermission, type Permission, type Role } from "@/lib/permissions";
import { getSession } from "./session";

/**
 * Data Access Layer for authentication and authorization.
 *
 * The proxy only checks that a session cookie exists. Every admin page,
 * Server Action and Route Handler must authorize here, close to the data:
 * - pages:          requireAdmin() / requirePagePermission()
 * - actions/routes: authorize()
 *
 * The role always comes from the database record, never from the client.
 */

export type CurrentAdmin = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

/**
 * The signed-in, active admin, or null. Deduplicated per request.
 * An inactive account or an expired/revoked session counts as signed out.
 */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const session = await getSession();
  if (!session) return null;

  const users = await collection("users");
  const user = await users.findOne(
    { _id: session.userId, status: "ACTIVE" },
    { projection: { name: 1, email: 1, role: 1 } },
  );
  if (!user) return null;

  return {
    id: user._id.toHexString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
});

/** For pages and layouts: the admin, or a redirect to the login page. */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect(routes.admin.login);
  return admin;
}

/** For pages: the admin if allowed, otherwise the "access denied" page. */
export async function requirePagePermission(
  permission: Permission,
): Promise<CurrentAdmin> {
  const admin = await requireAdmin();
  if (!hasPermission(admin.role, permission)) redirect(routes.admin.forbidden);
  return admin;
}

/**
 * For Server Actions and Route Handlers: throws AuthenticationError or
 * AuthorizationError, which the action/route wrappers turn into safe
 * responses.
 */
export async function authorize(permission?: Permission): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new AuthenticationError();
  if (permission && !hasPermission(admin.role, permission)) {
    throw new AuthorizationError();
  }
  return admin;
}
