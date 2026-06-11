import "server-only";

import { TIER_LIMITS, type UserTier } from "./rate-limit";

// ── Types ─────────────────────────────────────────────────────────────────────

/** Shape of a single endpoint-family config (matches TIER_LIMITS values) */
export type EndpointFamilyLimits = {
  rpm: number;
  burst: number;
};

/** Full tier limits shape (all families present) */
export type TierLimits = {
  events: EndpointFamilyLimits;
  search: EndpointFamilyLimits;
  copilot: EndpointFamilyLimits;
  export: EndpointFamilyLimits;
  layers: EndpointFamilyLimits;
  default: EndpointFamilyLimits;
};

/**
 * Enterprise limit config — mirrors TierLimits shape but all values optional.
 * Only specified fields override the base tier; unspecified fields fall back.
 */
export type EnterpriseLimitConfig = {
  events?: Partial<EndpointFamilyLimits>;
  search?: Partial<EndpointFamilyLimits>;
  copilot?: Partial<EndpointFamilyLimits>;
  export?: Partial<EndpointFamilyLimits>;
  layers?: Partial<EndpointFamilyLimits>;
  default?: Partial<EndpointFamilyLimits>;
};

export type EnterpriseContract = {
  orgId: string;
  limitsOverride: Partial<EnterpriseLimitConfig>;
  /** ISO-8601 */
  signedAt: string;
  /** ISO-8601 */
  expiresAt: string;
  accountManager: string;
};

// ── In-memory contract store ──────────────────────────────────────────────────

/** Sprint 2: replace with DB-backed contract lookup */
const contractStore = new Map<string, EnterpriseContract>();

// ── Core functions ────────────────────────────────────────────────────────────

/**
 * Upsert an enterprise contract.
 * Replaces any existing contract for the orgId.
 */
export function upsertContract(contract: EnterpriseContract): void {
  contractStore.set(contract.orgId, contract);
}

/**
 * Retrieve the active contract for an org (if any).
 * Returns undefined if no contract exists or the contract has expired.
 */
export function getContract(orgId: string): EnterpriseContract | undefined {
  const contract = contractStore.get(orgId);
  if (!contract) return undefined;

  const now = Date.now();
  const expires = new Date(contract.expiresAt).getTime();
  if (expires <= now) {
    // Expired — remove from store
    contractStore.delete(orgId);
    return undefined;
  }

  return contract;
}

/**
 * Compute the effective rate limits for an org, merging:
 *   1. Base tier limits (from TIER_LIMITS)
 *   2. Enterprise contract overrides (if any, and if not expired)
 *
 * Override semantics: per-field merge — only fields present in the contract
 * override the base tier. Missing fields keep the base tier value.
 */
export function getEffectiveLimits(orgId: string, baseTier: string): TierLimits {
  const resolvedTier: UserTier =
    baseTier in TIER_LIMITS ? (baseTier as UserTier) : "anonymous";

  const base = TIER_LIMITS[resolvedTier];

  // Deep-copy so mutations don't affect the original constant
  const effective: TierLimits = {
    events:  { ...base.events },
    search:  { ...base.search },
    copilot: { ...base.copilot },
    export:  { ...base.export },
    layers:  { ...base.layers },
    default: { ...base.default },
  };

  const contract = getContract(orgId);
  if (!contract) return effective;

  const overrides = contract.limitsOverride;

  // Apply per-family overrides where present
  const families = ["events", "search", "copilot", "export", "layers", "default"] as const;
  for (const family of families) {
    const override = overrides[family];
    if (!override) continue;
    if (override.rpm !== undefined) effective[family].rpm = override.rpm;
    if (override.burst !== undefined) effective[family].burst = override.burst;
  }

  return effective;
}
