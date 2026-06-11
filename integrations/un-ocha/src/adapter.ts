/**
 * Adapter: normalize UN OCHA / ReliefWeb / DTM / cluster records → canonical
 * Aegis Lens Event (packages/event-schema v1).
 *
 * Mapping decisions:
 *   - DTM displacement   → class "displacement"
 *   - cluster reports    → class "humanitarian"
 *   - ReliefWeb sitreps  → class "humanitarian"
 *   - source type        → "api"
 *   - confidence: humanitarian sources are official/clustered → high baseline,
 *     modulated by recency; verification "verified" for OCHA/cluster outputs.
 *
 * PII INVARIANT: every event produced here is passed through the strict redactor
 * (`assertRedacted`) before return. If redaction fails closed, the record is
 * DROPPED (not emitted) — see report-ingest.ts which counts blocked records.
 */

import type {
  DtmDisplacementRecord,
  ClusterReport,
  ReliefWebReport,
} from "./types";
import { CLUSTER_META } from "./clusters";
import { redactRecord, coarsenCoord } from "./pii-redaction";

// Minimal local mirror of the canonical event shape (avoid cross-package build
// coupling; field names match packages/event-schema/src/v1.ts AegisEventV1).
export interface CanonicalEvent {
  eventId: string;
  schemaVersion: "1.0.0";
  class: "humanitarian" | "displacement";
  subclass?: string;
  location?: { lat: number; lon: number; uncertaintyM?: number };
  country: string;
  regionCode?: string;
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

/** Confidence: official humanitarian baseline 0.85, decayed gently with age. */
function humanitarianConfidence(reportingIso: string): number {
  const ageDays = Math.max(0, (Date.now() - Date.parse(reportingIso)) / 86_400_000);
  const recency = Math.max(0, 1 - ageDays / 120); // ~4-month horizon
  return Math.round((0.6 + 0.3 * recency) * 100) / 100;
}

/** Displacement severity bands from IDP individual counts. */
function displacementSeverity(individuals: number): 1 | 2 | 3 | 4 | 5 {
  if (individuals >= 500_000) return 5;
  if (individuals >= 250_000) return 4;
  if (individuals >= 100_000) return 3;
  if (individuals >= 25_000) return 2;
  return 1;
}

function finalize<T extends CanonicalEvent>(ev: T): CanonicalEvent | null {
  const r = redactRecord(ev);
  return r.ok ? (r.value as CanonicalEvent) : null;
}

/** DTM record → displacement event. */
export function adaptDtm(rec: DtmDisplacementRecord, orgId = DEFAULT_ORG, isPublic = true): CanonicalEvent | null {
  const now = new Date().toISOString();
  const sev = displacementSeverity(rec.individuals);
  const loc = rec.centroid ? coarsenCoord(rec.centroid, 2) : undefined;
  const measureLabel = {
    stock: { en: "present IDPs", uk: "наявних ВПО" },
    flow_in: { en: "IDP arrivals", uk: "прибуття ВПО" },
    flow_out: { en: "IDP departures", uk: "вибуття ВПО" },
    returnee: { en: "returnees", uk: "поверненців" },
  }[rec.measure];

  const ev: CanonicalEvent = {
    eventId: `un-ocha:${rec.id}`,
    schemaVersion: "1.0.0",
    class: "displacement",
    subclass: rec.measure,
    location: loc,
    country: rec.country,
    regionCode: rec.admin1Pcode ? `UA-${rec.admin1Pcode.replace(/^UA/i, "")}` : undefined,
    severity: sev,
    confidence: humanitarianConfidence(rec.reportingDate),
    verificationState: "verified",
    occurredAt: rec.reportingDate,
    ingestedAt: now,
    updatedAt: now,
    title: {
      en: `${rec.individuals.toLocaleString("en")} ${measureLabel.en} — ${rec.admin1Name}`,
      uk: `${rec.individuals.toLocaleString("uk")} ${measureLabel.uk} — ${rec.admin1Name}`,
    },
    summary: {
      en: `IOM DTM round ${rec.roundNumber ?? "?"}: ${rec.individuals.toLocaleString("en")} ${measureLabel.en} in ${rec.admin1Name}.`,
      uk: `IOM DTM, раунд ${rec.roundNumber ?? "?"}: ${rec.individuals.toLocaleString("uk")} ${measureLabel.uk} у регіоні ${rec.admin1Name}.`,
    },
    citations: [{ sourceId: rec.source, sourceType: "api", url: rec.url, capturedAt: now }],
    orgId,
    isPublic,
    isRetracted: false,
  };
  return finalize(ev);
}

/** Cluster report → humanitarian event. */
export function adaptClusterReport(rep: ClusterReport, orgId = DEFAULT_ORG, isPublic = true): CanonicalEvent | null {
  const now = new Date().toISOString();
  const meta = CLUSTER_META[rep.cluster];
  const loc = rep.centroid ? coarsenCoord(rep.centroid, 2) : undefined;

  const ev: CanonicalEvent = {
    eventId: `un-ocha:${rep.id}`,
    schemaVersion: "1.0.0",
    class: "humanitarian",
    subclass: rep.cluster,
    location: loc,
    country: rep.country,
    regionCode: rep.admin1Pcode ? `UA-${rep.admin1Pcode.replace(/^UA/i, "")}` : undefined,
    severity: rep.severity,
    confidence: humanitarianConfidence(rep.reportingPeriod.startsWith("2026") ? `${rep.reportingPeriod.slice(0, 4)}-01-01` : new Date().toISOString()),
    verificationState: "verified",
    occurredAt: rep.reportingPeriod.length === 10 ? rep.reportingPeriod : `${rep.reportingPeriod.slice(0, 4)}-01-01`,
    ingestedAt: now,
    updatedAt: now,
    title: {
      en: `${meta.nameEn} cluster${rep.admin1Name ? ` — ${rep.admin1Name}` : ""}`,
      uk: `Кластер «${meta.nameUk}»${rep.admin1Name ? ` — ${rep.admin1Name}` : ""}`,
    },
    summary: { en: rep.summary.en, uk: rep.summary.uk },
    citations: [{ sourceId: rep.source, sourceType: "api", url: rep.url, capturedAt: now }],
    orgId,
    isPublic,
    isRetracted: false,
  };
  return finalize(ev);
}

/** ReliefWeb situation report → humanitarian event (no geometry; country-level). */
export function adaptReliefWebReport(rep: ReliefWebReport, orgId = DEFAULT_ORG, isPublic = true): CanonicalEvent | null {
  const now = new Date().toISOString();
  const ev: CanonicalEvent = {
    eventId: `un-ocha:rw-${rep.id}`,
    schemaVersion: "1.0.0",
    class: "humanitarian",
    subclass: rep.cluster ?? "situation_report",
    country: rep.countries[0] ?? "UA",
    severity: 3,
    confidence: humanitarianConfidence(rep.publishedAt),
    verificationState: "verified",
    occurredAt: rep.publishedAt,
    ingestedAt: now,
    updatedAt: now,
    title: { en: rep.title },
    summary: { en: (rep.body ?? rep.title).slice(0, 280) },
    citations: [
      { sourceId: rep.source.join(", ") || "ReliefWeb", sourceType: "api", url: rep.url, capturedAt: now },
    ],
    orgId,
    isPublic,
    isRetracted: false,
  };
  return finalize(ev);
}
