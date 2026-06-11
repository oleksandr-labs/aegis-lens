import "server-only";

// ---------------------------------------------------------------------------
// Distributed Tracing — extends telemetry.ts with multi-backend support
// Exporters: OTLP (Tempo / Jaeger) | Honeycomb | console
// ---------------------------------------------------------------------------

export {
  type RequestTrace,
  type SpanData,
  extractTraceContext,
  createRequestTrace,
  traceResponseHeaders,
  emitSpan,
  withSpan,
} from "../telemetry";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SupportedExporter = "otlp" | "honeycomb" | "tempo" | "console";

export interface TracingConfig {
  serviceName: string;
  endpoint: string;
  sampleRate: number;
  exporter: SupportedExporter;
  honeycombApiKey?: string;
  honeycombDataset?: string;
}

export interface ChildSpan {
  traceId: string;
  spanId: string;
  parentSpanId: string;
  startedAt: number;
  startSpan(): void;
  endSpan(status?: "ok" | "error"): void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(byteLength: 8 | 16): string {
  const arr = new Uint8Array(byteLength);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function resolveExporter(): SupportedExporter {
  if (process.env.HONEYCOMB_API_KEY) return "honeycomb";
  if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return "otlp";
  return "console";
}

// ---------------------------------------------------------------------------
// Default config (env-driven)
// ---------------------------------------------------------------------------

export const DEFAULT_TRACING_CONFIG: TracingConfig = {
  serviceName: process.env.OTEL_SERVICE_NAME ?? "aegis-web",
  endpoint:
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
    (process.env.HONEYCOMB_API_KEY
      ? "https://api.honeycomb.io"
      : "http://tempo:4318"),
  sampleRate: Number(process.env.OTEL_SAMPLE_RATE ?? "1.0"),
  exporter: resolveExporter(),
  honeycombApiKey: process.env.HONEYCOMB_API_KEY,
  honeycombDataset: process.env.HONEYCOMB_DATASET ?? "aegis-lens",
};

// ---------------------------------------------------------------------------
// Idempotent init
// ---------------------------------------------------------------------------

let _initialised = false;
let _activeConfig: TracingConfig = { ...DEFAULT_TRACING_CONFIG };

/**
 * Initialise tracing once per process lifetime.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function initTracing(config: Partial<TracingConfig> = {}): void {
  if (_initialised) return;
  _activeConfig = { ..._activeConfig, ...config };
  _initialised = true;
  if (_activeConfig.exporter === "console" || process.env.NODE_ENV === "development") {
    console.log(
      JSON.stringify({
        level: "INFO",
        service: _activeConfig.serviceName,
        message: "Tracing initialised",
        exporter: _activeConfig.exporter,
        endpoint: _activeConfig.endpoint,
        sampleRate: _activeConfig.sampleRate,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}

/** Expose the resolved config for inspection / tests. */
export function getTracingConfig(): Readonly<TracingConfig> {
  return _activeConfig;
}

// ---------------------------------------------------------------------------
// Child span factory
// ---------------------------------------------------------------------------

/**
 * Create a child span under an existing trace.
 * Callers must invoke `startSpan()` before `endSpan()`.
 */
export function createChildSpan(
  parentTraceId: string,
  operationName: string,
): ChildSpan {
  const spanId = generateId(8);
  let startedAt = 0;

  const span: ChildSpan = {
    traceId: parentTraceId,
    spanId,
    parentSpanId: parentTraceId,
    startedAt,

    startSpan() {
      startedAt = Date.now();
      span.startedAt = startedAt;
    },

    endSpan(status: "ok" | "error" = "ok") {
      const finishedAt = Date.now();
      const config = getTracingConfig();

      // Sampling gate
      if (Math.random() > config.sampleRate) return;

      const spanPayload = {
        traceId: parentTraceId,
        spanId,
        parentSpanId: parentTraceId,
        name: operationName,
        startTimeUnixNano: startedAt * 1_000_000,
        endTimeUnixNano: finishedAt * 1_000_000,
        status: { code: status === "ok" ? 1 : 2 },
        attributes: [
          { key: "service.name", value: { stringValue: config.serviceName } },
          { key: "operation", value: { stringValue: operationName } },
        ],
      };

      if (config.exporter === "console") {
        console.log(JSON.stringify({ ...spanPayload, timestamp: new Date().toISOString() }));
        return;
      }

      if (config.exporter === "honeycomb" && config.honeycombApiKey) {
        fetch("https://api.honeycomb.io/v1/traces", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Honeycomb-Team": config.honeycombApiKey,
            "X-Honeycomb-Dataset": config.honeycombDataset ?? "aegis-lens",
          },
          body: JSON.stringify({
            resourceSpans: [
              {
                resource: {
                  attributes: [
                    { key: "service.name", value: { stringValue: config.serviceName } },
                  ],
                },
                scopeSpans: [{ spans: [spanPayload] }],
              },
            ],
          }),
        }).catch(() => {});
        return;
      }

      // OTLP / Tempo fallback
      if (config.endpoint) {
        fetch(`${config.endpoint}/v1/traces`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resourceSpans: [
              {
                resource: {
                  attributes: [
                    { key: "service.name", value: { stringValue: config.serviceName } },
                  ],
                },
                scopeSpans: [{ spans: [spanPayload] }],
              },
            ],
          }),
        }).catch(() => {});
      }
    },
  };

  return span;
}

export const SUPPORTED_EXPORTERS: SupportedExporter[] = [
  "otlp",
  "honeycomb",
  "tempo",
  "console",
];
