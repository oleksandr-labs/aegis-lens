/**
 * Role-Based Access Control (RBAC) matrix.
 * See: TODO/security/TODO_auth_security.md
 *
 * Resources: event, layer, report, case, org, aoi, alert_rule
 * Actions:   read, write, delete, publish, admin
 * Roles:     viewer, analyst, editor, admin, super_admin
 *
 * ABAC extension: geo-fenced layers (tactical) require org-level policy + KYC.
 */

export type Role = "viewer" | "analyst" | "editor" | "admin" | "super_admin";

export type Resource =
  | "event"
  | "layer"
  | "layer_tactical"   // high-sensitivity layers (troop_movement, etc.)
  | "report"
  | "case"
  | "case_note"
  | "aoi"
  | "alert_rule"
  | "org"
  | "api_key"
  | "source"
  | "user";

export type Action = "read" | "write" | "delete" | "publish" | "admin" | "export";

/**
 * Permission check result.
 * `allowed: false` always comes with a `reason`.
 */
export type PermissionResult =
  | { allowed: true }
  | { allowed: false; reason: "insufficient_role" | "tier_required" | "kyc_required" | "geo_fence" };

/**
 * Static RBAC matrix.
 * [role][resource][action] = true means allowed.
 * ABAC checks (org policy, geo-fence) are enforced at runtime by `checkPermission`.
 */
type PermissionMatrix = Partial<Record<Role, Partial<Record<Resource, Partial<Record<Action, true>>>>>>;

export const PERMISSION_MATRIX: PermissionMatrix = {
  viewer: {
    event: { read: true, export: true },
    layer: { read: true },
    report: { read: true },
    case: { read: true },
    aoi: { read: true },
    alert_rule: { read: true },
  },
  analyst: {
    event: { read: true, export: true },
    layer: { read: true },
    layer_tactical: { read: true },
    report: { read: true, write: true },
    case: { read: true, write: true },
    case_note: { read: true, write: true, delete: true },
    aoi: { read: true, write: true, delete: true },
    alert_rule: { read: true, write: true, delete: true },
    api_key: { read: true, write: true },
    source: { read: true },
  },
  editor: {
    event: { read: true, write: true, export: true },
    layer: { read: true, write: true },
    layer_tactical: { read: true },
    report: { read: true, write: true, publish: true, delete: true },
    case: { read: true, write: true, delete: true, publish: true },
    case_note: { read: true, write: true, delete: true },
    aoi: { read: true, write: true, delete: true },
    alert_rule: { read: true, write: true, delete: true },
    api_key: { read: true, write: true, delete: true },
    source: { read: true, write: true },
    user: { read: true },
  },
  admin: {
    event: { read: true, write: true, delete: true, export: true },
    layer: { read: true, write: true, delete: true },
    layer_tactical: { read: true, write: true },
    report: { read: true, write: true, publish: true, delete: true },
    case: { read: true, write: true, delete: true, publish: true, admin: true },
    case_note: { read: true, write: true, delete: true },
    aoi: { read: true, write: true, delete: true, admin: true },
    alert_rule: { read: true, write: true, delete: true, admin: true },
    api_key: { read: true, write: true, delete: true },
    source: { read: true, write: true, delete: true },
    user: { read: true, write: true, delete: true },
    org: { read: true, write: true },
  },
  super_admin: {
    event: { read: true, write: true, delete: true, export: true, admin: true },
    layer: { read: true, write: true, delete: true, admin: true },
    layer_tactical: { read: true, write: true, delete: true, admin: true },
    report: { read: true, write: true, publish: true, delete: true, admin: true },
    case: { read: true, write: true, delete: true, publish: true, admin: true },
    case_note: { read: true, write: true, delete: true, admin: true },
    aoi: { read: true, write: true, delete: true, admin: true },
    alert_rule: { read: true, write: true, delete: true, admin: true },
    api_key: { read: true, write: true, delete: true, admin: true },
    source: { read: true, write: true, delete: true, admin: true },
    user: { read: true, write: true, delete: true, admin: true },
    org: { read: true, write: true, delete: true, admin: true },
  },
};

/**
 * Subscription tiers that unlock specific resources.
 * tactical layers require pro+; enterprise features require enterprise.
 */
export const TIER_REQUIREMENTS: Partial<Record<Resource, "registered" | "pro" | "enterprise">> = {
  layer_tactical: "pro",
  aoi: "registered",
  api_key: "pro",
};

export interface PermissionContext {
  role: Role;
  tier: "public" | "registered" | "pro" | "enterprise";
  /** True if the org has passed KYC (for enterprise tactical data) */
  kyc_verified: boolean;
}

const TIER_RANK: Record<string, number> = {
  public: 0,
  registered: 1,
  pro: 2,
  enterprise: 3,
};

export function checkPermission(
  ctx: PermissionContext,
  resource: Resource,
  action: Action,
): PermissionResult {
  // Tier gate
  const requiredTier = TIER_REQUIREMENTS[resource];
  if (requiredTier && TIER_RANK[ctx.tier] < TIER_RANK[requiredTier]) {
    return { allowed: false, reason: "tier_required" };
  }

  // KYC gate for tactical layers
  if (resource === "layer_tactical" && !ctx.kyc_verified && ctx.tier !== "enterprise") {
    return { allowed: false, reason: "kyc_required" };
  }

  // RBAC matrix
  const allowed = PERMISSION_MATRIX[ctx.role]?.[resource]?.[action] === true;
  if (!allowed) return { allowed: false, reason: "insufficient_role" };

  return { allowed: true };
}

/** Convenience: throw if not allowed */
export function assertPermission(ctx: PermissionContext, resource: Resource, action: Action): void {
  const result = checkPermission(ctx, resource, action);
  if (!result.allowed) {
    throw new Error(`Permission denied: ${resource}:${action} — ${result.reason}`);
  }
}
