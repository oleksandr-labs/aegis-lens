/**
 * Public OSINT source registry. Mirrors `apps/web/src/lib/sources-public-seed.ts`.
 */

import {
  pgTable,
  text,
  timestamp,
  real,
  index,
} from "drizzle-orm/pg-core";

export const sources = pgTable(
  "sources",
  {
    slug: text("slug").primaryKey(),
    name: text("name").notNull(),
    kind: text("kind").notNull(),
    country: text("country").notNull(), // ISO2
    language: text("language").notNull(),
    description: text("description").notNull(),
    reliability: real("reliability").notNull(), // 0..1
    homepageUrl: text("homepage_url").notNull(),
    addedAt: timestamp("added_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    kindIdx: index("sources_kind_idx").on(t.kind),
  }),
);

export type SourceRow = typeof sources.$inferSelect;
export type SourceInsert = typeof sources.$inferInsert;
