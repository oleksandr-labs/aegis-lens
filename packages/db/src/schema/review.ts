/**
 * Human-in-the-loop verification review queue.
 *
 * Tasks are generated automatically by the verify service when an event
 * needs analyst attention (low confidence, ambiguous geo, media to verify).
 *
 * Two-reviewer rule enforced at application layer for "Verified" promotions.
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  smallint,
  jsonb,
  index,
  uuid,
} from "drizzle-orm/pg-core";

export type ReviewTaskType =
  | "classify"
  | "geolocate"
  | "verify_media"
  | "translate"
  | "corroborate";

export const reviewTasks = pgTable(
  "review_tasks",
  {
    taskId: uuid("task_id").defaultRandom().primaryKey(),
    eventId: text("event_id").notNull(),
    taskType: text("task_type").notNull(), // ReviewTaskType
    /** Priority 0 (highest) to 100 (lowest) — computed from severity × confidence inverse */
    priority: smallint("priority").notNull().default(50),
    status: text("status").notNull().default("pending"), // pending | in_progress | completed | skipped | escalated
    /** Analyst currently holding this task */
    assignedTo: text("assigned_to"),
    assignedAt: timestamp("assigned_at", { withTimezone: true }),
    /** SLA deadline based on task type + severity */
    slaDeadline: timestamp("sla_deadline", { withTimezone: true }),
    /** JSON blob of task-specific context (source text, AI output, etc.) */
    context: jsonb("context"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index("review_tasks_status_idx").on(t.status),
    eventIdx: index("review_tasks_event_idx").on(t.eventId),
    priorityIdx: index("review_tasks_priority_idx").on(t.priority),
    slaIdx: index("review_tasks_sla_idx").on(t.slaDeadline),
  }),
);

export type ReviewTaskRow = typeof reviewTasks.$inferSelect;
export type ReviewTaskInsert = typeof reviewTasks.$inferInsert;

// ── Review decisions ──────────────────────────────────────────────────────────

export const reviewDecisions = pgTable(
  "review_decisions",
  {
    decisionId: uuid("decision_id").defaultRandom().primaryKey(),
    taskId: uuid("task_id").notNull(),
    reviewerId: text("reviewer_id").notNull(),
    /** accept | reject | edit | escalate | skip */
    decision: text("decision").notNull(),
    /** Proposed correction or annotation */
    payload: jsonb("payload"),
    timeSpentSec: smallint("time_spent_sec"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    taskIdx: index("review_decisions_task_idx").on(t.taskId),
    reviewerIdx: index("review_decisions_reviewer_idx").on(t.reviewerId),
  }),
);

export type ReviewDecisionRow = typeof reviewDecisions.$inferSelect;
export type ReviewDecisionInsert = typeof reviewDecisions.$inferInsert;

// ── Reviewer stats (materialized summary) ────────────────────────────────────

export const reviewerStats = pgTable(
  "reviewer_stats",
  {
    reviewerId: text("reviewer_id").primaryKey(),
    totalDecisions: smallint("total_decisions").notNull().default(0),
    acceptRate: text("accept_rate"), // stored as decimal string "0.75"
    avgTimeSpentSec: smallint("avg_time_spent_sec"),
    /** Accuracy from double-review QA sampling (0-1) */
    qaAccuracy: text("qa_accuracy"),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
);

export type ReviewerStatsRow = typeof reviewerStats.$inferSelect;

// ── AI-generated intelligence reports ────────────────────────────────────────

export const aiReports = pgTable(
  "ai_reports",
  {
    reportId: uuid("report_id").defaultRandom().primaryKey(),
    kind: text("kind").notNull(), // regional | incident | weekly | custom
    titleEn: text("title_en").notNull(),
    titleUk: text("title_uk"),
    regions: jsonb("regions").notNull().default("[]"),
    eventClasses: jsonb("event_classes").notNull().default("[]"),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    /** Full structured sections as JSON (ReportSection[]) */
    sections: jsonb("sections").notNull().default("[]"),
    status: text("status").notNull().default("draft"),
    model: text("model").notNull(),
    approvedBy: text("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    /** SHA-256 of published content for integrity */
    contentHash: text("content_hash"),
    isRetracted: boolean("is_retracted").notNull().default(false),
    retractedAt: timestamp("retracted_at", { withTimezone: true }),
    retractedReason: text("retracted_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index("ai_reports_status_idx").on(t.status),
    kindIdx: index("ai_reports_kind_idx").on(t.kind),
    periodIdx: index("ai_reports_period_idx").on(t.periodEnd.desc()),
  }),
);

export type AIReportRow = typeof aiReports.$inferSelect;
export type AIReportInsert = typeof aiReports.$inferInsert;
