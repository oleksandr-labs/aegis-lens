/**
 * Email subscribers for digests / alerts. Double-opt-in: `verifiedAt` set on
 * confirmation, `unsubscribedAt` on opt-out (rows retained for audit).
 */

import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  index,
} from "drizzle-orm/pg-core";

export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    /** Topic slugs the subscriber opted into (string[]). */
    topics: jsonb("topics").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  },
  (t) => ({
    emailIdx: index("subscribers_email_idx").on(t.email),
  }),
);

export type SubscriberRow = typeof subscribers.$inferSelect;
export type SubscriberInsert = typeof subscribers.$inferInsert;
