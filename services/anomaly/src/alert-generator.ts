/**
 * Anomaly alert generator — fires when anomaly detectors exceed thresholds.
 *
 * Connects: baseline.ts (Z-score) + spatial-cluster.ts (DBSCAN)
 *           + source-burst.ts (HHI) → AnomalyAlert
 */

export type AnomalyAlertSeverity = "info" | "warning" | "critical";
export type AnomalyAlertType =
  | "time_series_spike"     // Z-score threshold crossed
  | "spatial_surge"         // DBSCAN cluster detected
  | "source_burst"          // Single source dominating (misinfo risk)
  | "topic_drift"           // Embedding-space shift (future)
  | "combined";             // Multiple signals co-occurring

export interface AnomalyAlert {
  alertId: string;
  type: AnomalyAlertType;
  severity: AnomalyAlertSeverity;
  regionCode?: string;
  eventClass?: string;
  /** What triggered this alert */
  triggerSignals: Array<{
    source: "z_score" | "dbscan" | "hhi" | "ewma";
    value: number;
    threshold: number;
  }>;
  /** Human-readable explanation */
  explanationEn: string;
  explanationUk: string;
  /** ISO-8601 */
  detectedAt: string;
  /** Number of events in the anomalous window */
  eventCount?: number;
  /** Baseline event count for comparison */
  baselineCount?: number;
  /** Whether a human reviewer has acknowledged this */
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

// ── In-memory store (replace with Postgres in production) ────────────────────

const alerts: AnomalyAlert[] = [];
let counter = 0;

export function generateAlert(params: {
  type: AnomalyAlertType;
  severity: AnomalyAlertSeverity;
  regionCode?: string;
  eventClass?: string;
  triggerSignals: AnomalyAlert["triggerSignals"];
  eventCount?: number;
  baselineCount?: number;
}): AnomalyAlert {
  const alertId = `anom-${++counter}-${Date.now()}`;
  const { regionCode = "unknown", eventClass = "unknown", eventCount, baselineCount } = params;

  const ratio = baselineCount && baselineCount > 0 && eventCount
    ? (eventCount / baselineCount).toFixed(1)
    : "N/A";

  const explanationEn = buildExplanation(params.type, regionCode, eventClass, ratio, "en");
  const explanationUk = buildExplanation(params.type, regionCode, eventClass, ratio, "uk");

  const alert: AnomalyAlert = {
    alertId,
    type: params.type,
    severity: params.severity,
    regionCode,
    eventClass,
    triggerSignals: params.triggerSignals,
    explanationEn,
    explanationUk,
    detectedAt: new Date().toISOString(),
    eventCount,
    baselineCount,
    acknowledged: false,
  };

  alerts.push(alert);
  return alert;
}

function buildExplanation(
  type: AnomalyAlertType,
  region: string,
  cls: string,
  ratio: string,
  lang: "en" | "uk",
): string {
  const templates: Record<AnomalyAlertType, { en: string; uk: string }> = {
    time_series_spike: {
      en: `Spike detected: ${cls} events in ${region} are ${ratio}× above baseline.`,
      uk: `Пік виявлено: події класу ${cls} в ${region} у ${ratio}× перевищують базову лінію.`,
    },
    spatial_surge: {
      en: `Geographic cluster of ${cls} events detected in ${region}.`,
      uk: `Виявлено географічний кластер подій класу ${cls} в ${region}.`,
    },
    source_burst: {
      en: `Source diversity collapse in ${region} (${cls}): single channel dominates — possible coordinated posting.`,
      uk: `Колапс різноманітності джерел у ${region} (${cls}): одне джерело домінує — можливе координоване поширення.`,
    },
    topic_drift: {
      en: `New topic cluster emerging in ${region} — embedding-space drift detected.`,
      uk: `Новий тематичний кластер формується у ${region} — виявлено дрейф простору ембедингів.`,
    },
    combined: {
      en: `Multiple anomaly signals co-occurring for ${cls} in ${region}: ${ratio}× baseline with source concentration.`,
      uk: `Кілька аномальних сигналів одночасно для ${cls} в ${region}: ${ratio}× базової лінії з концентрацією джерел.`,
    },
  };
  return templates[type][lang];
}

export function acknowledgeAlert(alertId: string, userId: string): boolean {
  const alert = alerts.find((a) => a.alertId === alertId);
  if (!alert) return false;
  alert.acknowledged = true;
  alert.acknowledgedBy = userId;
  alert.acknowledgedAt = new Date().toISOString();
  return true;
}

export function listAlerts(opts: {
  severity?: AnomalyAlertSeverity;
  acknowledged?: boolean;
  regionCode?: string;
  limit?: number;
} = {}): AnomalyAlert[] {
  let result = [...alerts];
  if (opts.severity) result = result.filter((a) => a.severity === opts.severity);
  if (opts.acknowledged !== undefined) result = result.filter((a) => a.acknowledged === opts.acknowledged);
  if (opts.regionCode) result = result.filter((a) => a.regionCode === opts.regionCode);
  result.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
  return result.slice(0, opts.limit ?? 50);
}

/**
 * Evaluate a Z-score result and generate an alert if threshold exceeded.
 * Called by the baseline detector on each new event.
 */
export function evaluateZScore(params: {
  zScore: number;
  regionCode: string;
  eventClass: string;
  eventCount: number;
  baselineCount: number;
}): AnomalyAlert | null {
  const { zScore, regionCode, eventClass, eventCount, baselineCount } = params;
  if (zScore < 2.0) return null; // below threshold

  const severity: AnomalyAlertSeverity =
    zScore >= 5.0 ? "critical" : zScore >= 3.0 ? "warning" : "info";

  return generateAlert({
    type: "time_series_spike",
    severity,
    regionCode,
    eventClass,
    triggerSignals: [{ source: "z_score", value: parseFloat(zScore.toFixed(2)), threshold: 2.0 }],
    eventCount,
    baselineCount,
  });
}

/**
 * Evaluate HHI (source diversity) and generate a burst alert.
 */
export function evaluateSourceDiversity(params: {
  hhi: number;
  regionCode: string;
  topic: string;
  dominantSourceId: string;
}): AnomalyAlert | null {
  const { hhi, regionCode, topic } = params;
  if (hhi < 0.5) return null; // acceptable diversity

  const severity: AnomalyAlertSeverity = hhi >= 0.8 ? "critical" : hhi >= 0.65 ? "warning" : "info";

  return generateAlert({
    type: "source_burst",
    severity,
    regionCode,
    eventClass: topic,
    triggerSignals: [{ source: "hhi", value: parseFloat(hhi.toFixed(3)), threshold: 0.5 }],
  });
}
