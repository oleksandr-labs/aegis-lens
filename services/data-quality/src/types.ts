export interface SourceSLO {
  sourceId: string;
  /** Maximum acceptable gap between events in minutes */
  maxFreshnessMinutes: number;
  /** Minimum events expected per day */
  minDailyEvents: number;
  /** Required fields that must be non-null */
  requiredFields: string[];
  /** Minimum verification yield % (0–100) */
  minVerificationYield?: number;
}

export interface SourceMetrics {
  sourceId: string;
  measuredAt: string;
  /** Minutes since last event received */
  minutesSinceLastEvent: number;
  eventsLast24h: number;
  schemaConformanceRate: number;
  verificationYield: number;
  /** Pipeline lag in seconds per stage */
  stageLagSeconds: {
    ingestToNormalize: number;
    normalizeToEnrich: number;
    enrichToIndex: number;
    endToEnd: number;
  };
}

export interface SLOViolation {
  sourceId: string;
  kind:
    | "stale_source"
    | "low_volume"
    | "schema_drift"
    | "low_verification_yield"
    | "high_ingest_lag"
    | "distribution_drift";
  severity: "warning" | "critical";
  message: string;
  measuredValue: number;
  threshold: number;
  detectedAt: string;
}

export interface DistributionSnapshot {
  sourceId: string;
  field: string;
  /** value → count over last 24h */
  distribution: Record<string, number>;
  capturedAt: string;
}
