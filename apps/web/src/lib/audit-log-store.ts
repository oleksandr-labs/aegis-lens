import "server-only";
import { randomUUID } from "crypto";

export type AuditAction =
  | "user.login"
  | "user.logout"
  | "user.password_changed"
  | "user.mfa_enabled"
  | "user.mfa_disabled"
  | "api_key.created"
  | "api_key.revoked"
  | "api_key.deleted"
  | "alert.created"
  | "alert.updated"
  | "alert.deleted"
  | "webhook.created"
  | "webhook.updated"
  | "webhook.deleted"
  | "case.created"
  | "case.updated"
  | "case.deleted"
  | "aoi.created"
  | "aoi.deleted"
  | "preset.created"
  | "preset.deleted"
  | "export.created"
  | "member.invited"
  | "member.removed"
  | "member.role_changed"
  | "org.settings_changed"
  | "review.decision_submitted";

export interface AuditEntry {
  id: string;
  action: AuditAction;
  actorId: string;
  actorType: "user" | "api_key" | "system";
  orgId: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  occurredAt: string;
}

const entries: AuditEntry[] = [];

export function writeAuditEntry(
  data: Omit<AuditEntry, "id" | "occurredAt">,
): AuditEntry {
  const entry: AuditEntry = {
    id: randomUUID(),
    ...data,
    occurredAt: new Date().toISOString(),
  };
  // Prepend so newest first
  entries.unshift(entry);
  // Cap at 10k in-memory entries
  if (entries.length > 10_000) entries.splice(10_000);
  return entry;
}

export interface AuditQueryOpts {
  orgId?: string;
  actorId?: string;
  action?: AuditAction;
  targetType?: string;
  targetId?: string;
  since?: string; // ISO 8601
  until?: string;
  limit?: number;
  offset?: number;
}

export function queryAuditLog(opts: AuditQueryOpts = {}): { entries: AuditEntry[]; total: number } {
  let result = entries.slice();
  if (opts.orgId) result = result.filter((e) => e.orgId === opts.orgId);
  if (opts.actorId) result = result.filter((e) => e.actorId === opts.actorId);
  if (opts.action) result = result.filter((e) => e.action === opts.action);
  if (opts.targetType) result = result.filter((e) => e.targetType === opts.targetType);
  if (opts.targetId) result = result.filter((e) => e.targetId === opts.targetId);
  if (opts.since) result = result.filter((e) => e.occurredAt >= opts.since!);
  if (opts.until) result = result.filter((e) => e.occurredAt <= opts.until!);

  const total = result.length;
  const offset = opts.offset ?? 0;
  const limit = Math.min(opts.limit ?? 50, 200);
  return { entries: result.slice(offset, offset + limit), total };
}

// Seed demo audit entries
const DEMO_ACTIONS: AuditAction[] = [
  "user.login", "alert.created", "export.created", "webhook.created",
  "case.created", "review.decision_submitted", "api_key.created",
];

for (let i = 0; i < 20; i++) {
  writeAuditEntry({
    action: DEMO_ACTIONS[i % DEMO_ACTIONS.length],
    actorId: `user-demo-${i % 3}`,
    actorType: "user",
    orgId: "org-demo",
    targetType: "event",
    targetId: `event-${i}`,
    ipAddress: "192.0.2.1",
  });
}
