/**
 * Collaboration case files.
 * A case groups events, notes, AOIs, media, and collaborators.
 * See: TODO/features/TODO_collaboration_cases.md
 */

import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  index,
  uuid,
} from "drizzle-orm/pg-core";

// ── Cases ─────────────────────────────────────────────────────────────────────

export const cases = pgTable(
  "cases",
  {
    caseId: uuid("case_id").defaultRandom().primaryKey(),
    orgId: text("org_id").notNull(),
    createdBy: text("created_by").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").notNull().default("active"), // active | archived | locked
    /** JSON: string[] of event_ids */
    eventIds: jsonb("event_ids").notNull().default("[]"),
    /** JSON: string[] of aoi_ids */
    aoiIds: jsonb("aoi_ids").notNull().default("[]"),
    /** JSON: { viewer: string[], editor: string[], admin: string[] } */
    permissions: jsonb("permissions").notNull().default("{}"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    orgIdx: index("cases_org_idx").on(t.orgId),
    createdByIdx: index("cases_created_by_idx").on(t.createdBy),
    statusIdx: index("cases_status_idx").on(t.status),
  }),
);

export type CaseRow = typeof cases.$inferSelect;
export type CaseInsert = typeof cases.$inferInsert;

// ── Case notes ────────────────────────────────────────────────────────────────

export const caseNotes = pgTable(
  "case_notes",
  {
    noteId: uuid("note_id").defaultRandom().primaryKey(),
    caseId: uuid("case_id").notNull(),
    authorId: text("author_id").notNull(),
    /** Rich-text HTML from Tiptap/Lexical */
    content: text("content").notNull(),
    /** Quoted event_id if this note replies to an event */
    replyToEventId: text("reply_to_event_id"),
    /** Quoted note_id if this is a threaded reply */
    replyToNoteId: uuid("reply_to_note_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => ({
    caseIdx: index("case_notes_case_idx").on(t.caseId),
    timeIdx: index("case_notes_time_idx").on(t.createdAt.desc()),
  }),
);

export type CaseNoteRow = typeof caseNotes.$inferSelect;
export type CaseNoteInsert = typeof caseNotes.$inferInsert;

// ── Case attachments ──────────────────────────────────────────────────────────

export const caseAttachments = pgTable(
  "case_attachments",
  {
    attachmentId: uuid("attachment_id").defaultRandom().primaryKey(),
    caseId: uuid("case_id").notNull(),
    uploadedBy: text("uploaded_by").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: text("size_bytes").notNull(),
    storageUrl: text("storage_url").notNull(),
    virusScanStatus: text("virus_scan_status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    caseIdx: index("case_attachments_case_idx").on(t.caseId),
  }),
);

export type CaseAttachmentRow = typeof caseAttachments.$inferSelect;

// ── Case activity feed ────────────────────────────────────────────────────────

export const caseActivity = pgTable(
  "case_activity",
  {
    activityId: uuid("activity_id").defaultRandom().primaryKey(),
    caseId: uuid("case_id").notNull(),
    actorId: text("actor_id").notNull(),
    /** e.g. "event_added", "note_created", "permission_changed" */
    action: text("action").notNull(),
    /** JSON blob with action-specific data */
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    caseIdx: index("case_activity_case_idx").on(t.caseId),
    timeIdx: index("case_activity_time_idx").on(t.createdAt.desc()),
  }),
);

export type CaseActivityRow = typeof caseActivity.$inferSelect;
