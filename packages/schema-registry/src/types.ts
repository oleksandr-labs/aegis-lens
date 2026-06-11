/** Schema registry for Aegis Lens data contracts. */

export type SchemaFormat = "json_schema" | "avro" | "protobuf" | "typescript";

export type CompatibilityMode =
  | "none"
  | "backward"    // new schema can read data produced with old schema
  | "forward"     // old schema can read data produced with new schema
  | "full"        // both backward and forward compatible
  | "backward_transitive"
  | "full_transitive";

export type DataSensitivity = "public" | "internal" | "confidential" | "pii";

/** A registered data schema with its contract metadata. */
export interface SchemaEntry {
  /** Unique identifier: "{subject}/{version}" e.g. "events/1.0.0" */
  id: string;
  subject: string;
  version: string;
  format: SchemaFormat;
  /** The schema definition (JSON Schema, Avro IDL, etc.) */
  schema: string | object;
  /** Who owns this schema (team name) */
  owner: string;
  /** SLA: freshness guarantee in seconds */
  freshnessSlaSec?: number;
  /** Data retention period */
  retentionDays?: number;
  sensitivity: DataSensitivity;
  /** Does this schema contain PII fields? */
  hasPii: boolean;
  /** PII field names (for audit) */
  piiFields?: string[];
  /** List of services/topics that consume this schema */
  consumers: string[];
  /** List of services that produce this schema */
  producers: string[];
  compatibility: CompatibilityMode;
  /** ISO-8601 */
  registeredAt: string;
  /** ISO-8601 — when this version is scheduled for deprecation */
  deprecatesAt?: string;
  /** ISO-8601 — when this version will be removed (12-month minimum) */
  removesAt?: string;
  isDeprecated: boolean;
  deprecationNotice?: string;
  changelog?: string;
}

export interface SchemaCompatibilityResult {
  compatible: boolean;
  mode: CompatibilityMode;
  errors: string[];
}

export interface SchemaRegistration {
  subject: string;
  version: string;
  format: SchemaFormat;
  schema: string | object;
  owner: string;
  sensitivity: DataSensitivity;
  hasPii: boolean;
  piiFields?: string[];
  consumers?: string[];
  producers?: string[];
  compatibility?: CompatibilityMode;
  freshnessSlaSec?: number;
  retentionDays?: number;
}
