/**
 * Multi-tenancy — Org / Team / Project schema.
 *
 * Tenant = Org (UUID). Contains Users (members), Teams (sub-groups),
 * Projects (case spaces with per-project RBAC).
 *
 * RLS policy: every table carries org_id; Postgres row-level security
 * enforces isolation. Pattern: `SET LOCAL app.current_org_id = '<uuid>'`.
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

// ── Orgs ──────────────────────────────────────────────────────────────────────

export const orgs = pgTable(
  "orgs",
  {
    orgId: uuid("org_id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    /** free | pro | enterprise */
    tier: text("tier").notNull().default("free"),
    status: text("status").notNull().default("active"), // active | suspended | deleted
    /** Default locale for the org */
    defaultLocale: text("default_locale").notNull().default("en"),
    /** SSO provider config (JSONB: { provider, domain, config }) */
    ssoConfig: jsonb("sso_config"),
    /** Retention policy in days for events/cases (0 = keep forever) */
    retentionDays: text("retention_days").notNull().default("0"),
    /** Whether org is white-labelled */
    whiteLabel: boolean("white_label").notNull().default(false),
    /** Branding overrides JSON */
    branding: jsonb("branding"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => ({
    slugIdx: index("orgs_slug_idx").on(t.slug),
    tierIdx: index("orgs_tier_idx").on(t.tier),
  }),
);

export type OrgRow = typeof orgs.$inferSelect;
export type OrgInsert = typeof orgs.$inferInsert;

// ── Org members ───────────────────────────────────────────────────────────────

export const orgMembers = pgTable(
  "org_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id").notNull(),
    userId: text("user_id").notNull(),
    role: text("role").notNull().default("viewer"), // viewer | analyst | editor | admin
    invitedBy: text("invited_by"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  },
  (t) => ({
    orgUserIdx: index("org_members_org_user_idx").on(t.orgId, t.userId),
    userIdx: index("org_members_user_idx").on(t.userId),
  }),
);

export type OrgMemberRow = typeof orgMembers.$inferSelect;
export type OrgMemberInsert = typeof orgMembers.$inferInsert;

// ── Teams ─────────────────────────────────────────────────────────────────────

export const teams = pgTable(
  "teams",
  {
    teamId: uuid("team_id").defaultRandom().primaryKey(),
    orgId: uuid("org_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    /** Roles for this team's members on top of org role */
    roleOverrides: jsonb("role_overrides"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    orgIdx: index("teams_org_idx").on(t.orgId),
  }),
);

export type TeamRow = typeof teams.$inferSelect;
export type TeamInsert = typeof teams.$inferInsert;

export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamId: uuid("team_id").notNull(),
    userId: text("user_id").notNull(),
    addedAt: timestamp("added_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    teamUserIdx: index("team_members_team_user_idx").on(t.teamId, t.userId),
  }),
);

export type TeamMemberRow = typeof teamMembers.$inferSelect;

// ── Projects ──────────────────────────────────────────────────────────────────

export const projects = pgTable(
  "projects",
  {
    projectId: uuid("project_id").defaultRandom().primaryKey(),
    orgId: uuid("org_id").notNull(),
    teamId: uuid("team_id"),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").notNull().default("active"), // active | archived
    /** Explicit member overrides: { user_id: role }  */
    memberRoles: jsonb("member_roles").notNull().default("{}"),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    orgIdx: index("projects_org_idx").on(t.orgId),
    teamIdx: index("projects_team_idx").on(t.teamId),
  }),
);

export type ProjectRow = typeof projects.$inferSelect;
export type ProjectInsert = typeof projects.$inferInsert;
