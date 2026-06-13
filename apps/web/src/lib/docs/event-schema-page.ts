/**
 * Public schema documentation page config — /docs/schema/events
 *
 * Content configuration for the Event Schema reference page:
 *   - SEO metadata (title, description, canonical)
 *   - Schema.org TechArticle structured data
 *   - Changelog entries
 *   - Field groups for UI rendering
 */

// ── SEO metadata ──────────────────────────────────────────────────────────────

export const EVENT_SCHEMA_PAGE_SEO = {
  title: "Aegis Lens Event Schema v1 — Reference Documentation",
  description:
    "Complete reference for the Aegis Lens canonical event schema (AegisEventV1). " +
    "Field definitions, types, validation rules, versioning policy, and code examples " +
    "for JSON, Protobuf, and SDK integrations.",
  canonical: "https://aegislens.com/docs/schema/events",
  ogTitle: "Aegis Lens Event Schema v1",
  ogDescription:
    "Machine-readable event schema for conflict intelligence data. " +
    "Covers geolocation, confidence scoring, danger bands, and multi-language support.",
  keywords: [
    "conflict events schema",
    "OSINT data format",
    "Ukraine war data API",
    "event intelligence schema",
    "geolocation events",
    "structured data conflict",
    "AegisEventV1",
  ],
  lastModified: "2026-06-13",
  locale: "en",
} as const;

// ── Schema.org TechArticle structured data ────────────────────────────────────

export interface TechArticleSchema {
  "@context": "https://schema.org";
  "@type": "TechArticle";
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  author: { "@type": "Organization"; name: string; url: string };
  publisher: { "@type": "Organization"; name: string; url: string };
  articleSection: string;
  keywords: string;
  about: { "@type": "Thing"; name: string; description: string };
}

export const EVENT_SCHEMA_TECH_ARTICLE: TechArticleSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Aegis Lens Event Schema v1 — Reference Documentation",
  description:
    "Complete field-by-field documentation for AegisEventV1, the canonical conflict event " +
    "representation used across all Aegis Lens APIs, exports, and services.",
  url: "https://aegislens.com/docs/schema/events",
  datePublished: "2026-01-15",
  dateModified: "2026-06-13",
  author: {
    "@type": "Organization",
    name: "Aegis Lens",
    url: "https://aegislens.com",
  },
  publisher: {
    "@type": "Organization",
    name: "Aegis Lens",
    url: "https://aegislens.com",
  },
  articleSection: "Developer Documentation",
  keywords: EVENT_SCHEMA_PAGE_SEO.keywords.join(", "),
  about: {
    "@type": "Thing",
    name: "Conflict Intelligence Event Schema",
    description:
      "A structured data format for representing verified conflict events, including geolocation, " +
      "confidence scoring, multi-language text, and source citations.",
  },
};

// ── Field groups (for docs page UI rendering) ─────────────────────────────────

export interface SchemaFieldDoc {
  field: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

export interface SchemaFieldGroup {
  groupName: string;
  description: string;
  fields: SchemaFieldDoc[];
}

export const EVENT_SCHEMA_FIELD_GROUPS: SchemaFieldGroup[] = [
  {
    groupName: "Identity",
    description: "Fields that uniquely identify and version the event.",
    fields: [
      {
        field: "eventId",
        type: "string (UUIDv7)",
        required: true,
        description: "Globally unique event identifier. UUIDv7 is preferred for time-ordered storage.",
        example: "018f2c8d-6b2a-7e3a-8d1f-2a4b6c8e0f12",
      },
      {
        field: "schemaVersion",
        type: '"1.0.0"',
        required: true,
        description: 'Fixed schema version string. Always "1.0.0" for v1 events.',
        example: "1.0.0",
      },
    ],
  },
  {
    groupName: "Classification",
    description: "Event class and optional subclass for routing and filtering.",
    fields: [
      {
        field: "class",
        type: "EventClass",
        required: true,
        description:
          "Broad event category. One of: drone, missile, airstrike, artillery, ground_combat, explosion, fire, " +
          "infrastructure_damage, power_outage, comms_outage, humanitarian, displacement, protest, cyberattack, " +
          "chemical, radiation, other.",
        example: "drone",
      },
      {
        field: "subclass",
        type: "string",
        required: false,
        description: "Domain-specific subclass, e.g. 'shahed_136' for a Shahed drone strike.",
        example: "shahed_136",
      },
    ],
  },
  {
    groupName: "Location",
    description: "Geographic coordinates and administrative codes.",
    fields: [
      {
        field: "location",
        type: "GeoPoint",
        required: false,
        description:
          "WGS-84 lat/lon with optional uncertainty radius in metres. Omit when location is unknown; " +
          "do not set to 0,0 as a placeholder.",
        example: '{ "lat": 50.45, "lon": 30.52, "uncertaintyM": 500 }',
      },
      {
        field: "country",
        type: "string (ISO 3166-1 alpha-2)",
        required: true,
        description: "Two-letter country code.",
        example: "UA",
      },
      {
        field: "regionCode",
        type: "string (ISO 3166-2)",
        required: false,
        description: "Oblast / region code.",
        example: "UA-63",
      },
    ],
  },
  {
    groupName: "Scoring",
    description: "Severity, confidence, and derived danger scores.",
    fields: [
      {
        field: "severity",
        type: "1 | 2 | 3 | 4 | 5",
        required: true,
        description:
          "Analyst-assigned severity: 1 (minor) to 5 (catastrophic). " +
          "Input to dangerScore computation.",
        example: "3",
      },
      {
        field: "confidence",
        type: "number (0–1)",
        required: true,
        description:
          "Weighted confidence that this event is real, correctly located, and correctly described. " +
          "Computed by computeConfidenceScore(). Never set manually by ingest.",
        example: "0.78",
      },
      {
        field: "dangerScore",
        type: "number (0–100)",
        required: false,
        description: "Composite danger score. Server-generated; not accepted from ingest.",
        example: "67",
      },
      {
        field: "dangerBand",
        type: "DangerBand",
        required: false,
        description: "Labelled band: calm | elevated | active | high | critical.",
        example: "high",
      },
    ],
  },
  {
    groupName: "Verification",
    description: "Human-in-the-loop review state.",
    fields: [
      {
        field: "verificationState",
        type: "VerificationState",
        required: true,
        description:
          "One of: unverified | in_review | verified | disputed | retracted. " +
          "Events enter as 'unverified' and progress through HITL review.",
        example: "verified",
      },
    ],
  },
  {
    groupName: "Timestamps",
    description: "ISO-8601 UTC timestamps.",
    fields: [
      { field: "occurredAt",  type: "string (ISO-8601)", required: true,  description: "When the event occurred in the real world." },
      { field: "ingestedAt",  type: "string (ISO-8601)", required: true,  description: "When this event was first ingested by Aegis Lens." },
      { field: "updatedAt",   type: "string (ISO-8601)", required: true,  description: "When this event record was last updated." },
    ],
  },
  {
    groupName: "Content",
    description: "Multilingual title, summary, and original source text.",
    fields: [
      {
        field: "title",
        type: "LocalizedText",
        required: true,
        description: "Multilingual title. Keys are BCP-47 locale codes (en, uk, ru, …).",
        example: '{ "en": "Drone strike on Kharkiv", "uk": "Удар дроном по Харкову" }',
      },
      {
        field: "originalText",
        type: "string",
        required: false,
        description: "Original source text before translation. Preserved for provenance.",
      },
    ],
  },
  {
    groupName: "Citations",
    description: "Source provenance and archive links.",
    fields: [
      {
        field: "citations",
        type: "SourceCitation[]",
        required: true,
        description:
          "Array of source citations. Must have at least one for verified events. " +
          "Include archiveUrl for ephemeral sources (Telegram, Twitter).",
      },
    ],
  },
];

// ── Changelog ─────────────────────────────────────────────────────────────────

export interface SchemaChangelogEntry {
  version: string;
  date: string;
  type: "breaking" | "non-breaking" | "deprecation" | "fix";
  summary: string;
  details?: string;
}

export const EVENT_SCHEMA_CHANGELOG: SchemaChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "2026-01-15",
    type: "non-breaking",
    summary: "Initial public release of AegisEventV1.",
    details:
      "Core fields: eventId, class, severity, confidence, dangerScore, verificationState, " +
      "location, country, regionCode, title (multilingual), citations, links.",
  },
  {
    version: "1.0.1",
    date: "2026-02-28",
    type: "non-breaking",
    summary: "Added dangerBand field (derived from dangerScore).",
    details: "dangerBand is optional and server-generated. Ingest payloads may omit it.",
  },
  {
    version: "1.0.2",
    date: "2026-04-10",
    type: "non-breaking",
    summary: "Added podcast, comms_outage, and radiation to EventClass.",
  },
  {
    version: "1.0.3",
    date: "2026-06-13",
    type: "non-breaking",
    summary: "Added Protobuf schema (proto/event.proto) and serialization utilities.",
    details:
      "JSON serialization: serializeToJson / deserializeFromJson. " +
      "Protobuf: packages/event-schema/src/proto/event.proto (field-for-field parity). " +
      "MsgPack format documented (wire encoding in Python gateway).",
  },
];
