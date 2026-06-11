/**
 * Role-Based + Attribute-Based Access Control (RBAC + ABAC).
 *
 * Defines org-level roles, fine-grained permissions, and geo-fence policies
 * for classified / restricted data layers.
 *
 * Design:
 *   - OrgRole    — coarse role assigned to a user within an org
 *   - Permission — granular capability (checked in API routes / Server Actions)
 *   - GeoFencePolicy — ABAC layer: per-user geographic clearance
 *
 * Pattern matches packages/types/src/rbac.ts PERMISSION_MATRIX.
 *
 * RBAC + ABAC: ролі, дозволи, геофенс-політика.
 */

import "server-only";

// ── Roles ─────────────────────────────────────────────────────────────────────

export type OrgRole =
  | "owner"
  | "admin"
  | "analyst"
  | "viewer"
  | "billing-admin"
  | "auditor";

// ── Permissions ───────────────────────────────────────────────────────────────

export type Permission =
  | "read:events"
  | "write:events"
  | "read:reports"
  | "write:reports"
  | "manage:users"
  | "manage:billing"
  | "manage:sso"
  | "read:audit-log"
  | "export:data"
  | "access:api"
  | "manage:aoi"
  | "manage:alerts"
  | "use:copilot"
  | "read:raw-data";

// ── Role → Permission map ─────────────────────────────────────────────────────

/**
 * Canonical permission matrix per org role.
 * Each role is additive — higher roles include lower-role permissions.
 *
 * Матриця дозволів: яка роль що може робити.
 */
export const ROLE_PERMISSION_MAP: Record<OrgRole, Permission[]> = {
  owner: [
    "read:events",
    "write:events",
    "read:reports",
    "write:reports",
    "manage:users",
    "manage:billing",
    "manage:sso",
    "read:audit-log",
    "export:data",
    "access:api",
    "manage:aoi",
    "manage:alerts",
    "use:copilot",
    "read:raw-data",
  ],
  admin: [
    "read:events",
    "write:events",
    "read:reports",
    "write:reports",
    "manage:users",
    "manage:sso",
    "read:audit-log",
    "export:data",
    "access:api",
    "manage:aoi",
    "manage:alerts",
    "use:copilot",
    "read:raw-data",
  ],
  analyst: [
    "read:events",
    "write:events",
    "read:reports",
    "write:reports",
    "export:data",
    "access:api",
    "manage:aoi",
    "manage:alerts",
    "use:copilot",
    "read:raw-data",
  ],
  viewer: [
    "read:events",
    "read:reports",
    "access:api",
  ],
  "billing-admin": [
    "manage:billing",
    "read:reports",
    "read:audit-log",
  ],
  auditor: [
    "read:events",
    "read:reports",
    "read:audit-log",
    "export:data",
  ],
};

// ── Geo-fence policy ──────────────────────────────────────────────────────────

/**
 * ABAC extension: per-user geographic clearance for sensitive data layers.
 * clearanceLevel: 0=public, 1=restricted, 2=confidential, 3=secret
 *
 * Геофенс-політика: обмеження доступу за регіоном та рівнем допуску.
 */
export interface GeoFencePolicy {
  userId: string;
  /** ISO 3166-1 alpha-2 or custom region codes that this user may access. */
  allowedRegions: string[];
  /** Regions explicitly denied (takes precedence over allowedRegions). */
  deniedRegions: string[];
  /** Clearance level 0–3 (higher = more access). */
  clearanceLevel: number;
}

// ── Errors ────────────────────────────────────────────────────────────────────

export class PermissionDeniedError extends Error {
  readonly userId: string;
  readonly orgId: string;
  readonly permission: Permission;

  constructor(userId: string, orgId: string, permission: Permission) {
    super(
      `Permission denied: user "${userId}" in org "${orgId}" lacks "${permission}"`,
    );
    this.name = "PermissionDeniedError";
    this.userId = userId;
    this.orgId = orgId;
    this.permission = permission;
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * In-memory RBAC store.
 * For production replace with Postgres-backed role assignments.
 *
 * Зберігає ролі та геофенс-політики; синглтон.
 */
export class RbacStore {
  /** key: `${userId}:${orgId}` → OrgRole */
  private readonly roles = new Map<string, OrgRole>();
  /** key: userId → GeoFencePolicy */
  private readonly geoFences = new Map<string, GeoFencePolicy>();

  // ── Role management ────────────────────────────────────────────────────────

  /** Assign or update a user's role within an org. */
  setRole(userId: string, orgId: string, role: OrgRole): void {
    this.roles.set(`${userId}:${orgId}`, role);
  }

  /** Get a user's role in an org, or null if not a member. */
  getRole(userId: string, orgId: string): OrgRole | null {
    return this.roles.get(`${userId}:${orgId}`) ?? null;
  }

  /**
   * Check whether a user has a specific permission in an org.
   *
   * Перевіряє, чи має користувач дозвіл у межах організації.
   */
  hasPermission(userId: string, orgId: string, permission: Permission): boolean {
    const role = this.getRole(userId, orgId);
    if (!role) return false;
    return ROLE_PERMISSION_MAP[role].includes(permission);
  }

  /**
   * Assert a permission — throws PermissionDeniedError if not granted.
   * Use in API route handlers to guard endpoints.
   *
   * Кидає PermissionDeniedError якщо дозволу немає.
   */
  assertPermission(userId: string, orgId: string, permission: Permission): void {
    if (!this.hasPermission(userId, orgId, permission)) {
      throw new PermissionDeniedError(userId, orgId, permission);
    }
  }

  // ── Geo-fence ABAC ─────────────────────────────────────────────────────────

  /**
   * Store a geo-fence policy for a user.
   *
   * Зберігає геофенс-політику для користувача.
   */
  setGeoFence(userId: string, policy: GeoFencePolicy): void {
    this.geoFences.set(userId, policy);
  }

  /**
   * Check whether a user is permitted to access data from a region.
   * Denied regions take precedence.
   * If no policy exists, defaults to allowed (open access).
   *
   * Перевіряє геофенс: denied > allowed > open-default.
   */
  checkGeoFence(userId: string, regionCode: string): boolean {
    const policy = this.geoFences.get(userId);
    if (!policy) return true; // no restriction

    const code = regionCode.toUpperCase();

    if (policy.deniedRegions.map((r) => r.toUpperCase()).includes(code)) {
      return false;
    }

    if (policy.allowedRegions.length === 0) return true; // empty = all allowed
    return policy.allowedRegions.map((r) => r.toUpperCase()).includes(code);
  }

  /** Get geo-fence policy for a user, or null. */
  getGeoFence(userId: string): GeoFencePolicy | null {
    return this.geoFences.get(userId) ?? null;
  }
}

/** Singleton RBAC store instance. */
export const rbacStore = new RbacStore();
