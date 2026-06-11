/**
 * OpenTelemetry request tracing for API routes.
 *
 * Generates a trace ID for every request and propagates W3C Trace Context headers.
 * In production: export spans to Honeycomb / Jaeger / Grafana Tempo.
 */

export interface RequestTrace {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  /** ISO-8601 */
  startedAt: string;
  path: string;
  method: string;
  userId?: string;
  orgId?: string;
}

export interface SpanData {
  name: string;
  startedAt: number; // Date.now()
  finishedAt?: number;
  status: "ok" | "error";
  attributes: Record<string, string | number | boolean>;
  error?: string;
}

/** Generate a random 16-byte hex trace ID. */
function generateTraceId(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Generate a random 8-byte hex span ID. */
function generateSpanId(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Extract or generate trace context from incoming request headers.
 * Supports W3C traceparent: version-traceId-spanId-flags
 */
export function extractTraceContext(req: Request): { traceId: string; parentSpanId?: string } {
  const traceparent = req.headers.get("traceparent");
  if (traceparent) {
    const parts = traceparent.split("-");
    if (parts.length === 4) {
      return { traceId: parts[1], parentSpanId: parts[2] };
    }
  }
  return { traceId: generateTraceId() };
}

/**
 * Create a trace for an incoming API request.
 */
export function createRequestTrace(req: Request, opts: { userId?: string; orgId?: string } = {}): RequestTrace {
  const { traceId, parentSpanId } = extractTraceContext(req);
  const url = new URL(req.url);
  return {
    traceId,
    spanId: generateSpanId(),
    parentSpanId,
    startedAt: new Date().toISOString(),
    path: url.pathname,
    method: req.method,
    userId: opts.userId,
    orgId: opts.orgId,
  };
}

/**
 * Build W3C traceparent + tracestate response headers.
 */
export function traceResponseHeaders(trace: RequestTrace): Record<string, string> {
  return {
    "traceparent": `00-${trace.traceId}-${trace.spanId}-01`,
    "X-Request-ID": trace.traceId,
    "X-Span-ID": trace.spanId,
  };
}

/**
 * Emit a span to the configured exporter.
 * Production: use @opentelemetry/sdk-node with OTLP exporter.
 */
export async function emitSpan(trace: RequestTrace, span: SpanData): Promise<void> {
  if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    const body = {
      resourceSpans: [{
        resource: { attributes: [{ key: "service.name", value: { stringValue: "aegis-web" } }] },
        scopeSpans: [{
          spans: [{
            traceId: trace.traceId,
            spanId: trace.spanId,
            parentSpanId: trace.parentSpanId,
            name: span.name,
            startTimeUnixNano: span.startedAt * 1_000_000,
            endTimeUnixNano: (span.finishedAt ?? Date.now()) * 1_000_000,
            status: { code: span.status === "ok" ? 1 : 2 },
            attributes: Object.entries(span.attributes).map(([k, v]) => ({
              key: k,
              value: typeof v === "number" ? { intValue: v } : typeof v === "boolean" ? { boolValue: v } : { stringValue: String(v) },
            })),
          }],
        }],
      }],
    };

    await fetch(process.env.OTEL_EXPORTER_OTLP_ENDPOINT + "/v1/traces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {}); // Fire and forget
  }
}

/**
 * Convenience wrapper: time an async operation and emit a span.
 */
export async function withSpan<T>(
  trace: RequestTrace,
  name: string,
  attributes: Record<string, string | number | boolean>,
  fn: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now();
  try {
    const result = await fn();
    await emitSpan(trace, { name, startedAt, finishedAt: Date.now(), status: "ok", attributes });
    return result;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await emitSpan(trace, { name, startedAt, finishedAt: Date.now(), status: "error", attributes, error: errMsg });
    throw err;
  }
}
