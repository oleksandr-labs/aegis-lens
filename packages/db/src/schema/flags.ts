/**
 * Feature flags + audit log.
 * See: services/flags/src/ for application-layer types.
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  real,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

// ── Feature flags ─────────────────────────────────────────────────────────────

export const featureFlags = pgTable(
  "feature_flags",
  {
    key: text("key").primaryKey(),
    kind: text("kind").notNull(),
    description: text("description"),
    enabled: boolean("enabled").notNull().default(false),
    /** JSON: FlagTarget */
    targets: jsonb("targets"),
    /** JSON: FlagVariant[] */
    variants: jsonb("variants"),
    defaultVariant: text("default_variant"),
    sunsetAt: timestamp("sunset_at", { withTimezone: true }),
    owner: text("owner"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("feature_flags_kind_idx").on(t.kind),
    index("feature_flags_sunset_idx").on(t.sunsetAt),
  ],
);

// ── Flag audit log ────────────────────────────────────────────────────────────

export const flagAuditLog = pgTable(
  "flag_audit_log",
  {
    logId: text("log_id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    flagKey: text("flag_key").notNull(),
    changedBy: text("changed_by").notNull(),
    /** JSON: before state */
    before: jsonb("before"),
    /** JSON: after state */
    after: jsonb("after"),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("flag_audit_flag_key_idx").on(t.flagKey),
    index("flag_audit_ts_idx").on(t.timestamp),
  ],
);
