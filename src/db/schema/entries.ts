import type { ObjectId } from "mongodb";
import type { CollectionIndexes } from "./types";

/**
 * Shape shared by every content collection (services, case studies, blog
 * posts...). Content fields are defined and validated per collection in
 * src/lib/entities/registry.ts; these are the system fields.
 */
export type EntryDocument = {
  _id: ObjectId;
  enabled: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  [field: string]: unknown;
};

export const entryIndexes = (slugged: boolean): CollectionIndexes => [
  { key: { sortOrder: 1 }, name: "order" },
  ...(slugged ? [{ key: { slug: 1 }, name: "slug_unique", unique: true, sparse: true }] : []),
];
