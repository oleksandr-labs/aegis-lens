import "server-only";

/**
 * Per-org IP Allow / Deny Lists — API Gateway edge module.
 *
 * Supports CIDR-based allow and deny rules per organisation. The deny list is
 * evaluated AFTER the allow list: an IP that matches an allow rule is never
 * blocked by a deny rule (explicit allow wins). An empty allow list means
 * "allow all" — only deny rules apply.
 *
 * CIDR matching: IPv4 supported. IPv6 is stubbed (always returns `no_match`)
 * until a full IPv6 CIDR library is added. Log a warning if an IPv6 address
 * is checked so we know the gap is hit in production.
 *
 * NOTE: For high-throughput enforcement, back this store with Redis and
 * cache per-org rule sets. The `InMemoryIpListStore` is correct for dev /
 * low-traffic deployments and unit tests.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type IpListRuleType = "allow" | "deny";

export interface IpListRule {
  /** CIDR notation, e.g. "203.0.113.0/24" or "198.51.100.42/32". */
  cidr: string;
  type: IpListRuleType;
  /** Human-readable note for the audit trail. */
  note?: string;
  /** Unix timestamp (ms) when this rule was added. */
  addedAtMs: number;
  /** Who added the rule (org admin user ID). */
  addedBy: string;
}

export interface IpListStore {
  getRules(orgId: string): Promise<IpListRule[]>;
  addRule(orgId: string, rule: IpListRule): Promise<void>;
  removeRule(orgId: string, cidr: string, type: IpListRuleType): Promise<void>;
  clearRules(orgId: string): Promise<void>;
}

export type IpCheckOutcome = "allowed" | "denied" | "default_allow";

export interface IpCheckResult {
  outcome: IpCheckOutcome;
  matchedRule: IpListRule | null;
  /** Milliseconds taken for the check (for telemetry). */
  latencyMs: number;
}

// ── CIDR helpers (IPv4 only) ──────────────────────────────────────────────────

function ipv4ToUint32(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    const n = parseInt(part, 10);
    if (isNaN(n) || n < 0 || n > 255) return null;
    result = (result << 8) | n;
  }
  // JavaScript bitwise ops are signed 32-bit; convert to unsigned.
  return result >>> 0;
}

function parseCidr(cidr: string): { networkInt: number; maskInt: number } | null {
  const [ip, prefixStr] = cidr.split("/");
  const prefix = parseInt(prefixStr, 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return null;
  const networkInt = ipv4ToUint32(ip);
  if (networkInt === null) return null;
  const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return { networkInt: networkInt & maskInt, maskInt };
}

function isIPv6(ip: string): boolean {
  return ip.includes(":");
}

/**
 * Returns true if `ip` falls within the `cidr` block (IPv4 only).
 * Returns null for IPv6 (caller should treat as "no match" and log a warning).
 */
export function cidrContainsIp(cidr: string, ip: string): boolean | null {
  if (isIPv6(ip)) return null; // IPv6 stub

  const parsed = parseCidr(cidr);
  if (!parsed) return false;

  const ipInt = ipv4ToUint32(ip);
  if (ipInt === null) return false;

  return (ipInt & parsed.maskInt) === parsed.networkInt;
}

// ── In-memory store ───────────────────────────────────────────────────────────

export class InMemoryIpListStore implements IpListStore {
  /** orgId → rules */
  private readonly store = new Map<string, IpListRule[]>();

  async getRules(orgId: string): Promise<IpListRule[]> {
    return this.store.get(orgId) ?? [];
  }

  async addRule(orgId: string, rule: IpListRule): Promise<void> {
    const rules = this.store.get(orgId) ?? [];
    // Replace existing rule with same CIDR + type to avoid duplicates.
    const idx = rules.findIndex(
      (r) => r.cidr === rule.cidr && r.type === rule.type,
    );
    if (idx >= 0) {
      rules[idx] = rule;
    } else {
      rules.push(rule);
    }
    this.store.set(orgId, rules);
  }

  async removeRule(
    orgId: string,
    cidr: string,
    type: IpListRuleType,
  ): Promise<void> {
    const rules = this.store.get(orgId) ?? [];
    this.store.set(
      orgId,
      rules.filter((r) => !(r.cidr === cidr && r.type === rule.type)),
    );
  }

  async clearRules(orgId: string): Promise<void> {
    this.store.delete(orgId);
  }
}

// Bug-fix: removeRule closure references undefined `rule` — corrected below.
// (The method above is overridden by the patched version at module level.)
InMemoryIpListStore.prototype.removeRule = async function (
  orgId: string,
  cidr: string,
  type: IpListRuleType,
): Promise<void> {
  const rules: IpListRule[] = (this as any).store.get(orgId) ?? [];
  (this as any).store.set(
    orgId,
    rules.filter((r) => !(r.cidr === cidr && r.type === type)),
  );
};

// ── Singleton store (swap for Redis-backed in production) ─────────────────────

export const ipListStore: IpListStore = new InMemoryIpListStore();

// ── Core check function ───────────────────────────────────────────────────────

/**
 * Check whether `ip` is allowed for `orgId` given the org's configured rules.
 *
 * Evaluation order:
 *   1. Allow rules — if any allow rule matches, return `allowed` immediately.
 *   2. Deny rules  — if any deny rule matches, return `denied`.
 *   3. No match    — return `default_allow` (open by default; invert if needed).
 */
export async function checkIpAccess(
  ip: string,
  orgId: string,
  store: IpListStore = ipListStore,
): Promise<IpCheckResult> {
  const start = Date.now();
  const rules = await store.getRules(orgId);

  const isV6 = isIPv6(ip);
  if (isV6) {
    // IPv6 stub — log and fall through to default_allow.
    console.warn(
      `[ip-allowlist] IPv6 address ${ip} encountered for org ${orgId}; ` +
        `IPv6 CIDR matching not yet implemented — applying default_allow.`,
    );
    return {
      outcome: "default_allow",
      matchedRule: null,
      latencyMs: Date.now() - start,
    };
  }

  const allowRules = rules.filter((r) => r.type === "allow");
  const denyRules = rules.filter((r) => r.type === "deny");

  // Explicit allow wins.
  for (const rule of allowRules) {
    if (cidrContainsIp(rule.cidr, ip)) {
      return {
        outcome: "allowed",
        matchedRule: rule,
        latencyMs: Date.now() - start,
      };
    }
  }

  // Deny check (only if there are allow rules that didn't match, OR standalone deny rules).
  for (const rule of denyRules) {
    if (cidrContainsIp(rule.cidr, ip)) {
      return {
        outcome: "denied",
        matchedRule: rule,
        latencyMs: Date.now() - start,
      };
    }
  }

  return {
    outcome: "default_allow",
    matchedRule: null,
    latencyMs: Date.now() - start,
  };
}
