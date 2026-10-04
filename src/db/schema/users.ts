import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { id, timestamps } from "./columns";

/** Admin accounts that can sign in to the CMS. */
export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
