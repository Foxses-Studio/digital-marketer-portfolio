import type { ObjectId } from "mongodb";
import type { SeoFields } from "@/validation/seo";
import type { CollectionIndexes } from "./types";

/**
 * One instance of a predefined section on a page. The section `type` maps
 * to a definition in src/lib/cms/sections/registry.ts, which owns the
 * component (design) and the Zod schemas for `content` and `config`.
 * Array position in `PageDocument.sections` is the display order.
 */
export type SectionInstance = {
  /** Stable id (UUID) so sections can be edited and reordered. */
  id: string;
  type: string;
  enabled: boolean;
  /** Editable content: headings, text, CTAs, media ids... */
  content: Record<string, unknown>;
  /** Limited presentation options the section allows (e.g. item count). */
  config: Record<string, unknown>;
};

/** A fixed system page (home, about, contact...) defined in src/config/pages.ts. */
export type PageDocument = {
  _id: ObjectId;
  key: string;
  title: string;
  seo: Partial<SeoFields>;
  sections: SectionInstance[];
  updatedBy: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
};

export const pagesIndexes: CollectionIndexes = [
  { key: { key: 1 }, name: "key_unique", unique: true },
];
