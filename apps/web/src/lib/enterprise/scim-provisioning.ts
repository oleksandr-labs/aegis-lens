/**
 * SCIM 2.0 provisioning store.
 *
 * SCIM (System for Cross-domain Identity Management) RFC 7643/7644.
 * Handles automated user/group lifecycle from IdP → Aegis Lens:
 *   - Just-in-time provisioning on first SSO login
 *   - Automated deprovisioning when removed from IdP
 *   - Group membership sync for RBAC assignment
 *
 * SCIM 2.0 — авто-провізіонування користувачів та груп з IdP.
 */

import "server-only";
import { randomUUID } from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ScimUser {
  id: string;
  /** Stable ID from the upstream IdP (used for conflict resolution). */
  externalId: string;
  /** Username / UPN from the IdP (usually email). */
  userName: string;
  displayName: string;
  emails: { value: string; primary: boolean }[];
  /** Group IDs this user belongs to. */
  groups: string[];
  active: boolean;
  orgId: string;
}

export interface ScimGroup {
  id: string;
  displayName: string;
  members: { value: string; display: string }[];
  orgId: string;
}

export type ScimOperation =
  | "create"
  | "update"
  | "delete"
  | "replace-members";

export interface ScimEvent {
  op: ScimOperation;
  resourceType: "User" | "Group";
  resource: ScimUser | ScimGroup;
  timestamp: string;
}

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * In-memory SCIM provisioning store.
 * For production replace with Postgres-backed persistence.
 *
 * Зберігає SCIM-користувачів та групи; синглтон.
 */
export class ScimProvisioningStore {
  private readonly users = new Map<string, ScimUser>();    // id → user
  private readonly groups = new Map<string, ScimGroup>();  // id → group
  private readonly eventLog: ScimEvent[] = [];

  // ── Users ──────────────────────────────────────────────────────────────────

  /**
   * Upsert a user received via SCIM /Users endpoint.
   * Matches on externalId within the org to handle updates.
   *
   * Синхронізує користувача: create або update за externalId.
   */
  syncUser(user: ScimUser): ScimUser {
    // Resolve existing by externalId + orgId to detect updates
    const existing = Array.from(this.users.values()).find(
      (u) => u.externalId === user.externalId && u.orgId === user.orgId,
    );

    const op: ScimOperation = existing ? "update" : "create";
    const resolved: ScimUser = {
      ...user,
      id: existing?.id ?? (user.id || randomUUID()),
    };

    this.users.set(resolved.id, resolved);
    this._log(op, "User", resolved);
    return resolved;
  }

  /**
   * Deprovision (soft-delete / deactivate) a user by SCIM id.
   *
   * Деактивує користувача за id (soft delete).
   */
  deprovisionUser(userId: string): void {
    const user = this.users.get(userId);
    if (!user) return;
    const deactivated: ScimUser = { ...user, active: false };
    this.users.set(userId, deactivated);
    this._log("delete", "User", deactivated);
  }

  /**
   * Return all active users for an org.
   *
   * Повертає всіх активних користувачів організації.
   */
  getUsers(orgId: string): ScimUser[] {
    return Array.from(this.users.values()).filter(
      (u) => u.orgId === orgId && u.active,
    );
  }

  /** Find user by SCIM id. */
  getUserById(id: string): ScimUser | null {
    return this.users.get(id) ?? null;
  }

  // ── Groups ─────────────────────────────────────────────────────────────────

  /**
   * Upsert a group received via SCIM /Groups endpoint.
   *
   * Синхронізує групу: create або replace-members.
   */
  syncGroup(group: ScimGroup): ScimGroup {
    const existing = this.groups.get(group.id);
    const op: ScimOperation = existing ? "replace-members" : "create";
    const resolved: ScimGroup = {
      ...group,
      id: group.id || randomUUID(),
    };

    this.groups.set(resolved.id, resolved);
    this._log(op, "Group", resolved);
    return resolved;
  }

  /**
   * Return all groups for an org.
   *
   * Повертає всі групи організації.
   */
  getGroups(orgId: string): ScimGroup[] {
    return Array.from(this.groups.values()).filter((g) => g.orgId === orgId);
  }

  /** Find group by SCIM id. */
  getGroupById(id: string): ScimGroup | null {
    return this.groups.get(id) ?? null;
  }

  // ── Event log ──────────────────────────────────────────────────────────────

  /** Recent SCIM events (for audit). Cap at 1 000. */
  getEvents(): ScimEvent[] {
    return this.eventLog.slice(-1000);
  }

  private _log(
    op: ScimOperation,
    resourceType: "User" | "Group",
    resource: ScimUser | ScimGroup,
  ): void {
    this.eventLog.push({ op, resourceType, resource, timestamp: new Date().toISOString() });
    if (this.eventLog.length > 1000) this.eventLog.shift();
  }
}

/** Singleton SCIM store instance. */
export const scimStore = new ScimProvisioningStore();

// ── SCIM response helpers ─────────────────────────────────────────────────────

/**
 * Format a user as a SCIM 2.0 User resource.
 *
 * Форматує ScimUser у вигляд SCIM 2.0 ListResponse/Resource.
 */
export function toScimUserResource(user: ScimUser): Record<string, unknown> {
  return {
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
    id: user.id,
    externalId: user.externalId,
    userName: user.userName,
    displayName: user.displayName,
    emails: user.emails,
    groups: user.groups.map((gid) => ({ value: gid })),
    active: user.active,
    meta: {
      resourceType: "User",
      location: `/api/scim/v2/Users/${user.id}`,
    },
  };
}

/**
 * Format a group as a SCIM 2.0 Group resource.
 *
 * Форматує ScimGroup у вигляд SCIM 2.0 Resource.
 */
export function toScimGroupResource(group: ScimGroup): Record<string, unknown> {
  return {
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    id: group.id,
    displayName: group.displayName,
    members: group.members,
    meta: {
      resourceType: "Group",
      location: `/api/scim/v2/Groups/${group.id}`,
    },
  };
}

/**
 * Build a SCIM 2.0 ListResponse envelope.
 *
 * Повертає SCIM ListResponse з пагінацією.
 */
export function scimListResponse(
  resources: unknown[],
  totalResults: number,
  startIndex = 1,
): Record<string, unknown> {
  return {
    schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
    totalResults,
    startIndex,
    itemsPerPage: resources.length,
    Resources: resources,
  };
}
