import "server-only";

// ---------------------------------------------------------------------------
// Prometheus-compatible Metrics Registry
// Exposes /api/metrics for Prometheus scrape
// ---------------------------------------------------------------------------

export type MetricType = "counter" | "gauge" | "histogram";

export interface MetricDef {
  name: string;
  type: MetricType;
  help: string;
  labels: string[];
}

// ---------------------------------------------------------------------------
// Metric definitions — 15 core Aegis metrics
// ---------------------------------------------------------------------------

export const AEGIS_METRICS: MetricDef[] = [
  {
    name: "aegis_events_ingested_total",
    type: "counter",
    help: "Total number of OSINT events ingested",
    labels: ["source", "class"],
  },
  {
    name: "aegis_api_requests_total",
    type: "counter",
    help: "Total number of API requests",
    labels: ["method", "endpoint", "status"],
  },
  {
    name: "aegis_api_latency_ms",
    type: "histogram",
    help: "API request latency in milliseconds",
    labels: ["endpoint"],
  },
  {
    name: "aegis_source_freshness_seconds",
    type: "gauge",
    help: "Seconds since last successful fetch per source",
    labels: ["source"],
  },
  {
    name: "aegis_tile_cache_hit_ratio",
    type: "gauge",
    help: "Cache hit ratio for map tile requests (0-1)",
    labels: ["layer"],
  },
  {
    name: "aegis_llm_cost_usd_total",
    type: "counter",
    help: "Cumulative LLM cost in USD",
    labels: ["provider", "model"],
  },
  {
    name: "aegis_alert_delivery_latency_ms",
    type: "histogram",
    help: "End-to-end alert delivery latency in milliseconds",
    labels: ["channel"],
  },
  {
    name: "aegis_active_users",
    type: "gauge",
    help: "Number of active users in the last 5 minutes",
    labels: [],
  },
  {
    name: "aegis_search_latency_ms",
    type: "histogram",
    help: "Search query latency in milliseconds",
    labels: ["index"],
  },
  {
    name: "aegis_ingest_errors_total",
    type: "counter",
    help: "Total number of ingest pipeline errors",
    labels: ["source", "error_type"],
  },
  {
    name: "aegis_qdrant_query_latency_ms",
    type: "histogram",
    help: "Qdrant vector search latency in milliseconds",
    labels: ["collection"],
  },
  {
    name: "aegis_qdrant_vectors_total",
    type: "gauge",
    help: "Total number of vectors stored in Qdrant",
    labels: ["collection"],
  },
  {
    name: "aegis_source_health_checks_total",
    type: "counter",
    help: "Total synthetic health checks performed per source",
    labels: ["source", "result"],
  },
  {
    name: "aegis_llm_tokens_total",
    type: "counter",
    help: "Total LLM tokens consumed",
    labels: ["provider", "model", "type"],
  },
  {
    name: "aegis_report_generation_latency_ms",
    type: "histogram",
    help: "AI report generation latency in milliseconds",
    labels: ["report_type"],
  },
];

// ---------------------------------------------------------------------------
// Internal storage types
// ---------------------------------------------------------------------------

interface CounterEntry {
  type: "counter";
  value: number;
}

interface GaugeEntry {
  type: "gauge";
  value: number;
}

interface HistogramEntry {
  type: "histogram";
  samples: number[];
}

type MetricEntry = CounterEntry | GaugeEntry | HistogramEntry;

function labelKey(labels: Record<string, string>): string {
  return Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}="${v}"`)
    .join(",");
}

function labelsToPrometheus(labels: Record<string, string>): string {
  const inner = Object.entries(labels)
    .map(([k, v]) => `${k}="${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`)
    .join(",");
  return inner ? `{${inner}}` : "";
}

// Histogram buckets (ms)
const HISTOGRAM_BUCKETS = [5, 10, 25, 50, 100, 200, 500, 1000, 2500, 5000, 10000];

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export class MetricsRegistry {
  private readonly store = new Map<string, Map<string, MetricEntry>>();
  private readonly defMap = new Map<string, MetricDef>();

  constructor() {
    for (const def of AEGIS_METRICS) {
      this.defMap.set(def.name, def);
      this.store.set(def.name, new Map());
    }
  }

  /**
   * Record a metric observation.
   * Counters are incremented by `value`, gauges are set, histograms append the sample.
   */
  record(name: string, value: number, labels: Record<string, string> = {}): void {
    const def = this.defMap.get(name);
    if (!def) return; // Unknown metric — silently ignore.

    const key = labelKey(labels);
    const series = this.store.get(name)!;
    const existing = series.get(key);

    if (def.type === "counter") {
      const prev = existing as CounterEntry | undefined;
      series.set(key, { type: "counter", value: (prev?.value ?? 0) + value });
    } else if (def.type === "gauge") {
      series.set(key, { type: "gauge", value });
    } else {
      // histogram
      const prev = existing as HistogramEntry | undefined;
      const samples = prev ? [...prev.samples, value] : [value];
      series.set(key, { type: "histogram", samples });
    }
  }

  /** Render the full registry in Prometheus text format (version 0.0.4). */
  toPrometheusText(): string {
    const lines: string[] = [];
    const now = Date.now();

    for (const def of AEGIS_METRICS) {
      const series = this.store.get(def.name)!;
      lines.push(`# HELP ${def.name} ${def.help}`);
      lines.push(`# TYPE ${def.name} ${def.type}`);

      for (const [key, entry] of series.entries()) {
        const labelsObj: Record<string, string> = {};
        if (key) {
          for (const pair of key.split(",")) {
            const eq = pair.indexOf("=");
            labelsObj[pair.slice(0, eq)] = pair.slice(eq + 2, -1); // strip quotes
          }
        }
        const lp = labelsToPrometheus(labelsObj);

        if (entry.type === "counter" || entry.type === "gauge") {
          lines.push(`${def.name}${lp} ${entry.value} ${now}`);
        } else {
          // histogram
          const { samples } = entry;
          const sorted = [...samples].sort((a, b) => a - b);
          const sum = sorted.reduce((acc, s) => acc + s, 0);
          const count = sorted.length;

          for (const le of HISTOGRAM_BUCKETS) {
            const bucketCount = sorted.filter((s) => s <= le).length;
            const bLabels = labelsToPrometheus({ ...labelsObj, le: String(le) });
            lines.push(`${def.name}_bucket${bLabels} ${bucketCount} ${now}`);
          }
          const infLabels = labelsToPrometheus({ ...labelsObj, le: "+Inf" });
          lines.push(`${def.name}_bucket${infLabels} ${count} ${now}`);
          lines.push(`${def.name}_sum${lp} ${sum} ${now}`);
          lines.push(`${def.name}_count${lp} ${count} ${now}`);
        }
      }
    }

    return lines.join("\n") + "\n";
  }
}

/** Singleton metrics registry — import and call `metricsRegistry.record()` everywhere. */
export const metricsRegistry = new MetricsRegistry();
