/**
 * Audit log helpers for the Aegis Lens Knowledge Graph.
 *
 * Every mutation to an Entity (create / update / retract / restore) should
 * produce an AuditEntry so the full provenance chain is queryable.
 */

import type { Entity, EntityId } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────

export interface AuditEntry {
  /** Unique log line identifier (UUID v4 or similar). */
  entryId: string;
  entityId: EntityId;
  action: "create" | "update" | "retract" | "restore";
  /** List of top-level field names (or dot-paths) that changed. */
  changedFields: string[];
  changedBy: string;
  /** ISO-8601 timestamp of the change. */
  changedAt: string;
  /** Snapshot of previous values for audited fields (omitted on create). */
  previousValues?: Record<string, unknown>;
  /** Optional human-readable explanation, required for retract actions. */
  reason?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Generate a simple random entryId.
 * Uses crypto.randomUUID when available, falls back to a timestamp+random hex.
 */
function generateEntryId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  const ts = Date.now().toString(16);
  const rand = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
  return `${ts}-${rand}`;
}

/**
 * Build a minimal AuditEntry for an entity mutation.
 *
 * Callers are responsible for supplying `previousValues` and `reason`
 * when relevant; this function stamps the timestamp and generates the id.
 */
export function buildAuditEntry(
  entityId: EntityId,
  action: AuditEntry["action"],
  changedBy: string,
  changedFields: string[],
  options?: {
    previousValues?: Record<string, unknown>;
    reason?: string;
  },
): AuditEntry {
  const entry: AuditEntry = {
    entryId: generateEntryId(),
    entityId,
    action,
    changedFields,
    changedBy,
    changedAt: new Date().toISOString(),
  };

  if (options?.previousValues !== undefined) {
    entry.previousValues = options.previousValues;
  }
  if (options?.reason !== undefined) {
    entry.reason = options.reason;
  }

  return entry;
}

// ── Retraction helpers ────────────────────────────────────────────────────

/**
 * Returns true if the entity has been soft-deleted (retracted).
 * Checks `attributes.retractedAt` for a non-empty string.
 */
export function isRetracted(entity: Entity): boolean {
  const retractedAt = entity.attributes["retractedAt"];
  return typeof retractedAt === "string" && retractedAt.length > 0;
}

/**
 * Mark an entity as retracted (soft-delete).
 *
 * Sets `attributes.retractedAt` to the current ISO timestamp and
 * `attributes.retractedReason` to the provided reason.
 *
 * Returns a new entity object (immutable update) — does NOT persist.
 * Callers must persist + record the returned AuditEntry themselves.
 */
export function retractEntity(
  entity: Entity,
  reason: string,
  retractedBy: string,
): { entity: Entity; auditEntry: AuditEntry } {
  const now = new Date().toISOString();

  const updatedEntity: Entity = {
    ...entity,
    attributes: {
      ...entity.attributes,
      retractedAt: now,
      retractedReason: reason,
      retractedBy,
    },
    updatedAt: now,
  };

  const auditEntry = buildAuditEntry(
    entity.id,
    "retract",
    retractedBy,
    ["attributes.retractedAt", "attributes.retractedReason", "attributes.retractedBy"],
    {
      previousValues: {
        retractedAt: entity.attributes["retractedAt"] ?? null,
      },
      reason,
    },
  );

  return { entity: updatedEntity, auditEntry };
}
