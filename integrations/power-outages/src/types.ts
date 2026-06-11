export type OutageSignalSource =
  | "cloudflare_radar"   // internet quality drop → proxy for power
  | "community_report"   // opt-in user reports
  | "telegram_channel"   // monitored outage channels (e.g. DTEK, Ukrenergo)
  | "scheduled_blackout" // official Ukrenergo schedule
  | "viirs_nightlights"; // satellite night-lights anomaly

export type OutageCause = "damage" | "scheduled" | "weather" | "unknown";

export type OutageStatus = "active" | "partial" | "restored" | "scheduled";

export interface OutageSignal {
  source: OutageSignalSource;
  regionCode: string;     // ISO 3166-2:UA oblast code e.g. "UA-63"
  confidence: number;     // 0–1
  detectedAt: string;     // ISO 8601
  cause: OutageCause;
  estimatedCoverage?: number; // 0–1 fraction of region affected
  rawData?: Record<string, unknown>;
}

export interface OutageEvent {
  outageId: string;
  regionCode: string;
  regionName: string;
  status: OutageStatus;
  cause: OutageCause;
  /** Aggregate confidence from all contributing signals. */
  confidence: number;
  /** Fraction of region estimated without power: 0–1 */
  coverage: number;
  /** Severity 1–5 derived from coverage + cause */
  severity: 1 | 2 | 3 | 4 | 5;
  startedAt: string;
  estimatedRestorationAt: string | null;
  restoredAt: string | null;
  signals: OutageSignal[];
  summaryEn: string;
  summaryUk: string;
}

export interface OutageLayer {
  generatedAt: string;
  events: OutageEvent[];
  meta: {
    total: number;
    active: number;
    scheduled: number;
    restored: number;
  };
}
