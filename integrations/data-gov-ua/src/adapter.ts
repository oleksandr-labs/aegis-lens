/**
 * Adapter: normalize civic-tech records → the platform's canonical model.
 *
 * Unlike kinetic sources, this integration is ENTITY-centric, not event-centric:
 * its primary output is the KG RegistryEntity (`kg-enrichment.ts`). The canonical
 * Event schema (packages/event-schema/src/v1.ts) is event-shaped, so we only emit
 * Events for the few civic facts that ARE events with a time + place — e.g. a
 * material public-procurement AWARD (a discrete, dated, located transaction).
 *
 * Mapping decisions:
 *   - Prozorro award → class "other" (no kinetic class fits; subclass
 *     "procurement_award"), source type "api".
 *   - confidence: Prozorro is official open data → high baseline (0.85).
 *   - verification "verified" (it is an authoritative government record).
 *   - severity scaled by award value (a proxy for materiality, NOT danger).
 *
 * We deliberately do NOT fabricate Events from registry rows (a company existing
 * is not an event). Entity enrichment stays in the KG path.
 */

import type { ProcurementTender } from "./types";

// Minimal local mirror of the canonical event shape (avoid cross-package build
// coupling; field names match packages/event-schema/src/v1.ts AegisEventV1).
export interface CanonicalEvent {
  eventId: string;
  schemaVersion: "1.0.0";
  class: "other";
  subclass?: string;
  country: string;
  severity: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  verificationState: "verified" | "unverified" | "in_review";
  occurredAt: string;
  ingestedAt: string;
  updatedAt: string;
  title: { en?: string; uk?: string };
  summary?: { en?: string; uk?: string };
  citations: Array<{ sourceId: string; sourceType: "api"; url?: string; capturedAt?: string }>;
  orgId: string;
  isPublic: boolean;
  isRetracted: boolean;
}

const DEFAULT_ORG = "aegis-public";

/** Materiality severity from award value (UAH) — a salience proxy, not danger. */
function awardSeverity(amountUah?: number): 1 | 2 | 3 | 4 | 5 {
  const v = amountUah ?? 0;
  if (v >= 100_000_000) return 5;
  if (v >= 10_000_000) return 4;
  if (v >= 1_000_000) return 3;
  if (v >= 100_000) return 2;
  return 1;
}

/** Map a completed/awarded Prozorro tender → a canonical Event. */
export function adaptProcurementAward(
  tender: ProcurementTender,
  orgId = DEFAULT_ORG,
  isPublic = true,
): CanonicalEvent | null {
  // Only awarded/complete tenders represent a discrete transaction event.
  if (tender.status !== "complete" && tender.status !== "active.awarded") return null;
  const now = new Date().toISOString();
  const amount = tender.amountUah;
  return {
    eventId: `data-gov-ua:prozorro:${tender.tenderId}`,
    schemaVersion: "1.0.0",
    class: "other",
    subclass: "procurement_award",
    country: "UA",
    severity: awardSeverity(amount),
    confidence: 0.85,
    verificationState: "verified",
    occurredAt: tender.date,
    ingestedAt: now,
    updatedAt: now,
    title: {
      en: `Procurement award: ${tender.title.en}`,
      uk: `Закупівля (рішення): ${tender.title.uk ?? tender.title.en}`,
    },
    summary: {
      en: `${tender.buyerName.en} → ${tender.supplierName?.en ?? "supplier"}${amount ? ` (₴${amount.toLocaleString("en")})` : ""}.`,
      uk: `${tender.buyerName.uk ?? tender.buyerName.en} → ${tender.supplierName?.uk ?? tender.supplierName?.en ?? "постачальник"}${amount ? ` (₴${amount.toLocaleString("uk")})` : ""}.`,
    },
    citations: [
      { sourceId: "prozorro", sourceType: "api", url: tender.url, capturedAt: now },
    ],
    orgId,
    isPublic,
    isRetracted: false,
  };
}

/** Adapt a batch of tenders → events (skips non-award tenders). */
export function adaptTenders(tenders: ProcurementTender[]): CanonicalEvent[] {
  const out: CanonicalEvent[] = [];
  for (const t of tenders) {
    const ev = adaptProcurementAward(t);
    if (ev) out.push(ev);
  }
  return out;
}
