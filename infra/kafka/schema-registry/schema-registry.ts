/**
 * Kafka Schema Registry configuration — Aegis Lens
 *
 * Uses Confluent Schema Registry (compatible with Redpanda's built-in SR
 * for dev, Confluent Cloud for prod).
 *
 * Serialisation: Avro for high-volume ingest topics; Protobuf for
 * cross-language RPC-style messages (Python ML services).
 *
 * Subject naming: TopicNameStrategy (default) — one subject per topic.
 *   <topic>-value → value schema
 *   <topic>-key   → key schema (only where composite keys are used)
 *
 * Evolution rules (per-subject compatibility):
 *   - BACKWARD_TRANSITIVE for event/ingest schemas (consumers can read old)
 *   - FULL_TRANSITIVE for alert schemas (producers + consumers must agree)
 *   - NONE for DLQ schemas (no contract)
 */

// ── Schema registry connection ────────────────────────────────────────────────

export interface SchemaRegistryConfig {
  /** Base URL of the Schema Registry HTTP API. */
  url: string;
  /** Basic-auth credentials (Confluent Cloud). */
  auth?: { username: string; password: string };
  /** Default subject compatibility mode. */
  defaultCompatibility: CompatibilityLevel;
}

export type CompatibilityLevel =
  | "BACKWARD"
  | "BACKWARD_TRANSITIVE"
  | "FORWARD"
  | "FORWARD_TRANSITIVE"
  | "FULL"
  | "FULL_TRANSITIVE"
  | "NONE";

export type SerializationFormat = "AVRO" | "PROTOBUF" | "JSON";

export function getSchemaRegistryConfig(): SchemaRegistryConfig {
  const url =
    process.env.SCHEMA_REGISTRY_URL ??
    "http://localhost:8081";  // Redpanda SR in dev

  const username = process.env.SCHEMA_REGISTRY_API_KEY;
  const password = process.env.SCHEMA_REGISTRY_API_SECRET;

  return {
    url,
    auth: username && password ? { username, password } : undefined,
    defaultCompatibility: "BACKWARD_TRANSITIVE",
  };
}

// ── Subject registry ──────────────────────────────────────────────────────────

/** Per-subject schema definition. */
export interface SubjectConfig {
  subject: string;
  format: SerializationFormat;
  compatibility: CompatibilityLevel;
  /** Inline schema definition (Avro JSON / Protobuf IDL). */
  schema: string;
  description: string;
}

// ── Avro schemas ──────────────────────────────────────────────────────────────

const INGEST_RAW_AVRO = JSON.stringify({
  type: "record",
  name: "IngestRawEvent",
  namespace: "com.aegislens.ingest",
  doc: "Raw payload from any ingest adapter before normalisation.",
  fields: [
    { name: "event_id",    type: "string",           doc: "UUIDv4 assigned at ingest boundary." },
    { name: "source_id",   type: "string",           doc: "Integration source identifier." },
    { name: "ingested_at", type: { type: "long", logicalType: "timestamp-millis" } },
    { name: "payload",     type: "bytes",             doc: "Raw bytes (JSON / HTML / binary) — codec stored in payload_encoding." },
    { name: "payload_encoding", type: { type: "enum", name: "PayloadEncoding", symbols: ["json", "html", "msgpack", "raw"] } },
    { name: "source_url",  type: ["null", "string"], default: null },
    { name: "headers",     type: { type: "map", values: "string" }, default: {} },
  ],
});

const INGEST_NORMALIZED_AVRO = JSON.stringify({
  type: "record",
  name: "NormalizedEvent",
  namespace: "com.aegislens.events",
  doc: "Canonical event schema after adapter.normalise(). Before NLP enrichment.",
  fields: [
    { name: "event_id",       type: "string" },
    { name: "source_id",      type: "string" },
    { name: "event_type",     type: "string",           doc: "Taxonomy: incident | report | alert | media | eo_scene | …" },
    { name: "occurred_at",    type: { type: "long", logicalType: "timestamp-millis" } },
    { name: "ingested_at",    type: { type: "long", logicalType: "timestamp-millis" } },
    { name: "title",          type: ["null", "string"], default: null },
    { name: "body",           type: ["null", "string"], default: null },
    { name: "lang",           type: ["null", "string"], default: null, doc: "BCP-47 language tag." },
    { name: "geo",            type: ["null", {
      type: "record", name: "GeoPoint",
      fields: [
        { name: "lat", type: "double" },
        { name: "lon", type: "double" },
        { name: "accuracy_m", type: ["null", "float"], default: null },
      ],
    }], default: null },
    { name: "region_id",      type: ["null", "string"], default: null },
    { name: "confidence",     type: "float",            doc: "0.0–1.0 source confidence score." },
    { name: "raw_archive_key",type: ["null", "string"], default: null },
    { name: "tags",           type: { type: "array", items: "string" }, default: [] },
    { name: "metadata",       type: { type: "map", values: "string" }, default: {} },
  ],
});

const EVENTS_VERIFIED_AVRO = JSON.stringify({
  type: "record",
  name: "VerifiedEvent",
  namespace: "com.aegislens.events",
  doc: "Event after cross-source verification pipeline.",
  fields: [
    { name: "event_id",           type: "string" },
    { name: "verification_state", type: { type: "enum", name: "VerificationState", symbols: ["unverified", "corroborated", "disputed", "false_positive"] } },
    { name: "confidence",         type: "float" },
    { name: "corroborating_ids",  type: { type: "array", items: "string" }, default: [] },
    { name: "verified_at",        type: { type: "long", logicalType: "timestamp-millis" } },
    { name: "verified_by",        type: "string",           doc: "Pipeline version string, e.g. verify-svc/v2.1.0" },
    { name: "event",              type: {
      type: "record", name: "NormalizedEventRef",
      fields: [
        { name: "event_id",   type: "string" },
        { name: "source_id",  type: "string" },
        { name: "event_type", type: "string" },
        { name: "occurred_at",type: { type: "long", logicalType: "timestamp-millis" } },
      ],
    }},
  ],
});

const ALERTS_TRIGGERED_AVRO = JSON.stringify({
  type: "record",
  name: "TriggeredAlert",
  namespace: "com.aegislens.alerts",
  doc: "Alert notification ready for fan-out.",
  fields: [
    { name: "alert_id",       type: "string" },
    { name: "rule_id",        type: "string" },
    { name: "org_id",         type: "string" },
    { name: "triggered_at",   type: { type: "long", logicalType: "timestamp-millis" } },
    { name: "severity",       type: { type: "enum", name: "AlertSeverity", symbols: ["info", "warning", "critical"] } },
    { name: "event_ids",      type: { type: "array", items: "string" } },
    { name: "delivery_channels", type: { type: "array", items: { type: "enum", name: "Channel", symbols: ["email", "slack", "telegram", "webhook", "sms"] } } },
    { name: "payload",        type: { type: "map", values: "string" } },
  ],
});

// ── Subject registry ──────────────────────────────────────────────────────────

export const SCHEMA_SUBJECTS: SubjectConfig[] = [
  {
    subject: "ingest.raw.created-value",
    format: "AVRO",
    compatibility: "BACKWARD_TRANSITIVE",
    schema: INGEST_RAW_AVRO,
    description: "Raw ingest payload schema. New optional fields are backward-compatible.",
  },
  {
    subject: "ingest.normalized.created-value",
    format: "AVRO",
    compatibility: "BACKWARD_TRANSITIVE",
    schema: INGEST_NORMALIZED_AVRO,
    description: "Normalized canonical event. Must remain backward-compatible with all consumers.",
  },
  {
    subject: "events.verified-value",
    format: "AVRO",
    compatibility: "FULL_TRANSITIVE",
    schema: EVENTS_VERIFIED_AVRO,
    description: "Verified event. Full compatibility: producers AND consumers must agree on schema.",
  },
  {
    subject: "alerts.triggered-value",
    format: "AVRO",
    compatibility: "FULL_TRANSITIVE",
    schema: ALERTS_TRIGGERED_AVRO,
    description: "Triggered alert for delivery fan-out. Full compatibility enforced.",
  },
];

// ── Schema registry client wrapper ────────────────────────────────────────────

/**
 * Minimal Schema Registry HTTP client.
 * In production replace with @confluentinc/schemaregistry or kafkajs SR plugin.
 */
export class SchemaRegistryClient {
  private readonly cfg: SchemaRegistryConfig;

  constructor(cfg: SchemaRegistryConfig) {
    this.cfg = cfg;
  }

  private authHeader(): HeadersInit {
    if (!this.cfg.auth) return {};
    const token = Buffer.from(
      `${this.cfg.auth.username}:${this.cfg.auth.password}`,
    ).toString("base64");
    return { Authorization: `Basic ${token}` };
  }

  /** Register or update a schema for a subject. Returns schema ID. */
  async register(subject: string, schema: string, format: SerializationFormat): Promise<number> {
    const res = await fetch(`${this.cfg.url}/subjects/${subject}/versions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.schemaregistry.v1+json",
        ...this.authHeader(),
      },
      body: JSON.stringify({
        schema,
        schemaType: format === "AVRO" ? undefined : format, // AVRO is default
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`SR register failed [${res.status}]: ${body}`);
    }
    const { id } = (await res.json()) as { id: number };
    return id;
  }

  /** Set compatibility level for a subject. */
  async setCompatibility(subject: string, level: CompatibilityLevel): Promise<void> {
    const res = await fetch(`${this.cfg.url}/config/${subject}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/vnd.schemaregistry.v1+json",
        ...this.authHeader(),
      },
      body: JSON.stringify({ compatibility: level }),
    });
    if (!res.ok) {
      throw new Error(`SR setCompatibility failed [${res.status}]`);
    }
  }

  /** Idempotent: register all subjects defined in SCHEMA_SUBJECTS. */
  async bootstrapAll(): Promise<void> {
    for (const subject of SCHEMA_SUBJECTS) {
      await this.setCompatibility(subject.subject, subject.compatibility);
      const id = await this.register(subject.subject, subject.schema, subject.format);
      console.log(`SR registered: ${subject.subject} → id=${id}`);
    }
  }
}
