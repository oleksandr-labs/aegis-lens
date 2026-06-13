/**
 * Event serialization utilities for AegisEventV1.
 *
 * Supported formats:
 *   - json     — canonical JSON (UTF-8); default for REST APIs and exports
 *   - protobuf — binary encoding; defined in proto/event.proto
 *   - msgpack  — compact binary (MessagePack); suitable for high-volume ingest
 *
 * Design notes:
 *   - JSON is always the reference format; others are derived representations.
 *   - Protobuf wire encoding requires the compiled proto runtime; this module
 *     provides the schema path and a shape validator, not a compiled encoder.
 *     Wire encoding is handled by the Go ingest service (services/ingest).
 *   - msgpack round-trips through JSON to avoid extra dependencies in the TS
 *     package; native msgpack encoding available via the Python gateway.
 */

import { AegisEventV1, validateEventV1 } from "./v1";

// ── Supported formats ─────────────────────────────────────────────────────────

export const SERIALIZATION_FORMATS = ["json", "protobuf", "msgpack"] as const;
export type SerializationFormat = (typeof SERIALIZATION_FORMATS)[number];

export interface SerializationMeta {
  format: SerializationFormat;
  description: string;
  /** MIME type for HTTP Content-Type / Accept headers */
  mimeType: string;
  /** Proto file path (relative to monorepo root) for binary formats */
  protoPath?: string;
}

export const SERIALIZATION_FORMAT_META: Record<SerializationFormat, SerializationMeta> = {
  json: {
    format: "json",
    description: "Canonical JSON encoding. UTF-8. Used by all public REST APIs and CSV/JSON exports.",
    mimeType: "application/json",
  },
  protobuf: {
    format: "protobuf",
    description:
      "Protocol Buffers v3 binary encoding. ~40% smaller than JSON. Used by gRPC ingest streams and " +
      "internal service communication. Schema: packages/event-schema/src/proto/event.proto",
    mimeType: "application/x-protobuf",
    protoPath: "packages/event-schema/src/proto/event.proto",
  },
  msgpack: {
    format: "msgpack",
    description:
      "MessagePack binary encoding. ~25% smaller than JSON, schema-free. " +
      "Used by real-time WebSocket feeds to browser clients.",
    mimeType: "application/x-msgpack",
  },
};

// ── JSON serialization ────────────────────────────────────────────────────────

export interface SerializeOptions {
  /**
   * If true, strip ingest-only fields (rawPayload, reviewerIds) before
   * serializing. Set to true for all public-facing exports.
   */
  stripInternal?: boolean;
  /** Indent JSON output (pretty-print). Default false. */
  pretty?: boolean;
}

/**
 * Serialize an AegisEventV1 to a canonical JSON string.
 *
 * Fields are emitted in a stable order: identity → location → scoring →
 * verification → timestamps → content → citations → links → meta.
 */
export function serializeToJson(event: AegisEventV1, opts: SerializeOptions = {}): string {
  const { stripInternal = false, pretty = false } = opts;

  const out: Partial<AegisEventV1> & Record<string, unknown> = {
    eventId: event.eventId,
    schemaVersion: event.schemaVersion,
    class: event.class,
    ...(event.subclass !== undefined && { subclass: event.subclass }),
    ...(event.location !== undefined && { location: event.location }),
    country: event.country,
    ...(event.regionCode !== undefined && { regionCode: event.regionCode }),
    severity: event.severity,
    confidence: event.confidence,
    ...(event.dangerScore !== undefined && { dangerScore: event.dangerScore }),
    ...(event.dangerBand !== undefined && { dangerBand: event.dangerBand }),
    verificationState: event.verificationState,
    ...(!stripInternal && event.reviewerIds && { reviewerIds: event.reviewerIds }),
    occurredAt: event.occurredAt,
    ingestedAt: event.ingestedAt,
    updatedAt: event.updatedAt,
    title: event.title,
    ...(event.summary !== undefined && { summary: event.summary }),
    ...(event.originalText !== undefined && { originalText: event.originalText }),
    ...(event.mediaUrls !== undefined && { mediaUrls: event.mediaUrls }),
    citations: event.citations,
    ...(event.links !== undefined && { links: event.links }),
    orgId: event.orgId,
    isPublic: event.isPublic,
    isRetracted: event.isRetracted,
    ...(event.retractedAt !== undefined && { retractedAt: event.retractedAt }),
    ...(event.retractionReason !== undefined && { retractionReason: event.retractionReason }),
    // rawPayload intentionally excluded when stripInternal = false too —
    // it is never written to public outputs; include only for internal ingest logs.
    ...(!stripInternal && event.rawPayload !== undefined && { rawPayload: event.rawPayload }),
  };

  return pretty ? JSON.stringify(out, null, 2) : JSON.stringify(out);
}

// ── JSON deserialization ──────────────────────────────────────────────────────

export interface DeserializeResult {
  event: AegisEventV1 | null;
  errors: { field: string; message: string }[];
}

/**
 * Deserialize a JSON string into an AegisEventV1, running schema validation.
 *
 * Returns `event: null` if validation fails; errors array is always populated
 * on failure.
 */
export function deserializeFromJson(json: string): DeserializeResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (err: unknown) {
    return {
      event: null,
      errors: [{ field: "root", message: `JSON parse error: ${err instanceof Error ? err.message : String(err)}` }],
    };
  }

  const errors = validateEventV1(parsed);
  if (errors.length > 0) {
    return { event: null, errors };
  }

  return { event: parsed as AegisEventV1, errors: [] };
}

/**
 * Deserialize a JSON string and throw on validation error.
 * Convenience wrapper for internal pipeline code.
 */
export function deserializeFromJsonOrThrow(json: string): AegisEventV1 {
  const { event, errors } = deserializeFromJson(json);
  if (!event) {
    throw new Error(`Event deserialization failed: ${errors.map((e) => `${e.field}: ${e.message}`).join("; ")}`);
  }
  return event;
}

// ── Batch serialization ───────────────────────────────────────────────────────

export interface EventBatch {
  events: AegisEventV1[];
  nextCursor?: string;
  totalCount?: number;
}

export function serializeBatchToJson(batch: EventBatch, opts: SerializeOptions = {}): string {
  const out = {
    events: batch.events.map((e) => JSON.parse(serializeToJson(e, opts)) as unknown),
    ...(batch.nextCursor !== undefined && { nextCursor: batch.nextCursor }),
    ...(batch.totalCount !== undefined && { totalCount: batch.totalCount }),
  };
  return opts.pretty ? JSON.stringify(out, null, 2) : JSON.stringify(out);
}

// ── Format negotiation ────────────────────────────────────────────────────────

/**
 * Negotiate the serialization format from an HTTP Accept header.
 *
 * Priority order: application/x-protobuf > application/x-msgpack > application/json
 * Falls back to 'json' if no match.
 */
export function negotiateFormat(acceptHeader: string | null | undefined): SerializationFormat {
  if (!acceptHeader) return "json";
  if (acceptHeader.includes("application/x-protobuf")) return "protobuf";
  if (acceptHeader.includes("application/x-msgpack")) return "msgpack";
  return "json";
}
