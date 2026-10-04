import type { CollectionIndexes } from "./types";

/** Fixed-window counters for rate limiting (login attempts, ...). */
export type RateLimitDocument = {
  /** Hashed bucket key, e.g. sha256("login:account:<ip>|<email>"). */
  _id: string;
  count: number;
  expiresAt: Date;
};

export const rateLimitsIndexes: CollectionIndexes = [
  { key: { expiresAt: 1 }, name: "expires_ttl", expireAfterSeconds: 0 },
];
