import type { ObjectId } from "mongodb";
import type { Role } from "@/lib/permissions";
import type { CollectionIndexes } from "./types";

export const USER_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

/** Marker stored only on the account created by the first-install setup. */
export const BOOTSTRAP_MARKER = "first-super-admin";

/** Admin accounts that can sign in to the CMS. */
export type UserDocument = {
  _id: ObjectId;
  name: string;
  /** Lowercased and trimmed. */
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  avatarMediaId: ObjectId | null;
  /**
   * Present only on the first Super Admin. A unique index on this field
   * guarantees the setup flow can create at most one account, even when
   * two setup requests race each other.
   */
  bootstrap?: typeof BOOTSTRAP_MARKER;
  createdBy: ObjectId | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export const usersIndexes: CollectionIndexes = [
  { key: { email: 1 }, name: "email_unique", unique: true },
  { key: { bootstrap: 1 }, name: "bootstrap_unique", unique: true, sparse: true },
];
