/**
 * Long-form reports (weekly briefs, incident dossiers, methodology, etc.).
 * Mirrors `apps/web/src/lib/reports-seed.ts`. Bilingual EN/UK content stored
 * in dedicated columns; richer locales (if added later) move to JSONB.
 */

import {
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const reports = pgTable(
  "reports",
  {
    slug: text("slug").primaryKey(),
    kind: text("kind").notNull(), // regional | incident | weekly | trend | methodology

    titleEn: text("title_en").notNull(),
    titleUk: text("title_uk"),

    summaryEn: text("summary_en").notNull(),
    summaryUk: text("summary_uk"),

    bodyEn: text("body_en").notNull(),
    bodyUk: text("body_uk"),

    author: text("author").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),

    /** Event IDs cited (string[]). */
    citations: jsonb("citations").notNull(),
  },
  (t) => ({
    publishedAtIdx: index("reports_published_at_idx").on(t.publishedAt.desc()),
  }),
);

export type ReportRow = typeof reports.$inferSelect;
export type ReportInsert = typeof reports.$inferInsert;
