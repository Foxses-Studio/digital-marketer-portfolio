import { createHash } from "node:crypto";
import type { Db } from "mongodb";
import type { SeedLedgerDocument } from "../../src/db/schema";

/**
 * Idempotency rules for one seeded unit:
 *
 *   content missing, never seeded      → create
 *   content missing, seeded before     → keep deleted (an admin removed it)
 *   content unchanged since last seed  → update to the current demo version
 *   content edited by an admin         → keep
 *   content not created by the seed    → keep (never touched)
 *
 * With --reset, seeded units are restored to the demo version even if
 * edited or deleted. Content the seed didn't create is still never touched.
 */

export type UnitStatus = "created" | "updated" | "unchanged" | "kept-edited" | "kept-deleted" | "kept-foreign" | "reset";

export type SeedContext = {
  db: Db;
  reset: boolean;
  dryRun: boolean;
  report: (key: string, status: UnitStatus) => void;
};

/** Order-independent JSON fingerprint. */
export function fingerprint(value: unknown): string {
  const normalize = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(normalize);
    if (input && typeof input === "object" && !(input instanceof Date)) {
      return Object.fromEntries(
        Object.keys(input as Record<string, unknown>)
          .sort()
          .map((key) => [key, normalize((input as Record<string, unknown>)[key])]),
      );
    }
    return input;
  };
  return createHash("sha256").update(JSON.stringify(normalize(value))).digest("hex");
}

/**
 * Decides what to do with one unit and performs the write. `current` is
 * undefined when the content doesn't exist.
 */
export async function applyUnit<T>(
  ctx: SeedContext,
  {
    key,
    current,
    next,
    write,
  }: { key: string; current: T | undefined; next: T; write: (value: T) => Promise<void> },
): Promise<UnitStatus> {
  const ledger = ctx.db.collection<SeedLedgerDocument>("seedLedger");
  const entry = await ledger.findOne({ _id: key });
  const nextHash = fingerprint(next);

  let status: UnitStatus;
  if (current === undefined) {
    status = !entry ? "created" : ctx.reset ? "reset" : "kept-deleted";
  } else if (!entry) {
    status = "kept-foreign";
  } else if (fingerprint(current) === entry.hash) {
    status = entry.hash === nextHash ? "unchanged" : "updated";
  } else {
    status = ctx.reset ? "reset" : "kept-edited";
  }

  if ((status === "created" || status === "updated" || status === "reset") && !ctx.dryRun) {
    await write(next);
    await ledger.updateOne(
      { _id: key },
      { $set: { hash: nextHash, appliedAt: new Date() } },
      { upsert: true },
    );
  }
  ctx.report(key, status);
  return status;
}
