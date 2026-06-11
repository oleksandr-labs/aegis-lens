/**
 * Application users (analyst/operator accounts).
 *
 * Note: this is a fresh, standalone `users` table for the user-account schema
 * pass. It deliberately differs from the tenancy `users` in `../schema.ts`
 * (which is keyed to orgs/memberships and will be reconciled in a later sprint).
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  plan: text("plan").notNull().default("free"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
});

export type UserRow = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
