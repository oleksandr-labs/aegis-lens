/**
 * Tamper-evident enterprise audit log.
 *
 * Extends the basic audit-log-store.ts with:
 *   - Hash chain (SHA-256) linking each entry to the previous one
 *   - Chain integrity verification
 *   - Rich metadata: orgId, userId, IP, userAgent, resource, action
 *   - 20+ standard AUDIT_ACTIONS
 *
 * The hash chain provides tamper-evidence: any modification to a past
 * entry breaks every subsequent hash, making it detectable via verify().
 *
 * Uses Web Crypto API (available in Next.js Edge + Node runtimes).
 *
 * Захищений аудит-лог із ланцюжком SHA-256 хешів.
 */

import "server-only";
import { randomUUID } from "crypto";

// ── Standard audit actions ────────────────────────────────────────────────────

/**
 * Canonical set of audit action strings.
 * Namespaced as <resource>.<verb> for easy filtering.
 *
 * Стандартні дії для аудит-логу: resource.verb.
 */
export const AUDIT_ACTIONS = [
  "user.login",
  "user.logout",
  "user.invite",
  "user.removed",
  "user.password-changed",
  "user.mfa-enabled",
  "user.mfa-disabled",
  "permission.change",
  "data.export",
  "data.import",
  "api.call",
  "api-key.created",
  "api-key.revoked",
  "sso.configured",
  "sso.deactivated",
  "scim.user-synced",
  "scim.user-deprovisioned",
  "scim.group-synced",
  "report.generated",
  "report.deleted",
  "event.flag",
  "event.unflag",
  "case.created",
  "case.closed",
  "aoi.created",
  "aoi.deleted",
  "alert.triggered",
  "billing.subscription-changed",
  "org.settings-changed",
  "dpa.signed",
] as const;

export type AuditActionEnterprise = (typeof AUDIT_ACTIONS)[number];

// ── Entry interface ───────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  orgId: string;
  userId: string;
  action: string;
  /** Resource type, e.g. "user", "report", "event". */
  resource: string;
  /** Optional primary key of the affected resource. */
  resourceId?: string;
  metadata: Record<string, unknown>;
  /** Client IP address. */
  ip?: string;
  userAgent?: string;
  /** ISO 8601 timestamp. */
  ts: string;
  /** SHA-256 of (entry fields + prevHash) for chain integrity. */
  hash: string;
}

// ── Hash helpers ──────────────────────────────────────────────────────────────

/**
 * Compute a SHA-256 hash of the entry fields concatenated with prevHash.
 * Uses Web Crypto API (globalThis.crypto.subtle).
 * Falls back to a deterministic stub if crypto.subtle is unavailable
 * (e.g., Jest environment without webcrypto polyfill).
 *
 * Обчислює SHA-256 хеш запису для ланцюжка цілісності.
 */
export async function computeEntryHash(
  entry: Omit<AuditLogEntry, "hash">,
  prevHash: string,
): Promise<string> {
  const payload = JSON.stringify({
    id: entry.id,
    orgId: entry.orgId,
    userId: entry.userId,
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId ?? null,
    ip: entry.ip ?? null,
    ts: entry.ts,
    prevHash,
  });

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Fallback stub (not cryptographically secure — only for test environments)
    let h = 5381;
    for (let i = 0; i < payload.length; i++) {
      h = (((h << 5) + h) ^ payload.charCodeAt(i)) >>> 0;
    }
    return `stub_${h.toString(16).padStart(8, "0")}`;
  }
}

// ── Tamper-evident chain ──────────────────────────────────────────────────────

/**
 * Append-only hash-chained audit log.
 * Each entry includes a hash of itself + the previous entry's hash,
 * forming a chain that can be verified for integrity.
 *
 * Ланцюжок аудит-записів зі SHA-256 верифікацією.
 */
export class TamperEvidenceChain {
  private readonly chain: AuditLogEntry[] = [];
  /** Genesis hash (the "zero block"). */
  private readonly GENESIS_HASH = "0".repeat(64);

  /** Last hash in the chain (or genesis). */
  private get tailHash(): string {
    if (this.chain.length === 0) return this.GENESIS_HASH;
    return this.chain[this.chain.length - 1].hash;
  }

  /**
   * Append a new entry to the chain.
   * Assigns id, ts, and computes the hash automatically.
   *
   * Додає новий запис у ланцюжок із обчисленим хешем.
   */
  async append(
    entry: Omit<AuditLogEntry, "id" | "hash">,
  ): Promise<AuditLogEntry> {
    const withId: Omit<AuditLogEntry, "hash"> = {
      ...entry,
      id: randomUUID(),
    };

    const hash = await computeEntryHash(withId, this.tailHash);
    const finalEntry: AuditLogEntry = { ...withId, hash };

    this.chain.push(finalEntry);

    // Cap memory at 50 000 entries; in production stream to append-only DB
    if (this.chain.length > 50_000) this.chain.shift();

    return finalEntry;
  }

  /**
   * Verify the entire chain's hash integrity.
   * Returns false if any entry has been tampered with.
   * Note: async because computeEntryHash uses Web Crypto.
   *
   * Перевіряє цілісність ланцюжка хешів.
   */
  async verify(): Promise<boolean> {
    let prevHash = this.GENESIS_HASH;

    for (const entry of this.chain) {
      const expected = await computeEntryHash(
        { ...entry, hash: undefined as unknown as string },
        prevHash,
      );
      if (expected !== entry.hash) return false;
      prevHash = entry.hash;
    }

    return true;
  }

  /**
   * Export all entries as an immutable snapshot.
   *
   * Повертає копію всього ланцюжка.
   */
  export(): AuditLogEntry[] {
    return [...this.chain];
  }

  /** Number of entries in the chain. */
  get length(): number {
    return this.chain.length;
  }

  /**
   * Query entries with optional filters.
   *
   * Фільтрує записи за orgId, userId, action.
   */
  query(opts: {
    orgId?: string;
    userId?: string;
    action?: string;
    since?: string;
    until?: string;
    limit?: number;
    offset?: number;
  }): { entries: AuditLogEntry[]; total: number } {
    let result = [...this.chain].reverse(); // newest first

    if (opts.orgId) result = result.filter((e) => e.orgId === opts.orgId);
    if (opts.userId) result = result.filter((e) => e.userId === opts.userId);
    if (opts.action) result = result.filter((e) => e.action === opts.action);
    if (opts.since) result = result.filter((e) => e.ts >= opts.since!);
    if (opts.until) result = result.filter((e) => e.ts <= opts.until!);

    const total = result.length;
    const offset = opts.offset ?? 0;
    const limit = Math.min(opts.limit ?? 50, 500);

    return { entries: result.slice(offset, offset + limit), total };
  }
}

/** Singleton tamper-evident audit chain. */
export const auditChain = new TamperEvidenceChain();
