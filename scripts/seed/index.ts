/**
 * Development seed: fills the database with realistic demo content through
 * the same collections and schemas the admin panel uses, so everything it
 * creates can be edited, disabled, reordered or deleted in the admin.
 *
 *   npm run db:seed              add missing demo content, update untouched demo content
 *   npm run db:seed -- --reset   restore all demo content (overwrites edits to seeded items)
 *   npm run db:seed -- --dry-run show what would change
 *
 * Safe to run repeatedly. Never touches content the seed didn't create.
 * Refuses to run against production unless --allow-production is passed.
 *
 * Adding a section? Add its demo content to demo-content.ts and a module
 * in ./modules, then register it below.
 */
import { connect } from "../env";
import type { SeedContext, UnitStatus } from "./ledger";
import { seedHomeHero } from "./modules/home-hero";
import { seedNavigation } from "./modules/navigation";
import { seedSettings } from "./modules/settings";

const MODULES: Array<[string, (ctx: SeedContext) => Promise<void>]> = [
  ["Settings", seedSettings],
  ["Navigation", seedNavigation],
  ["Home · Hero", seedHomeHero],
];

const LABELS: Record<UnitStatus, string> = {
  created: "created",
  updated: "updated (was untouched demo content)",
  unchanged: "up to date",
  "kept-edited": "kept (edited in admin)",
  "kept-deleted": "kept deleted (removed in admin)",
  "kept-foreign": "kept (not created by the seed)",
  reset: "reset to demo content",
};

/** Ask a running dev server to drop its cached CMS reads. */
async function refreshDevServer() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const response = await fetch(new URL("/api/dev/revalidate", base), { method: "POST", signal: AbortSignal.timeout(3000) });
    if (response.ok) return console.log(`\nRefreshed the dev server at ${base}.`);
  } catch {
    // Server not running: nothing to refresh.
  }
  console.log("\nNo dev server answered. If `npm run dev` is running, restart it; a production build needs `npm run build` again.");
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const reset = args.has("--reset");
  const dryRun = args.has("--dry-run");

  if (process.env.NODE_ENV === "production" && !args.has("--allow-production")) {
    throw new Error("Refusing to seed demo content with NODE_ENV=production. Pass --allow-production to override.");
  }

  const { client, db } = await connect();
  const counts: Partial<Record<UnitStatus, number>> = {};
  try {
    console.log(`Seeding demo content into "${db.databaseName}"${reset ? " (reset)" : ""}${dryRun ? " (dry run)" : ""}\n`);
    for (const [name, run] of MODULES) {
      console.log(name);
      await run({
        db,
        reset,
        dryRun,
        report: (key, status) => {
          counts[status] = (counts[status] ?? 0) + 1;
          console.log(`  ${key.padEnd(52)} ${LABELS[status]}`);
        },
      });
    }
  } finally {
    await client.close();
  }

  const summary = Object.entries(counts).map(([status, n]) => `${n} ${status}`).join(", ");
  console.log(`\nDone: ${summary}.`);
  if (!dryRun) await refreshDevServer();
}


main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
