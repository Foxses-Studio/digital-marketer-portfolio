import type { ObjectId } from "mongodb";
import type { CollectionIndexes } from "./types";

/**
 * Server-side admin sessions. The browser holds a random token; only its
 * SHA-256 hash is stored here, so a database leak doesn't expose usable
 * session tokens. Deleting a document signs that session out.
 */
export type SessionDocument = {
  /** SHA-256 hash (hex) of the session token. */
  _id: string;
  userId: ObjectId;
  expiresAt: Date;
  createdAt: Date;
  userAgent: string | null;
};

export const sessionsIndexes: CollectionIndexes = [
  { key: { userId: 1 }, name: "user" },
  // Cleanup only; expiry is also checked on every read.
  { key: { expiresAt: 1 }, name: "expires_ttl", expireAfterSeconds: 0 },
];
