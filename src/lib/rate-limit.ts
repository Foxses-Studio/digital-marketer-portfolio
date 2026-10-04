import "server-only";
import { createHash } from "node:crypto";
import { collection } from "@/db";
import { isDuplicateKeyError } from "@/lib/errors";

/**
 * Fixed-window rate limiter backed by MongoDB, so limits hold across
 * server instances. Keys are hashed before storage (they contain IPs and
 * emails).
 */
type Bucket = { key: string; limit: number; windowSeconds: number };

function id(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

/** True if any bucket has reached its limit in the current window. */
export async function isRateLimited(buckets: Bucket[]): Promise<boolean> {
  const rateLimits = await collection("rateLimits");
  const docs = await rateLimits
    .find({
      _id: { $in: buckets.map((b) => id(b.key)) },
      expiresAt: { $gt: new Date() },
    })
    .toArray();
  return buckets.some((bucket) => {
    const doc = docs.find((d) => d._id === id(bucket.key));
    return doc !== undefined && doc.count >= bucket.limit;
  });
}

/** Records one hit in each bucket. */
export async function recordHit(buckets: Bucket[]) {
  const rateLimits = await collection("rateLimits");
  const now = new Date();
  for (const bucket of buckets) {
    const _id = id(bucket.key);
    // Start a new window if the previous one has expired.
    await rateLimits.deleteOne({ _id, expiresAt: { $lte: now } });
    const increment = () =>
      rateLimits.updateOne(
        { _id },
        {
          $inc: { count: 1 },
          $setOnInsert: {
            expiresAt: new Date(now.getTime() + bucket.windowSeconds * 1000),
          },
        },
        { upsert: true },
      );
    // Two concurrent upserts can collide on insert; the retry then updates.
    await increment().catch((error) => {
      if (isDuplicateKeyError(error)) return increment();
      throw error;
    });
  }
}

export async function resetBuckets(keys: string[]) {
  const rateLimits = await collection("rateLimits");
  await rateLimits.deleteMany({ _id: { $in: keys.map(id) } });
}
