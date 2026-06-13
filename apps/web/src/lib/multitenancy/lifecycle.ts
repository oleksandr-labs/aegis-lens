/**
 * Multi-tenancy — Org lifecycle management.
 *
 * Covers:
 *  - Org states: active → suspended → pending_deletion → deleted
 *  - suspendOrg: disable logins, preserve data, notify
 *  - deleteOrg: 30-day grace period → anonymize PII → delete events → audit
 *  - OrgMergeRequest: source → target merge with approver workflow
 *  - OrgSplitRequest: carve out members + resources into a new org
 */

import { randomUUID } from "crypto";

// ── Lifecycle states ──────────────────────────────────────────────────────────

export type OrgLifecycleStatus =
  | "active"            // normal operation
  | "suspended"         // logins disabled; data preserved
  | "pending_deletion"  // grace period in progress; can be reversed
  | "deleted";          // PII anonymised; events deleted; audit record kept

// ── Audit log types ───────────────────────────────────────────────────────────

export type LifecycleAction =
  | "org_created"
  | "org_suspended"
  | "org_reactivated"
  | "org_deletion_requested"
  | "org_deletion_cancelled"
  | "org_deleted"
  | "org_merge_requested"
  | "org_merge_approved"
  | "org_merge_executed"
  | "org_split_requested"
  | "org_split_approved"
  | "org_split_executed";

export interface LifecycleAuditEntry {
  entryId: string;
  orgId: string;
  action: LifecycleAction;
  performedBy: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const lifecycleAuditLog: LifecycleAuditEntry[] = [];

function audit(
  orgId: string,
  action: LifecycleAction,
  performedBy: string,
  metadata?: Record<string, unknown>,
): LifecycleAuditEntry {
  const entry: LifecycleAuditEntry = {
    entryId: randomUUID(),
    orgId,
    action,
    performedBy,
    timestamp: new Date().toISOString(),
    metadata,
  };
  lifecycleAuditLog.push(entry);
  return entry;
}

/** Retrieve full audit history for an org. */
export function getOrgLifecycleAuditLog(orgId: string): LifecycleAuditEntry[] {
  return lifecycleAuditLog
    .filter((e) => e.orgId === orgId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// ── Org record (stub — in production, read/write via Drizzle ORM) ─────────────

export interface OrgRecord {
  orgId: string;
  name: string;
  slug: string;
  tier: "free" | "pro" | "enterprise";
  status: OrgLifecycleStatus;
  suspendedAt?: string;
  suspensionReason?: string;
  suspendedBy?: string;
  deletionRequestedAt?: string;
  deletionRequestedBy?: string;
  /** Earliest time a pending_deletion org can be hard-deleted. */
  deletionEligibleAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** In-memory store. Replace with DB-backed implementation. */
const orgStore = new Map<string, OrgRecord>();

function requireOrg(orgId: string): OrgRecord {
  const org = orgStore.get(orgId);
  if (!org) throw new Error(`Org ${orgId} not found`);
  return org;
}

// ── Suspend ───────────────────────────────────────────────────────────────────

export interface SuspendOrgResult {
  org: OrgRecord;
  auditEntry: LifecycleAuditEntry;
  notificationSent: boolean;
}

/**
 * Suspend an org.
 *
 * Effects:
 *  - Sets status to "suspended"
 *  - Blocks new logins (callers must check org.status before issuing sessions)
 *  - Preserves all data in place
 *  - Sends a suspension notification (stubbed here; hook up email service)
 *  - Appends to lifecycle audit log
 */
export function suspendOrg(
  orgId: string,
  reason: string,
  suspendedBy: string,
): SuspendOrgResult {
  const org = requireOrg(orgId);

  if (org.status === "suspended") {
    throw new Error(`Org ${orgId} is already suspended`);
  }
  if (org.status === "deleted" || org.status === "pending_deletion") {
    throw new Error(`Cannot suspend org ${orgId} with status "${org.status}"`);
  }

  const now = new Date().toISOString();
  const updated: OrgRecord = {
    ...org,
    status: "suspended",
    suspendedAt: now,
    suspensionReason: reason,
    suspendedBy,
    updatedAt: now,
  };

  orgStore.set(orgId, updated);

  const auditEntry = audit(orgId, "org_suspended", suspendedBy, { reason });

  // In production: await notificationService.sendOrgSuspensionEmail(orgId, reason);
  const notificationSent = true; // stub

  return { org: { ...updated }, auditEntry, notificationSent };
}

/**
 * Reactivate a suspended org.
 */
export function reactivateOrg(
  orgId: string,
  reactivatedBy: string,
): OrgRecord {
  const org = requireOrg(orgId);

  if (org.status !== "suspended") {
    throw new Error(`Org ${orgId} is not suspended (status: "${org.status}")`);
  }

  const now = new Date().toISOString();
  const updated: OrgRecord = {
    ...org,
    status: "active",
    suspendedAt: undefined,
    suspensionReason: undefined,
    suspendedBy: undefined,
    updatedAt: now,
  };

  orgStore.set(orgId, updated);
  audit(orgId, "org_reactivated", reactivatedBy);

  return { ...updated };
}

// ── Delete ────────────────────────────────────────────────────────────────────

const DELETION_GRACE_PERIOD_DAYS = 30;

export interface DeleteOrgResult {
  org: OrgRecord;
  auditEntry: LifecycleAuditEntry;
  /** ISO 8601 — when hard deletion will be eligible. */
  deletionEligibleAt: string;
}

/**
 * Begin the org deletion process.
 *
 * Transition: active/suspended → pending_deletion
 * Hard deletion only runs after the 30-day grace period via `finalizeOrgDeletion()`.
 *
 * During grace period:
 *  - Org logins remain disabled
 *  - All data is preserved
 *  - Org admin can cancel by calling `cancelOrgDeletion()`
 */
export function requestOrgDeletion(
  orgId: string,
  requestedBy: string,
): DeleteOrgResult {
  const org = requireOrg(orgId);

  if (org.status === "deleted" || org.status === "pending_deletion") {
    throw new Error(`Org ${orgId} is already in status "${org.status}"`);
  }

  const now = new Date();
  const deletionEligibleAt = new Date(
    now.getTime() + DELETION_GRACE_PERIOD_DAYS * 86_400_000,
  ).toISOString();

  const updated: OrgRecord = {
    ...org,
    status: "pending_deletion",
    deletionRequestedAt: now.toISOString(),
    deletionRequestedBy: requestedBy,
    deletionEligibleAt,
    updatedAt: now.toISOString(),
  };

  orgStore.set(orgId, updated);

  const auditEntry = audit(orgId, "org_deletion_requested", requestedBy, {
    deletionEligibleAt,
    gracePeriodDays: DELETION_GRACE_PERIOD_DAYS,
  });

  return { org: { ...updated }, auditEntry, deletionEligibleAt };
}

/**
 * Cancel a pending deletion (within grace period).
 */
export function cancelOrgDeletion(orgId: string, cancelledBy: string): OrgRecord {
  const org = requireOrg(orgId);

  if (org.status !== "pending_deletion") {
    throw new Error(`Org ${orgId} is not in pending_deletion (status: "${org.status}")`);
  }

  const now = new Date().toISOString();
  const updated: OrgRecord = {
    ...org,
    status: "suspended", // revert to suspended (not active — admin must explicitly reactivate)
    deletionRequestedAt: undefined,
    deletionRequestedBy: undefined,
    deletionEligibleAt: undefined,
    updatedAt: now,
  };

  orgStore.set(orgId, updated);
  audit(orgId, "org_deletion_cancelled", cancelledBy);

  return { ...updated };
}

export interface FinalizeOrgDeletionResult {
  orgId: string;
  piiAnonymized: boolean;
  eventsDeleted: boolean;
  auditRetained: boolean;
  deletedAt: string;
}

/**
 * Finalize org deletion after the grace period has elapsed.
 *
 * Steps:
 *  1. Verify grace period has elapsed
 *  2. Anonymize PII (names, emails → "deleted_user_<hash>")
 *  3. Purge event data
 *  4. Mark org as deleted (audit record + minimal org row kept for compliance)
 *
 * In production each step should be a separate idempotent job so a crash is safe to retry.
 */
export async function finalizeOrgDeletion(
  orgId: string,
  executedBy: string,
): Promise<FinalizeOrgDeletionResult> {
  const org = requireOrg(orgId);

  if (org.status !== "pending_deletion") {
    throw new Error(`Org ${orgId} is not in pending_deletion`);
  }

  const now = new Date();
  const eligible = new Date(org.deletionEligibleAt!);

  if (now < eligible) {
    throw new Error(
      `Grace period has not elapsed. Deletion eligible at ${org.deletionEligibleAt}`,
    );
  }

  // Step 1: Anonymize PII (stub — in production call identity service)
  // e.g. UPDATE org_members SET email = 'deleted_' || md5(user_id) WHERE org_id = $1
  const piiAnonymized = true;

  // Step 2: Purge event data (stub — in production call events + cases services)
  // e.g. DELETE FROM events WHERE org_id = $1
  const eventsDeleted = true;

  // Step 3: Mark org record as deleted (keep minimal row for compliance)
  const deletedAt = now.toISOString();
  const deleted: OrgRecord = {
    ...org,
    status: "deleted",
    deletedAt,
    updatedAt: deletedAt,
  };
  orgStore.set(orgId, deleted);

  // Step 4: Audit log retained forever
  audit(orgId, "org_deleted", executedBy, { piiAnonymized, eventsDeleted });

  return { orgId, piiAnonymized, eventsDeleted, auditRetained: true, deletedAt };
}

// ── Merge orgs ────────────────────────────────────────────────────────────────

export type MergeRequestStatus =
  | "pending_approval"
  | "approved"
  | "executed"
  | "rejected";

export interface OrgMergeRequest {
  mergeId: string;
  /** Org that will be dissolved (source → merged into target). */
  sourceOrgId: string;
  /** Org that absorbs the source. */
  targetOrgId: string;
  requestedBy: string;
  /** Admin user IDs who must approve (all required). */
  approvers: string[];
  /** Track which approvers have approved. */
  approvedBy: string[];
  status: MergeRequestStatus;
  /** Reason / justification. */
  reason: string;
  createdAt: string;
  updatedAt: string;
  mergedAt?: string;
}

const mergeStore = new Map<string, OrgMergeRequest>();

export function createOrgMergeRequest(
  sourceOrgId: string,
  targetOrgId: string,
  requestedBy: string,
  approvers: string[],
  reason: string,
): OrgMergeRequest {
  if (sourceOrgId === targetOrgId) {
    throw new Error("Source and target org must differ");
  }
  if (approvers.length < 2) {
    throw new Error("At least two approvers required for an org merge");
  }

  requireOrg(sourceOrgId);
  requireOrg(targetOrgId);

  const now = new Date().toISOString();
  const req: OrgMergeRequest = {
    mergeId: randomUUID(),
    sourceOrgId,
    targetOrgId,
    requestedBy,
    approvers,
    approvedBy: [],
    status: "pending_approval",
    reason,
    createdAt: now,
    updatedAt: now,
  };

  mergeStore.set(req.mergeId, req);
  audit(sourceOrgId, "org_merge_requested", requestedBy, {
    mergeId: req.mergeId,
    targetOrgId,
    approvers,
  });

  return { ...req };
}

export function approveMergeRequest(
  mergeId: string,
  approverId: string,
): OrgMergeRequest {
  const req = mergeStore.get(mergeId);
  if (!req) throw new Error(`Merge request ${mergeId} not found`);
  if (req.status !== "pending_approval") {
    throw new Error(`Merge request is not pending approval (status: "${req.status}")`);
  }
  if (!req.approvers.includes(approverId)) {
    throw new Error(`User ${approverId} is not an approver for this merge request`);
  }
  if (req.approvedBy.includes(approverId)) {
    throw new Error(`User ${approverId} has already approved`);
  }

  const updatedApprovedBy = [...req.approvedBy, approverId];
  const allApproved = req.approvers.every((a) => updatedApprovedBy.includes(a));

  const updated: OrgMergeRequest = {
    ...req,
    approvedBy: updatedApprovedBy,
    status: allApproved ? "approved" : "pending_approval",
    updatedAt: new Date().toISOString(),
  };

  mergeStore.set(mergeId, updated);

  if (allApproved) {
    audit(req.sourceOrgId, "org_merge_approved", approverId, { mergeId });
  }

  return { ...updated };
}

export interface OrgMergeExecuteResult {
  mergeId: string;
  sourceOrgId: string;
  targetOrgId: string;
  mergedAt: string;
}

/**
 * Execute an approved merge.
 *
 * Production steps (stubbed here):
 *  1. Reassign all source org members to targetOrgId
 *  2. Reassign all source projects/cases/reports
 *  3. Merge billing subscriptions
 *  4. Mark source org as deleted (audit-only)
 *  5. Append audit log
 */
export function executeOrgMerge(
  mergeId: string,
  executedBy: string,
): OrgMergeExecuteResult {
  const req = mergeStore.get(mergeId);
  if (!req) throw new Error(`Merge request ${mergeId} not found`);
  if (req.status !== "approved") {
    throw new Error(`Merge request ${mergeId} is not approved (status: "${req.status}")`);
  }

  const mergedAt = new Date().toISOString();

  // Stub: reassign members, projects, billing — replace with DB transactions
  const sourceOrg = requireOrg(req.sourceOrgId);
  const merged: OrgRecord = {
    ...sourceOrg,
    status: "deleted",
    deletedAt: mergedAt,
    updatedAt: mergedAt,
  };
  orgStore.set(req.sourceOrgId, merged);

  const updatedReq: OrgMergeRequest = {
    ...req,
    status: "executed",
    mergedAt,
    updatedAt: mergedAt,
  };
  mergeStore.set(mergeId, updatedReq);

  audit(req.sourceOrgId, "org_merge_executed", executedBy, {
    mergeId,
    targetOrgId: req.targetOrgId,
  });

  return { mergeId, sourceOrgId: req.sourceOrgId, targetOrgId: req.targetOrgId, mergedAt };
}

// ── Split org ─────────────────────────────────────────────────────────────────

export type SplitRequestStatus =
  | "pending_approval"
  | "approved"
  | "executed"
  | "rejected";

export interface OrgSplitRequest {
  splitId: string;
  /** Org to split. */
  sourceOrgId: string;
  /** Name of the new org that will be carved out. */
  newOrgName: string;
  /** Members to move to the new org. */
  memberIds: string[];
  /** Resources (cases, projects, reports) to move to the new org. */
  resourceIds: string[];
  requestedBy: string;
  approvers: string[];
  approvedBy: string[];
  status: SplitRequestStatus;
  reason: string;
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
  /** ID of the newly created org (set after execution). */
  newOrgId?: string;
}

const splitStore = new Map<string, OrgSplitRequest>();

export function createOrgSplitRequest(params: {
  sourceOrgId: string;
  newOrgName: string;
  memberIds: string[];
  resourceIds: string[];
  requestedBy: string;
  approvers: string[];
  reason: string;
}): OrgSplitRequest {
  const { sourceOrgId, newOrgName, memberIds, resourceIds, requestedBy, approvers, reason } = params;

  requireOrg(sourceOrgId);

  if (memberIds.length === 0) {
    throw new Error("At least one member must be moved to the new org");
  }
  if (approvers.length < 2) {
    throw new Error("At least two approvers required for an org split");
  }

  const now = new Date().toISOString();
  const req: OrgSplitRequest = {
    splitId: randomUUID(),
    sourceOrgId,
    newOrgName,
    memberIds,
    resourceIds,
    requestedBy,
    approvers,
    approvedBy: [],
    status: "pending_approval",
    reason,
    createdAt: now,
    updatedAt: now,
  };

  splitStore.set(req.splitId, req);
  audit(sourceOrgId, "org_split_requested", requestedBy, {
    splitId: req.splitId,
    newOrgName,
    memberCount: memberIds.length,
    resourceCount: resourceIds.length,
    approvers,
  });

  return { ...req };
}

export function approveSplitRequest(
  splitId: string,
  approverId: string,
): OrgSplitRequest {
  const req = splitStore.get(splitId);
  if (!req) throw new Error(`Split request ${splitId} not found`);
  if (req.status !== "pending_approval") {
    throw new Error(`Split request is not pending approval (status: "${req.status}")`);
  }
  if (!req.approvers.includes(approverId)) {
    throw new Error(`User ${approverId} is not an approver for this split request`);
  }
  if (req.approvedBy.includes(approverId)) {
    throw new Error(`User ${approverId} has already approved`);
  }

  const updatedApprovedBy = [...req.approvedBy, approverId];
  const allApproved = req.approvers.every((a) => updatedApprovedBy.includes(a));

  const updated: OrgSplitRequest = {
    ...req,
    approvedBy: updatedApprovedBy,
    status: allApproved ? "approved" : "pending_approval",
    updatedAt: new Date().toISOString(),
  };

  splitStore.set(splitId, updated);

  if (allApproved) {
    audit(req.sourceOrgId, "org_split_approved", approverId, { splitId });
  }

  return { ...updated };
}

export interface OrgSplitExecuteResult {
  splitId: string;
  sourceOrgId: string;
  newOrgId: string;
  newOrgName: string;
  executedAt: string;
}

/**
 * Execute an approved split.
 *
 * Production steps (stubbed here):
 *  1. Create the new org record
 *  2. Reassign selected memberIds → newOrgId
 *  3. Reassign selected resourceIds → newOrgId
 *  4. Migrate billing (pro-rata)
 *  5. Append audit log on both orgs
 */
export function executeOrgSplit(
  splitId: string,
  executedBy: string,
): OrgSplitExecuteResult {
  const req = splitStore.get(splitId);
  if (!req) throw new Error(`Split request ${splitId} not found`);
  if (req.status !== "approved") {
    throw new Error(`Split request ${splitId} is not approved (status: "${req.status}")`);
  }

  const executedAt = new Date().toISOString();
  const newOrgId = randomUUID();

  // Create new org stub record
  const newOrg: OrgRecord = {
    orgId: newOrgId,
    name: req.newOrgName,
    slug: req.newOrgName.toLowerCase().replace(/\s+/g, "-"),
    tier: "free",
    status: "active",
    createdAt: executedAt,
    updatedAt: executedAt,
  };
  orgStore.set(newOrgId, newOrg);

  // Stub: reassign members and resources — replace with DB transactions
  const updatedReq: OrgSplitRequest = {
    ...req,
    status: "executed",
    executedAt,
    newOrgId,
    updatedAt: executedAt,
  };
  splitStore.set(splitId, updatedReq);

  audit(req.sourceOrgId, "org_split_executed", executedBy, {
    splitId,
    newOrgId,
    newOrgName: req.newOrgName,
    membersMoved: req.memberIds.length,
    resourcesMoved: req.resourceIds.length,
  });

  audit(newOrgId, "org_created", executedBy, {
    splitId,
    sourceOrgId: req.sourceOrgId,
    origin: "org_split",
  });

  return { splitId, sourceOrgId: req.sourceOrgId, newOrgId, newOrgName: req.newOrgName, executedAt };
}

// ── Utility ───────────────────────────────────────────────────────────────────

/** Register an org (production: Drizzle insert; here: in-memory). */
export function registerOrg(
  orgId: string,
  name: string,
  slug: string,
  tier: OrgRecord["tier"] = "free",
): OrgRecord {
  const now = new Date().toISOString();
  const org: OrgRecord = {
    orgId,
    name,
    slug,
    tier,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  orgStore.set(orgId, org);
  audit(orgId, "org_created", "system");
  return { ...org };
}

export function getOrg(orgId: string): OrgRecord | null {
  const org = orgStore.get(orgId);
  return org ? { ...org } : null;
}

/** Guard: throw if org is not active (for use in session/login middleware). */
export function assertOrgActive(orgId: string): void {
  const org = requireOrg(orgId);
  if (org.status !== "active") {
    throw new Error(
      `Org ${orgId} is not active (status: "${org.status}"). Login blocked.`,
    );
  }
}
