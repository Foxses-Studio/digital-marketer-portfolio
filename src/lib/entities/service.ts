import "server-only";
import { ObjectId, type Filter } from "mongodb";
import { cacheLife, cacheTag } from "next/cache";
import { collection } from "@/db";
import type { EntryDocument } from "@/db/schema";
import { cacheTags } from "@/lib/cms/cache-tags";
import { ConflictError, isDuplicateKeyError, NotFoundError, ValidationError } from "@/lib/errors";
import { omit } from "@/lib/utils/omit";
import { fieldErrors } from "@/validation/utils";
import { getEntityDefinition, type EntityType, type EntryRecord } from "./registry";

/** CRUD for content collections. Callers authorize; this validates. */

function toRecord(doc: EntryDocument): EntryRecord {
  const rest = omit(doc as Record<string, unknown>, ["_id", "createdAt", "updatedAt"]);
  return { ...rest, id: doc._id.toHexString() } as EntryRecord;
}

function parse(type: EntityType, input: unknown) {
  const parsed = getEntityDefinition(type).schema.safeParse(input);
  if (!parsed.success) throw new ValidationError(fieldErrors(parsed.error));
  return parsed.data as Record<string, unknown>;
}

function objectId(id: string) {
  if (!ObjectId.isValid(id)) throw new NotFoundError();
  return new ObjectId(id);
}

async function guardSlug<T>(write: () => Promise<T>) {
  try {
    return await write();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ValidationError({ slug: ["That URL slug is already used by another entry."] });
    }
    throw error;
  }
}

/** Admin list: every entry, in order. */
export async function listEntries(type: EntityType): Promise<EntryRecord[]> {
  const entries = await collection(type);
  const docs = await entries.find({}).sort({ sortOrder: 1, _id: 1 }).toArray();
  return docs.map(toRecord);
}

/** Public list: enabled entries in order, cached until the collection changes. */
export async function getPublicEntries(
  type: EntityType,
  { limit = 50, filter = {} }: { limit?: number; filter?: Record<string, unknown> } = {},
): Promise<EntryRecord[]> {
  "use cache";
  cacheTag(cacheTags.collection(type));
  cacheLife("max");
  const entries = await collection(type);
  const docs = await entries
    .find({ ...filter, enabled: true } as Filter<EntryDocument>)
    .sort({ sortOrder: 1, _id: 1 })
    .limit(limit)
    .toArray();
  return docs.map(toRecord);
}

export async function createEntry(type: EntityType, input: unknown): Promise<string> {
  const data = parse(type, input);
  const entries = await collection(type);
  const last = await entries.find({}).sort({ sortOrder: -1 }).limit(1).toArray();
  const now = new Date();
  const doc = {
    _id: new ObjectId(),
    ...data,
    enabled: true,
    sortOrder: (last[0]?.sortOrder ?? -1) + 1,
    createdAt: now,
    updatedAt: now,
  } as EntryDocument;
  await guardSlug(() => entries.insertOne(doc));
  return doc._id.toHexString();
}

export async function updateEntry(type: EntityType, id: string, input: unknown) {
  const data = parse(type, input);
  const entries = await collection(type);
  const current = await entries.findOne({ _id: objectId(id) });
  if (!current) throw new NotFoundError();
  // Replace content fields (removing cleared optional ones), keep system fields.
  const { _id, enabled, sortOrder, createdAt } = current;
  await guardSlug(() =>
    entries.replaceOne({ _id }, { ...data, enabled, sortOrder, createdAt, updatedAt: new Date() } as EntryDocument),
  );
}

export async function setEntryEnabled(type: EntityType, id: string, enabled: boolean) {
  const entries = await collection(type);
  const result = await entries.updateOne({ _id: objectId(id) }, { $set: { enabled, updatedAt: new Date() } });
  if (result.matchedCount === 0) throw new NotFoundError();
}

export async function deleteEntry(type: EntityType, id: string) {
  const entries = await collection(type);
  const result = await entries.deleteOne({ _id: objectId(id) });
  if (result.deletedCount === 0) throw new NotFoundError();
}

/** `order` must contain exactly the collection's ids. */
export async function reorderEntries(type: EntityType, order: string[]) {
  const entries = await collection(type);
  const existing = (await entries.find({}, { projection: { _id: 1 } }).toArray()).map((d) => d._id.toHexString());
  const valid =
    order.length === existing.length && new Set(order).size === order.length && order.every((id) => existing.includes(id));
  if (!valid) throw new ConflictError("The list changed. Reload and try again.");
  await Promise.all(
    order.map((id, index) => entries.updateOne({ _id: new ObjectId(id) }, { $set: { sortOrder: index } })),
  );
}
