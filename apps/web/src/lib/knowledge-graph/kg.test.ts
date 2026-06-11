/**
 * Unit tests for the Aegis Lens Knowledge Graph library.
 *
 * Run with: pnpm vitest run src/lib/knowledge-graph/kg.test.ts
 */

import { describe, expect, it } from "vitest";
import { createEntityId, validateEntity } from "./entity-schema";
import { validateRelation } from "./relation-schema";
import { isRetracted } from "./audit-log";
import { computeBackoffMs } from "../crawler/rate-limits";
import type { Entity, EntityId, Relation } from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────

function makeEntity(overrides: Partial<Entity> = {}): Entity {
  return {
    id: "military_unit/test-unit" as EntityId,
    type: "military_unit",
    names: { en: ["Test Unit"], uk: ["Тестовий підрозділ"], ru: [], pl: [], de: [] },
    aliases: [],
    attributes: { country: "UA", branch: "army", status: "active" },
    sameAs: [],
    confidence: 0.9,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

// ── createEntityId ────────────────────────────────────────────────────────

describe("createEntityId", () => {
  it("produces the same id for the same type + name (deterministic)", () => {
    const id1 = createEntityId("military_unit", "1st Guards Tank Army");
    const id2 = createEntityId("military_unit", "1st Guards Tank Army");
    expect(id1).toBe(id2);
  });

  it("includes the entity type as a prefix", () => {
    const id = createEntityId("equipment", "T-72B3");
    expect(id.startsWith("equipment/")).toBe(true);
  });

  it("slugifies whitespace and casing", () => {
    const id = createEntityId("region", "Donetsk Oblast");
    expect(id).toBe("region/donetsk-oblast");
  });

  it("different names produce different ids", () => {
    const id1 = createEntityId("military_unit", "1st Army");
    const id2 = createEntityId("military_unit", "2nd Army");
    expect(id1).not.toBe(id2);
  });

  it("different types with same name produce different ids", () => {
    const id1 = createEntityId("region", "Kyiv");
    const id2 = createEntityId("location", "Kyiv");
    expect(id1).not.toBe(id2);
  });
});

// ── validateEntity ────────────────────────────────────────────────────────

describe("validateEntity", () => {
  it("returns valid for a well-formed entity", () => {
    const result = validateEntity(makeEntity());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects entity without names", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = validateEntity({ ...makeEntity(), names: undefined as any });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /names/.test(e))).toBe(true);
  });

  it("rejects entity with empty names object", () => {
    const result = validateEntity({
      ...makeEntity(),
      names: {} as Record<never, string[]>,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /names/.test(e))).toBe(true);
  });

  it("rejects entity without type", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = validateEntity({ ...makeEntity(), type: undefined as any });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /type/.test(e))).toBe(true);
  });

  it("rejects entity with unknown type", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = validateEntity({ ...makeEntity(), type: "alien_vessel" as any });
    expect(result.valid).toBe(false);
  });

  it("rejects confidence out of range", () => {
    const result = validateEntity({ ...makeEntity(), confidence: 1.5 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /confidence/.test(e))).toBe(true);
  });
});

// ── validateRelation ──────────────────────────────────────────────────────

describe("validateRelation", () => {
  function makeEntities(): Map<EntityId, Entity> {
    const subject = makeEntity({
      id: "military_unit/1st-army" as EntityId,
      type: "military_unit",
    });
    const object = makeEntity({
      id: "conflict/ukraine-war-2022" as EntityId,
      type: "conflict",
    });
    const map = new Map<EntityId, Entity>();
    map.set(subject.id, subject);
    map.set(object.id, object);
    return map;
  }

  function makeRelation(overrides: Partial<Relation> = {}): Partial<Relation> {
    return {
      id: "rel-001",
      subject: "military_unit/1st-army" as EntityId,
      predicate: "participated_in",
      object: "conflict/ukraine-war-2022" as EntityId,
      confidence: 0.85,
      sources: ["https://example.com/source"],
      ...overrides,
    };
  }

  it("returns valid for a well-formed relation", () => {
    const result = validateRelation(makeRelation(), makeEntities());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects invalid predicate for the subject entity type", () => {
    // "manufacturedBy" is not valid for military_unit
    const result = validateRelation(
      makeRelation({ predicate: "manufacturedBy" }),
      makeEntities(),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /predicate/.test(e) || /Predicate/.test(e))).toBe(true);
  });

  it("rejects relation with missing subject", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = validateRelation(makeRelation({ subject: undefined as any }), makeEntities());
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /subject/.test(e))).toBe(true);
  });

  it("rejects relation with missing object", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = validateRelation(makeRelation({ object: undefined as any }), makeEntities());
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /object/.test(e))).toBe(true);
  });

  it("rejects relation when subject entity is not in the map", () => {
    const entities = makeEntities();
    entities.delete("military_unit/1st-army" as EntityId);
    const result = validateRelation(makeRelation(), entities);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /Subject entity not found/.test(e))).toBe(true);
  });

  it("rejects validFrom after validUntil", () => {
    const result = validateRelation(
      makeRelation({
        validFrom: "2024-06-01",
        validUntil: "2024-01-01",
      }),
      makeEntities(),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /validFrom/.test(e))).toBe(true);
  });
});

// ── isRetracted ───────────────────────────────────────────────────────────

describe("isRetracted", () => {
  it("returns false for entity without retractedAt", () => {
    const entity = makeEntity();
    expect(isRetracted(entity)).toBe(false);
  });

  it("returns false when retractedAt is an empty string", () => {
    const entity = makeEntity({
      attributes: { retractedAt: "" },
    });
    expect(isRetracted(entity)).toBe(false);
  });

  it("returns true when retractedAt is set to a timestamp", () => {
    const entity = makeEntity({
      attributes: { retractedAt: "2024-03-15T12:00:00Z" },
    });
    expect(isRetracted(entity)).toBe(true);
  });

  it("returns false when retractedAt is null", () => {
    const entity = makeEntity({
      attributes: { retractedAt: null },
    });
    expect(isRetracted(entity)).toBe(false);
  });
});

// ── computeBackoffMs ──────────────────────────────────────────────────────

describe("computeBackoffMs", () => {
  it("failure 0 returns base delay", () => {
    expect(computeBackoffMs(0, 1_000)).toBe(1_000);
  });

  it("failure 1 returns 2 * base", () => {
    expect(computeBackoffMs(1, 1_000)).toBe(2_000);
  });

  it("failure 2 returns 4 * base", () => {
    expect(computeBackoffMs(2, 1_000)).toBe(4_000);
  });

  it("failure 3 returns 8 * base", () => {
    expect(computeBackoffMs(3, 1_000)).toBe(8_000);
  });

  it("doubles on each subsequent failure", () => {
    const base = 500;
    for (let i = 0; i < 5; i++) {
      const expected = Math.min(base * Math.pow(2, i), 5 * 60 * 1_000);
      expect(computeBackoffMs(i, base)).toBe(expected);
    }
  });

  it("is capped at 5 minutes regardless of failure count", () => {
    const fiveMin = 5 * 60 * 1_000;
    expect(computeBackoffMs(100, 1_000)).toBe(fiveMin);
    expect(computeBackoffMs(30, 1_000)).toBe(fiveMin);
  });

  it("uses 1000ms as default base", () => {
    expect(computeBackoffMs(0)).toBe(1_000);
    expect(computeBackoffMs(1)).toBe(2_000);
  });
});
