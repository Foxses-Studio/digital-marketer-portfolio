import { jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "./columns";

/**
 * Global site settings stored as one JSON document per group ("site",
 * "seo", later "contact", "social", ...). The shape of each group is
 * defined and validated by Zod in src/validation/settings.ts, so new
 * fields can be added without a database migration.
 */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  ...timestamps(),
});
