/**
 * Multi-tenancy — Cross-org sharing, public objects, and collaboration invites.
 *
 * Covers:
 *  - Public object opt-in (presets, dashboards, reports)
 *  - Cross-org collaboration invites with expiry and scoped tokens
 *  - Audit log on every cross-org access (read or write)
 */

import { randomUUID } from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SharedResourceType = "preset" | "dashboard" | "report" | "case" | "notebook";

export type CrossOrgPermission = "view" | "comment" | "edit";

export type InviteStatus = "pending" | "accepted" | "declined" | "revoked" | "expired";

export type CrossOrgAction = "read" | "write" | "export" | "invite_accepted" | "invite_declined";

// ── Public object policy ──────────────────────────────────────────────────────

/**
 * Org-level policy for what types of objects can be made public.
 * Stored in `orgs.settings JSONB` (key: "publicObjectPolicy").
 */
export interface PublicObjectPolicy {
  /** Allow org admins to publish presets to the global preset gallery. */
  allowPublicPresets: boolean;
  /** Allow org admins to share dashboards via a public read-only link. */
  allowPublicDashboards: boolean;
  /** Allow org admins to publish reports as public documents. */
  allowPublicReports: boolean;
  /**
   * If true, any user publishing an object triggers an approval request
   * to an org admin before the object goes live.
   */
  requireOrgAdminApproval: boolean;
}

/** Conservative defaults: presets public, dashboards/reports require approval. */
export const DEFAULT_PUBLIC_OBJECT_POLICY: PublicObjectPolicy = {
  allowPublicPresets: true,
  allowPublicDashboards: false,
  allowPublicReports: false,
  requireOrgAdminApproval: true,
};

// ── Cross-org invite ──────────────────────────────────────────────────────────

export interface CrossOrgInvite {
  inviteId: string;
  /** Org that is granting access. */
  fromOrgId: string;
  /** Org that is receiving access. */
  toOrgId: string;
  /** User in fromOrg who created the invite. */
  createdBy: string;
  resourceType: SharedResourceType;
  resourceId: string;
  permissions: CrossOrgPermission[];
  status: InviteStatus;
  /** ISO 8601 — invite expires even if not explicitly revoked. */
  expiresAt: string;
  createdAt: string;
  /** Set when the invite is accepted/declined/revoked. */
  resolvedAt?: string;
  /** User in toOrg who acted on the invite. */
  resolvedBy?: string;
  /** Scoped access token issued on acceptance. Null until accepted. */
  accessToken?: string;
}

/** In-memory store for demonstration. Replace with DB-backed implementation. */
const inviteStore = new Map<string, CrossOrgInvite>();

/**
 * Create a cross-org collaboration invite.
 *
 * @param fromOrgId   Org that owns the resource.
 * @param toOrgId     Org being invited.
 * @param createdBy   userId of the admin creating the invite.
 * @param resourceType
 * @param resourceId
 * @param permissions What the invited org can do with the resource.
 * @param ttlDays     How many days until the invite expires (default: 30).
 */
export function createCrossOrgInvite(
  fromOrgId: string,
  toOrgId: string,
  createdBy: string,
  resourceType: SharedResourceType,
  resourceId: string,
  permissions: CrossOrgPermission[],
  ttlDays = 30,
): CrossOrgInvite {
  if (fromOrgId === toOrgId) {
    throw new Error("Cannot create a cross-org invite within the same org");
  }
  if (permissions.length === 0) {
    throw new Error("At least one permission must be specified");
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlDays * 86_400_000).toISOString();

  const invite: CrossOrgInvite = {
    inviteId: randomUUID(),
    fromOrgId,
    toOrgId,
    createdBy,
    resourceType,
    resourceId,
    permissions,
    status: "pending",
    expiresAt,
    createdAt: now.toISOString(),
  };

  inviteStore.set(invite.inviteId, invite);

  logCrossOrgAccess({
    requesterId: createdBy,
    requesterOrgId: fromOrgId,
    targetOrgId: toOrgId,
    resourceType,
    resourceId,
    action: "invite_accepted", // using "read" as the nearest semantic for invite creation
    inviteId: invite.inviteId,
    metadata: { permissions },
  });

  return { ...invite };
}

/**
 * Accept a cross-org invite.
 *
 * Validates:
 *  - Invite exists and is pending
 *  - Not expired
 *  - Accepting user belongs to `toOrgId`
 *
 * On success: marks invite as accepted and mints a scoped access token.
 */
export function acceptCrossOrgInvite(
  inviteId: string,
  acceptedBy: string,
  accepterOrgId: string,
): CrossOrgInvite {
  const invite = inviteStore.get(inviteId);

  if (!invite) {
    throw new Error(`Invite ${inviteId} not found`);
  }
  if (invite.status !== "pending") {
    throw new Error(`Invite ${inviteId} is already ${invite.status}`);
  }
  if (accepterOrgId !== invite.toOrgId) {
    throw new Error("Accepting org does not match invite target org");
  }

  const now = new Date();
  if (new Date(invite.expiresAt) < now) {
    const expired = { ...invite, status: "expired" as InviteStatus };
    inviteStore.set(inviteId, expired);
    throw new Error(`Invite ${inviteId} has expired`);
  }

  // Mint a scoped access token. In production, sign a short-lived JWT with
  // { sub: acceptedBy, fromOrg: invite.fromOrgId, resource: invite.resourceId, perms: invite.permissions }.
  const accessToken = mintScopedAccessToken(invite, acceptedBy);

  const accepted: CrossOrgInvite = {
    ...invite,
    status: "accepted",
    resolvedAt: now.toISOString(),
    resolvedBy: acceptedBy,
    accessToken,
  };

  inviteStore.set(inviteId, accepted);

  logCrossOrgAccess({
    requesterId: acceptedBy,
    requesterOrgId: accepterOrgId,
    targetOrgId: invite.fromOrgId,
    resourceType: invite.resourceType,
    resourceId: invite.resourceId,
    action: "invite_accepted",
    inviteId,
    metadata: { permissions: invite.permissions },
  });

  return { ...accepted };
}

/**
 * Revoke a cross-org invite (by the issuing org admin).
 */
export function revokeCrossOrgInvite(
  inviteId: string,
  revokedBy: string,
  revokerOrgId: string,
): CrossOrgInvite {
  const invite = inviteStore.get(inviteId);

  if (!invite) throw new Error(`Invite ${inviteId} not found`);
  if (revokerOrgId !== invite.fromOrgId) {
    throw new Error("Only the issuing org can revoke this invite");
  }
  if (invite.status === "revoked" || invite.status === "expired") {
    throw new Error(`Invite ${inviteId} is already ${invite.status}`);
  }

  const revoked: CrossOrgInvite = {
    ...invite,
    status: "revoked",
    resolvedAt: new Date().toISOString(),
    resolvedBy: revokedBy,
    accessToken: undefined,
  };

  inviteStore.set(inviteId, revoked);
  return { ...revoked };
}

/** Retrieve an invite by ID. */
export function getCrossOrgInvite(inviteId: string): CrossOrgInvite | null {
  const invite = inviteStore.get(inviteId);
  return invite ? { ...invite } : null;
}

/** List all invites for an org (as sender or receiver). */
export function listCrossOrgInvites(orgId: string): CrossOrgInvite[] {
  return Array.from(inviteStore.values())
    .filter((i) => i.fromOrgId === orgId || i.toOrgId === orgId)
    .map((i) => ({ ...i }));
}

// ── Scoped access token ───────────────────────────────────────────────────────

/**
 * Mint a short-lived scoped access token for a cross-org resource.
 * In production this should be a signed JWT (RS256/EdDSA).
 * Here we produce a deterministic opaque token for the stub.
 */
function mintScopedAccessToken(invite: CrossOrgInvite, acceptedBy: string): string {
  const payload = JSON.stringify({
    type: "cross_org_access",
    inviteId: invite.inviteId,
    fromOrgId: invite.fromOrgId,
    toOrgId: invite.toOrgId,
    resourceType: invite.resourceType,
    resourceId: invite.resourceId,
    permissions: invite.permissions,
    sub: acceptedBy,
    // Token expires same time as invite or 90 days, whichever is sooner
    exp: Math.min(
      new Date(invite.expiresAt).getTime(),
      Date.now() + 90 * 86_400_000,
    ),
    iat: Date.now(),
  });
  // In production: return jwt.sign(payload, privateKey, { algorithm: "RS256" });
  return Buffer.from(payload).toString("base64url");
}

// ── Cross-org audit log ───────────────────────────────────────────────────────

export interface CrossOrgAccessLog {
  logId: string;
  /** User who made the request. */
  requesterId: string;
  /** Org the requester belongs to. */
  requesterOrgId: string;
  /** Org that owns the resource being accessed. */
  targetOrgId: string;
  resourceType: SharedResourceType;
  resourceId: string;
  action: CrossOrgAction;
  /** ISO 8601 timestamp. */
  timestamp: string;
  /** Associated invite, if any. */
  inviteId?: string;
  /** Arbitrary extra context. */
  metadata?: Record<string, unknown>;
}

/** In-memory audit log. Replace with append-only DB table / CloudWatch Logs in production. */
const crossOrgAuditLog: CrossOrgAccessLog[] = [];

export interface LogCrossOrgAccessParams {
  requesterId: string;
  requesterOrgId: string;
  targetOrgId: string;
  resourceType: SharedResourceType;
  resourceId: string;
  action: CrossOrgAction;
  inviteId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Append an entry to the cross-org access audit log.
 * MUST be called on every cross-org read and write — enforcement is the caller's responsibility.
 */
export function logCrossOrgAccess(params: LogCrossOrgAccessParams): CrossOrgAccessLog {
  const entry: CrossOrgAccessLog = {
    logId: randomUUID(),
    ...params,
    timestamp: new Date().toISOString(),
  };
  crossOrgAuditLog.push(entry);
  return entry;
}

/** Query the audit log. Supports filtering by org, resource, or requester. */
export function queryCrossOrgAuditLog(filters: {
  requesterOrgId?: string;
  targetOrgId?: string;
  resourceId?: string;
  requesterId?: string;
  action?: CrossOrgAction;
  limit?: number;
}): CrossOrgAccessLog[] {
  let results = crossOrgAuditLog.slice();

  if (filters.requesterOrgId) {
    results = results.filter((e) => e.requesterOrgId === filters.requesterOrgId);
  }
  if (filters.targetOrgId) {
    results = results.filter((e) => e.targetOrgId === filters.targetOrgId);
  }
  if (filters.resourceId) {
    results = results.filter((e) => e.resourceId === filters.resourceId);
  }
  if (filters.requesterId) {
    results = results.filter((e) => e.requesterId === filters.requesterId);
  }
  if (filters.action) {
    results = results.filter((e) => e.action === filters.action);
  }

  // Most-recent first
  results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return results.slice(0, filters.limit ?? 100);
}
