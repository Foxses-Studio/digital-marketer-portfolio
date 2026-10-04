import "server-only";
import { ObjectId } from "mongodb";
import { collection } from "@/db";
import type { UserDocument, UserStatus } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { revokeUserSessions } from "@/lib/auth/session";
import type { CurrentAdmin } from "@/lib/auth/dal";
import {
  AuthorizationError,
  ConflictError,
  isDuplicateKeyError,
  NotFoundError,
} from "@/lib/errors";
import { canAssignRole, type Role } from "@/lib/permissions";

/**
 * Administrator management. Callers must already have authorized the actor
 * with `authorize("admins:manage")`; these functions additionally enforce
 * the rules that depend on the target account:
 * - nobody can grant a role above their own,
 * - you can't change your own role or deactivate yourself,
 * - the last active Super Admin can't be demoted or deactivated.
 */

/** Safe-to-render admin record (no password hash). */
export type AdminListItem = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
};

function toListItem(user: UserDocument): AdminListItem {
  return {
    id: user._id.toHexString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function listAdmins(): Promise<AdminListItem[]> {
  const users = await collection("users");
  const docs = await users
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: 1 })
    .toArray();
  return docs.map((doc) => toListItem(doc as UserDocument));
}

export async function createAdmin(
  actor: CurrentAdmin,
  input: { name: string; email: string; role: Role; password: string },
) {
  if (!canAssignRole(actor.role, input.role)) throw new AuthorizationError();

  const now = new Date();
  const users = await collection("users");
  try {
    await users.insertOne({
      _id: new ObjectId(),
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: input.role,
      status: "ACTIVE",
      avatarMediaId: null,
      createdBy: new ObjectId(actor.id),
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ConflictError("An account with this email already exists.");
    }
    throw error;
  }
}

async function getTarget(id: string) {
  const users = await collection("users");
  const target = await users.findOne({ _id: new ObjectId(id) });
  if (!target) throw new NotFoundError("That administrator no longer exists.");
  return { users, target };
}

async function assertNotLastSuperAdmin(target: UserDocument) {
  if (target.role !== "SUPER_ADMIN" || target.status !== "ACTIVE") return;
  const users = await collection("users");
  const others = await users.countDocuments({
    _id: { $ne: target._id },
    role: "SUPER_ADMIN",
    status: "ACTIVE",
  });
  if (others === 0) {
    throw new ConflictError("There must always be at least one active Super Admin.");
  }
}

export async function updateAdminRole(actor: CurrentAdmin, id: string, role: Role) {
  if (id === actor.id) throw new AuthorizationError("You can't change your own role.");
  const { users, target } = await getTarget(id);
  // The actor must be allowed to grant the new role and to manage the
  // target's current role.
  if (!canAssignRole(actor.role, role) || !canAssignRole(actor.role, target.role)) {
    throw new AuthorizationError();
  }
  if (target.role === role) return;
  if (role !== "SUPER_ADMIN") await assertNotLastSuperAdmin(target);

  await users.updateOne(
    { _id: target._id },
    { $set: { role, updatedAt: new Date() } },
  );
}

export async function setAdminStatus(
  actor: CurrentAdmin,
  id: string,
  status: UserStatus,
) {
  if (id === actor.id) {
    throw new AuthorizationError("You can't change the status of your own account.");
  }
  const { users, target } = await getTarget(id);
  if (!canAssignRole(actor.role, target.role)) throw new AuthorizationError();
  if (target.status === status) return;
  if (status === "INACTIVE") await assertNotLastSuperAdmin(target);

  await users.updateOne(
    { _id: target._id },
    { $set: { status, updatedAt: new Date() } },
  );
  // Deactivation signs the account out everywhere immediately.
  if (status === "INACTIVE") await revokeUserSessions(target._id);
}
