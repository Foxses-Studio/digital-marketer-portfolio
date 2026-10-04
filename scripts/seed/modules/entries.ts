import { ObjectId } from "mongodb";
import type { EntryDocument } from "../../../src/db/schema";
import { omit } from "../../../src/lib/utils/omit";
import { getEntityDefinition, type EntityType } from "../../../src/lib/entities/registry";
import {
  DEMO_BLOG_POSTS,
  DEMO_CASE_STUDIES,
  DEMO_CERTIFICATIONS,
  DEMO_EXPERIENCE,
  DEMO_SERVICES,
  DEMO_TESTIMONIALS,
  DEMO_TOOLS,
  type DemoEntry,
} from "../demo-entries";
import { applyUnit, type SeedContext } from "../ledger";
import { resolveMediaRefs } from "./media";

const COLLECTIONS: Array<[EntityType, DemoEntry[]]> = [
  ["services", DEMO_SERVICES],
  ["caseStudies", DEMO_CASE_STUDIES],
  ["blogPosts", DEMO_BLOG_POSTS],
  ["testimonials", DEMO_TESTIMONIALS],
  ["experience", DEMO_EXPERIENCE],
  ["certifications", DEMO_CERTIFICATIONS],
  ["tools", DEMO_TOOLS],
];

/** Content fields only (what the admin form edits), for fingerprinting. */
function contentOf(doc: EntryDocument) {
  return omit(doc as Record<string, unknown>, ["_id", "enabled", "sortOrder", "createdAt", "updatedAt"]);
}

/**
 * Collection entries, one unit per entry. The fingerprint covers content
 * only, so an admin hiding or reordering a demo entry doesn't count as an
 * edit, and the seed never changes visibility or order of existing entries.
 */
export async function seedEntries(ctx: SeedContext) {
  for (const [type, demo] of COLLECTIONS) {
    const schema = getEntityDefinition(type).schema;
    const collection = ctx.db.collection<EntryDocument>(type);
    for (const entry of demo) {
      const _id = new ObjectId(entry._id);
      const next = schema.parse(resolveMediaRefs(entry.data)) as Record<string, unknown>;
      const doc = await collection.findOne({ _id });
      await applyUnit(ctx, {
        key: `entry:${type}:${entry._id}`,
        current: doc ? contentOf(doc) : undefined,
        next,
        write: async (content) => {
          const now = new Date();
          if (doc) {
            await collection.replaceOne({ _id }, { ...content, _id, enabled: doc.enabled, sortOrder: doc.sortOrder, createdAt: doc.createdAt, updatedAt: now } as EntryDocument);
          } else {
            await collection.insertOne({ ...content, _id, enabled: entry.enabled, sortOrder: entry.sortOrder, createdAt: now, updatedAt: now } as EntryDocument);
          }
        },
      });
    }
  }
}
