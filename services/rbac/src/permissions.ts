/**
 * RBAC permission matrix for Aegis Lens.
 *
 * Roles: owner > admin > editor > analyst > viewer > guest
 * Tiers: enterprise > pro > free > public
 *
 * Permission check order:
 *   1. Org-level role (coarse gating)
 *   2. Team-level role override (refine access within org)
 *   3. Project/Case-level role override (finest grain)
 *   4. Tier gate (certain actions require paid tier)
 *   5. Feature flag check (optional, for gradual rollout)
 */

// ── Role hierarchy ────────────────────────────────────────────────────────────

export type OrgRole = "owner" | "admin" | "editor" | "analyst" | "viewer" | "guest";
export type OrgTier = "enterprise" | "pro" | "free" | "public";

/** Numeric rank — higher = more privileged */
const ROLE_RANK: Record<OrgRole, number> = {
  owner: 100,
  admin: 80,
  editor: 60,
  analyst: 40,
  viewer: 20,
  guest: 0,
};

export function roleAtLeast(role: OrgRole, minimum: OrgRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

// ── Permission actions ────────────────────────────────────────────────────────

export type Permission =
  // Events
  | "events:read"
  | "events:read_classified"      // military/tactical layers
  | "events:export"
  | "events:export_bulk"          // >1000 rows, pro+
  // Cases
  | "cases:read"
  | "cases:create"
  | "cases:edit"
  | "cases:delete"
  | "cases:share"
  // AOIs
  | "aois:read"
  | "aois:create"
  | "aois:edit"
  | "aois:delete"
  // Alerts
  | "alerts:read"
  | "alerts:create"
  | "alerts:edit"
  | "alerts:delete"
  // Review queue
  | "review:read"
  | "review:decide"
  | "review:verify"               // "Verified" promotion — analyst+
  // Reports
  | "reports:read"
  | "reports:create"
  | "reports:approve"             // admin+
  // Webhooks
  | "webhooks:read"
  | "webhooks:manage"
  // Admin
  | "org:manage_members"
  | "org:manage_billing"
  | "org:manage_settings"
  // Tactical layers (enterprise only)
  | "layers:troop_movement"
  | "layers:tactical_intel"
  // AI copilot
  | "copilot:query"
  | "copilot:advanced"            // pro+
  // Feature flags (internal)
  | "flags:read"
  | "flags:write";

// ── Permission matrix ─────────────────────────────────────────────────────────

type PermissionSpec = {
  minRole: OrgRole;
  minTier?: OrgTier;
};

const TIER_RANK: Record<OrgTier, number> = {
  enterprise: 100,
  pro: 60,
  free: 20,
  public: 0,
};

function tierAtLeast(tier: OrgTier, minimum: OrgTier): boolean {
  return TIER_RANK[tier] >= TIER_RANK[minimum];
}

export const PERMISSION_MATRIX: Record<Permission, PermissionSpec> = {
  // Events — all roles can read public events
  "events:read":              { minRole: "guest" },
  "events:read_classified":   { minRole: "analyst" },
  "events:export":            { minRole: "viewer" },
  "events:export_bulk":       { minRole: "viewer", minTier: "pro" },

  // Cases
  "cases:read":               { minRole: "viewer" },
  "cases:create":             { minRole: "editor" },
  "cases:edit":               { minRole: "editor" },
  "cases:delete":             { minRole: "admin" },
  "cases:share":              { minRole: "editor" },

  // AOIs
  "aois:read":                { minRole: "viewer" },
  "aois:create":              { minRole: "editor" },
  "aois:edit":                { minRole: "editor" },
  "aois:delete":              { minRole: "admin" },

  // Alerts
  "alerts:read":              { minRole: "viewer" },
  "alerts:create":            { minRole: "editor" },
  "alerts:edit":              { minRole: "editor" },
  "alerts:delete":            { minRole: "admin" },

  // Review
  "review:read":              { minRole: "analyst" },
  "review:decide":            { minRole: "analyst" },
  "review:verify":            { minRole: "analyst" },

  // Reports
  "reports:read":             { minRole: "viewer" },
  "reports:create":           { minRole: "editor" },
  "reports:approve":          { minRole: "admin" },

  // Webhooks
  "webhooks:read":            { minRole: "editor" },
  "webhooks:manage":          { minRole: "admin" },

  // Org admin
  "org:manage_members":       { minRole: "admin" },
  "org:manage_billing":       { minRole: "owner" },
  "org:manage_settings":      { minRole: "admin" },

  // Tactical layers — enterprise only
  "layers:troop_movement":    { minRole: "analyst", minTier: "enterprise" },
  "layers:tactical_intel":    { minRole: "analyst", minTier: "enterprise" },

  // Copilot
  "copilot:query":            { minRole: "viewer" },
  "copilot:advanced":         { minRole: "viewer", minTier: "pro" },

  // Flags
  "flags:read":               { minRole: "admin" },
  "flags:write":              { minRole: "owner" },
};

// ── Permission evaluation ─────────────────────────────────────────────────────

export interface PermissionContext {
  role: OrgRole;
  tier: OrgTier;
  /** Additional project/case-level role override */
  projectRole?: OrgRole;
  /** User IDs explicitly granted this permission (bypass matrix) */
  grantedPermissions?: Permission[];
}

/**
 * Check if a context has a given permission.
 *
 * Evaluation order:
 *   1. Explicit grant (bypass matrix — for special exceptions)
 *   2. Project-level role override (if provided, use the higher of org/project role)
 *   3. Permission matrix: minRole + minTier gate
 */
export function can(ctx: PermissionContext, permission: Permission): boolean {
  if (ctx.grantedPermissions?.includes(permission)) return true;

  const spec = PERMISSION_MATRIX[permission];
  if (!spec) return false;

  // Use the higher of org role and project role
  const effectiveRole: OrgRole =
    ctx.projectRole && ROLE_RANK[ctx.projectRole] > ROLE_RANK[ctx.role]
      ? ctx.projectRole
      : ctx.role;

  if (!roleAtLeast(effectiveRole, spec.minRole)) return false;
  if (spec.minTier && !tierAtLeast(ctx.tier, spec.minTier)) return false;

  return true;
}

/**
 * Evaluate all permissions for a context in one pass.
 * Useful for frontend to know what to render/hide.
 */
export function evaluateAll(ctx: PermissionContext): Record<Permission, boolean> {
  return Object.fromEntries(
    Object.keys(PERMISSION_MATRIX).map((p) => [p, can(ctx, p as Permission)]),
  ) as Record<Permission, boolean>;
}

/**
 * Assert permission — throws if denied. Use in API route handlers.
 */
export function assertPermission(ctx: PermissionContext, permission: Permission): void {
  if (!can(ctx, permission)) {
    throw new PermissionDeniedError(permission, ctx.role, ctx.tier);
  }
}

export class PermissionDeniedError extends Error {
  constructor(
    public readonly permission: Permission,
    public readonly role: OrgRole,
    public readonly tier: OrgTier,
  ) {
    super(`Permission denied: ${permission} requires higher role or tier (current: ${role}/${tier})`);
    this.name = "PermissionDeniedError";
  }
}
