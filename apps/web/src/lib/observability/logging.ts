import "server-only";

// ---------------------------------------------------------------------------
// Centralized Structured Logging — emits JSON to Vector HTTP source or console
// Vector → Loki / OpenSearch
// ---------------------------------------------------------------------------

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

export interface LogEntry {
  level: LogLevel;
  service: string;
  message: string;
  trace_id?: string;
  span_id?: string;
  timestamp: string;
  fields?: Record<string, unknown>;
}

const VECTOR_ENDPOINT = process.env.VECTOR_ENDPOINT ?? "http://vector:8686";
const SERVICE_NAME = process.env.SERVICE_NAME ?? "aegis-web";

function emitToVector(entry: LogEntry): void {
  // Fire-and-forget: do not await so logging never blocks the request path.
  if (process.env.VECTOR_ENDPOINT) {
    fetch(`${VECTOR_ENDPOINT}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).catch(() => {
      // Fallback to console if Vector is unreachable.
      console.log(JSON.stringify(entry));
    });
  } else {
    // Development fallback — structured JSON to stdout.
    console.log(JSON.stringify(entry));
  }
}

export class StructuredLogger {
  private readonly service: string;
  private readonly traceId?: string;
  private readonly spanId?: string;

  constructor(service: string, traceId?: string, spanId?: string) {
    this.service = service;
    this.traceId = traceId;
    this.spanId = spanId;
  }

  /** Returns a new logger instance bound to a specific trace + span context. */
  setTraceContext(traceId: string, spanId: string): StructuredLogger {
    return new StructuredLogger(this.service, traceId, spanId);
  }

  log(level: LogLevel, message: string, fields?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      service: this.service,
      message,
      timestamp: new Date().toISOString(),
      ...(this.traceId && { trace_id: this.traceId }),
      ...(this.spanId && { span_id: this.spanId }),
      ...(fields && Object.keys(fields).length > 0 && { fields }),
    };
    emitToVector(entry);
  }

  debug(message: string, fields?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, fields);
  }

  info(message: string, fields?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, fields);
  }

  warn(message: string, fields?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, fields);
  }

  error(message: string, fields?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, fields);
  }

  critical(message: string, fields?: Record<string, unknown>): void {
    this.log(LogLevel.CRITICAL, message, fields);
  }
}

/** Singleton logger — use this throughout the app. */
export const logger: StructuredLogger = new StructuredLogger(SERVICE_NAME);
