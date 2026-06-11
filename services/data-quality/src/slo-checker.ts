/**
 * SLO checker: compare measured metrics against per-source SLOs
 * and produce violations for alerting.
 */

import type { SourceSLO, SourceMetrics, SLOViolation } from "./types";

export const DEFAULT_SLOS: Record<string, Partial<SourceSLO>> = {
  nasa_firms: { maxFreshnessMinutes: 180, minDailyEvents: 5 },
  telegram: { maxFreshnessMinutes: 60, minDailyEvents: 50 },
  twitter: { maxFreshnessMinutes: 30, minDailyEvents: 20 },
  opensky: { maxFreshnessMinutes: 10, minDailyEvents: 100 },
  ais: { maxFreshnessMinutes: 15, minDailyEvents: 50 },
  sentinel_hub: { maxFreshnessMinutes: 1440, minDailyEvents: 1 },
  youtube: { maxFreshnessMinutes: 720, minDailyEvents: 2 },
  reddit: { maxFreshnessMinutes: 60, minDailyEvents: 10 },
  "open-meteo": { maxFreshnessMinutes: 60, minDailyEvents: 10 },
};

const PIPELINE_LAG_THRESHOLDS = {
  ingestToNormalize: 60,    // seconds
  normalizeToEnrich: 120,
  enrichToIndex: 60,
  endToEnd: 300,
};

export function checkSLOs(
  metrics: SourceMetrics,
  slo: SourceSLO,
): SLOViolation[] {
  const violations: SLOViolation[] = [];
  const now = metrics.measuredAt;

  // Freshness
  if (metrics.minutesSinceLastEvent > slo.maxFreshnessMinutes * 2) {
    violations.push({
      sourceId: metrics.sourceId,
      kind: "stale_source",
      severity: "critical",
      message: `Source silent for ${metrics.minutesSinceLastEvent} minutes (SLO: ${slo.maxFreshnessMinutes})`,
      measuredValue: metrics.minutesSinceLastEvent,
      threshold: slo.maxFreshnessMinutes,
      detectedAt: now,
    });
  } else if (metrics.minutesSinceLastEvent > slo.maxFreshnessMinutes) {
    violations.push({
      sourceId: metrics.sourceId,
      kind: "stale_source",
      severity: "warning",
      message: `Source delayed: ${metrics.minutesSinceLastEvent} minutes (SLO: ${slo.maxFreshnessMinutes})`,
      measuredValue: metrics.minutesSinceLastEvent,
      threshold: slo.maxFreshnessMinutes,
      detectedAt: now,
    });
  }

  // Volume
  if (metrics.eventsLast24h < slo.minDailyEvents * 0.5) {
    violations.push({
      sourceId: metrics.sourceId,
      kind: "low_volume",
      severity: "critical",
      message: `Only ${metrics.eventsLast24h} events in 24h (SLO: ${slo.minDailyEvents})`,
      measuredValue: metrics.eventsLast24h,
      threshold: slo.minDailyEvents,
      detectedAt: now,
    });
  } else if (metrics.eventsLast24h < slo.minDailyEvents) {
    violations.push({
      sourceId: metrics.sourceId,
      kind: "low_volume",
      severity: "warning",
      message: `Low volume: ${metrics.eventsLast24h} events in 24h (SLO: ${slo.minDailyEvents})`,
      measuredValue: metrics.eventsLast24h,
      threshold: slo.minDailyEvents,
      detectedAt: now,
    });
  }

  // Schema conformance
  if (metrics.schemaConformanceRate < 0.8) {
    violations.push({
      sourceId: metrics.sourceId,
      kind: "schema_drift",
      severity: "critical",
      message: `Schema conformance ${(metrics.schemaConformanceRate * 100).toFixed(0)}% (SLO: 80%)`,
      measuredValue: metrics.schemaConformanceRate,
      threshold: 0.8,
      detectedAt: now,
    });
  }

  // Verification yield
  if (slo.minVerificationYield !== undefined) {
    const yieldPct = metrics.verificationYield * 100;
    if (yieldPct < slo.minVerificationYield * 0.5) {
      violations.push({
        sourceId: metrics.sourceId,
        kind: "low_verification_yield",
        severity: "critical",
        message: `Verification yield ${yieldPct.toFixed(0)}% (SLO: ${slo.minVerificationYield}%)`,
        measuredValue: metrics.verificationYield,
        threshold: slo.minVerificationYield / 100,
        detectedAt: now,
      });
    }
  }

  // Pipeline lag
  for (const [stage, threshold] of Object.entries(PIPELINE_LAG_THRESHOLDS) as [keyof typeof PIPELINE_LAG_THRESHOLDS, number][]) {
    const lag = metrics.stageLagSeconds[stage];
    if (lag > threshold * 3) {
      violations.push({
        sourceId: metrics.sourceId,
        kind: "high_ingest_lag",
        severity: "critical",
        message: `Stage ${stage}: ${lag}s lag (SLO: ${threshold}s)`,
        measuredValue: lag,
        threshold,
        detectedAt: now,
      });
    } else if (lag > threshold) {
      violations.push({
        sourceId: metrics.sourceId,
        kind: "high_ingest_lag",
        severity: "warning",
        message: `Stage ${stage}: ${lag}s lag (SLO: ${threshold}s)`,
        measuredValue: lag,
        threshold,
        detectedAt: now,
      });
    }
  }

  return violations;
}

export function buildSLO(sourceId: string, overrides?: Partial<SourceSLO>): SourceSLO {
  const defaults = DEFAULT_SLOS[sourceId] ?? {};
  return {
    sourceId,
    maxFreshnessMinutes: 120,
    minDailyEvents: 10,
    requiredFields: ["eventId", "class", "severity", "occurredAt"],
    ...defaults,
    ...overrides,
  };
}
