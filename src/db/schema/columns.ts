import { timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Column helpers shared by every CMS entity so all tables follow the
 * same conventions (UUID keys, timezone-aware timestamps).
 */
export const id = () => uuid("id").primaryKey().defaultRandom();

export const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
