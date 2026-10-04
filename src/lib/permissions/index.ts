/**
 * Role-based access control. Pure data and functions, safe to import on the
 * client for UI decisions (hiding a nav item). Real enforcement always
 * happens on the server through src/lib/auth/dal.ts, using the role stored
 * in the database, never a role sent by the browser.
 *
 * To add a role: add it to ROLES (highest privilege first), give it a
 * label, and list its permissions in ROLE_PERMISSIONS.
 */

export const ROLES = ["SUPER_ADMIN", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
};

export const PERMISSIONS = [
  "dashboard:view",
  "content:manage",
  "media:manage",
  "messages:manage",
  "seo:manage",
  "settings:manage",
  "admins:manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: PERMISSIONS,
  ADMIN: [
    "dashboard:view",
    "content:manage",
    "media:manage",
    "messages:manage",
    "seo:manage",
    "settings:manage",
  ],
};

export function isRole(value: unknown): value is Role {
  return ROLES.includes(value as Role);
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Lower number = more privileged. */
export function roleRank(role: Role): number {
  return ROLES.indexOf(role);
}

/**
 * Whether `actor` may give `target` role to someone. Requires permission to
 * manage admins, and nobody can grant a role above their own.
 */
export function canAssignRole(actor: Role, target: Role): boolean {
  return (
    hasPermission(actor, "admins:manage") && roleRank(target) >= roleRank(actor)
  );
}
