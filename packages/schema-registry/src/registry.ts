import { SchemaEntry, SchemaRegistration, SchemaCompatibilityResult, CompatibilityMode } from "./types";

class SchemaRegistry {
  private schemas = new Map<string, SchemaEntry>();

  register(reg: SchemaRegistration): SchemaEntry {
    const id = `${reg.subject}/${reg.version}`;
    if (this.schemas.has(id)) {
      throw new Error(`Schema ${id} already registered`);
    }

    // Check compatibility with previous version before registering
    const prev = this.getLatestVersion(reg.subject);
    if (prev && reg.compatibility !== "none") {
      const compat = this.checkCompatibility(prev, reg.schema, reg.compatibility ?? "backward");
      if (!compat.compatible) {
        throw new Error(`Schema ${id} is not ${compat.mode} compatible: ${compat.errors.join(", ")}`);
      }
    }

    const entry: SchemaEntry = {
      id,
      subject: reg.subject,
      version: reg.version,
      format: reg.format,
      schema: reg.schema,
      owner: reg.owner,
      sensitivity: reg.sensitivity,
      hasPii: reg.hasPii,
      piiFields: reg.piiFields,
      consumers: reg.consumers ?? [],
      producers: reg.producers ?? [],
      compatibility: reg.compatibility ?? "backward",
      freshnessSlaSec: reg.freshnessSlaSec,
      retentionDays: reg.retentionDays,
      registeredAt: new Date().toISOString(),
      isDeprecated: false,
    };

    this.schemas.set(id, entry);
    return entry;
  }

  get(subject: string, version: string): SchemaEntry | undefined {
    return this.schemas.get(`${subject}/${version}`);
  }

  getLatestVersion(subject: string): SchemaEntry | undefined {
    const versions = [...this.schemas.values()]
      .filter((s) => s.subject === subject && !s.isDeprecated)
      .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
    return versions[0];
  }

  listVersions(subject: string): SchemaEntry[] {
    return [...this.schemas.values()].filter((s) => s.subject === subject);
  }

  listSubjects(): string[] {
    return [...new Set([...this.schemas.values()].map((s) => s.subject))];
  }

  deprecate(subject: string, version: string, notice: string): void {
    const id = `${subject}/${version}`;
    const entry = this.schemas.get(id);
    if (!entry) throw new Error(`Schema ${id} not found`);
    const removesAt = new Date(Date.now() + 365 * 86_400_000).toISOString(); // 12-month minimum
    this.schemas.set(id, { ...entry, isDeprecated: true, deprecationNotice: notice, removesAt });
  }

  addConsumer(subject: string, version: string, consumer: string): void {
    const id = `${subject}/${version}`;
    const entry = this.schemas.get(id);
    if (entry && !entry.consumers.includes(consumer)) {
      this.schemas.set(id, { ...entry, consumers: [...entry.consumers, consumer] });
    }
  }

  /** Stub: JSON Schema backward compatibility check. */
  checkCompatibility(
    existing: SchemaEntry,
    newSchema: string | object,
    mode: CompatibilityMode,
  ): SchemaCompatibilityResult {
    // Production: use ajv + json-schema-diff or confluent schema registry API
    const errors: string[] = [];

    if (mode === "none") return { compatible: true, mode, errors };

    // Basic heuristic: if new schema is a string, check it's valid JSON
    if (typeof newSchema === "string") {
      try { JSON.parse(newSchema); } catch { errors.push("New schema is not valid JSON"); }
    }

    return { compatible: errors.length === 0, mode, errors };
  }
}

export const schemaRegistry = new SchemaRegistry();

// ── Pre-register canonical schemas ────────────────────────────────────────────

schemaRegistry.register({
  subject: "aegis.events",
  version: "1.0.0",
  format: "json_schema",
  schema: {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "AegisEventV1",
    type: "object",
    required: ["eventId", "schemaVersion", "class", "severity", "confidence", "occurredAt", "ingestedAt", "country", "orgId", "isPublic", "isRetracted", "citations"],
    properties: {
      eventId:        { type: "string" },
      schemaVersion:  { type: "string", const: "1.0.0" },
      class:          { type: "string" },
      severity:       { type: "integer", minimum: 1, maximum: 5 },
      confidence:     { type: "number", minimum: 0, maximum: 1 },
      occurredAt:     { type: "string", format: "date-time" },
      ingestedAt:     { type: "string", format: "date-time" },
      country:        { type: "string", pattern: "^[A-Z]{2}$" },
      orgId:          { type: "string" },
      isPublic:       { type: "boolean" },
      isRetracted:    { type: "boolean" },
      citations:      { type: "array" },
    },
  },
  owner: "platform-team",
  sensitivity: "internal",
  hasPii: false,
  producers: ["ingest-service", "manual-entry"],
  consumers: ["api-gateway", "dbt-pipeline", "search-service", "tile-service"],
  compatibility: "backward",
  freshnessSlaSec: 300,
  retentionDays: 2555, // 7 years
});

schemaRegistry.register({
  subject: "aegis.drone_events",
  version: "1.0.0",
  format: "json_schema",
  schema: { extends: "aegis.events/1.0.0", extraFields: ["model", "operator", "trajectory", "missionId"] },
  owner: "layers-team",
  sensitivity: "internal",
  hasPii: false,
  producers: ["drone-integration"],
  consumers: ["tile-service", "alert-service"],
  compatibility: "backward",
});

schemaRegistry.register({
  subject: "aegis.missile_events",
  version: "1.0.0",
  format: "json_schema",
  schema: { extends: "aegis.events/1.0.0", extraFields: ["model", "substatus", "launchPoint", "salvoId"] },
  owner: "layers-team",
  sensitivity: "internal",
  hasPii: false,
  producers: ["missile-integration"],
  consumers: ["tile-service", "alert-service", "infrastructure-linker"],
  compatibility: "backward",
});

schemaRegistry.register({
  subject: "aegis.users",
  version: "1.0.0",
  format: "json_schema",
  schema: {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "User",
    type: "object",
    required: ["userId", "email", "createdAt"],
    properties: {
      userId:    { type: "string" },
      email:     { type: "string", format: "email" },
      name:      { type: ["string", "null"] },
      locale:    { type: "string" },
      timezone:  { type: "string" },
    },
  },
  owner: "platform-team",
  sensitivity: "pii",
  hasPii: true,
  piiFields: ["email", "name", "avatarUrl"],
  producers: ["auth-service"],
  consumers: ["notifications-service", "audit-log", "api-gateway"],
  compatibility: "backward",
  retentionDays: 2555,
});
