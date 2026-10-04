/**
 * Cache tag names for CMS data. Public reads are cached with `use cache`
 * and tagged here; admin mutations call `updateTag` with the same names so
 * changes appear immediately. Keep every tag string in this file.
 */
export const cacheTags = {
  settings: (group: string) => `settings:${group}`,
  page: (key: string) => `page:${key}`,
  media: "media",
  /** Every entry of a collection, e.g. all published projects. */
  collection: (collection: string) => `collection:${collection}`,
  /** A single entry, keyed by its stable id. */
  entry: (collection: string, id: string) => `entry:${collection}:${id}`,
} as const;
