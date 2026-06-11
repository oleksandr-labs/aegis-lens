'use server';

/**
 * Per-organisation content policy store (server-side, in-memory).
 *
 * Controls whether a trained-analyst org can bypass blur/click-through
 * for graphic content. Default policy is maximally conservative.
 * Replace the in-memory Map with a DB-backed adapter for persistence.
 */

import type { OrgContentPolicy } from "./types";

// ── Default safe policy ───────────────────────────────────────────────────────

const DEFAULT_ORG_POLICY: Omit<OrgContentPolicy, "orgId"> = {
  trainedAnalysts: false,
  warningOverrideEnabled: false,
  requiresAdminApproval: true,
};

// ── Store class ───────────────────────────────────────────────────────────────

export class OrgPolicyStore {
  private readonly store = new Map<string, OrgContentPolicy>();

  /** Persist a full policy for an organisation. */
  setPolicy(orgId: string, policy: OrgContentPolicy): void {
    this.store.set(orgId, { ...policy, orgId });
  }

  /**
   * Return the stored policy for an org, or the safe default if none is set.
   * Safe default: not trained, no override, admin approval required.
   */
  getPolicy(orgId: string): OrgContentPolicy {
    return this.store.get(orgId) ?? { ...DEFAULT_ORG_POLICY, orgId };
  }

  /**
   * True only when the org has trained analysts AND override is explicitly
   * enabled AND the policy does not require additional admin approval.
   */
  canOverrideWarnings(orgId: string): boolean {
    const policy = this.getPolicy(orgId);
    return (
      policy.trainedAnalysts &&
      policy.warningOverrideEnabled &&
      !policy.requiresAdminApproval
    );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const orgPolicyStore = new OrgPolicyStore();
