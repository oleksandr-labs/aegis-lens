/**
 * Unit tests for the analytics & attribution tracking module.
 *
 * Run with:  npx vitest run src/lib/tracking/tracking.test.ts
 *
 * Note: "server-only" imports in attribution.ts / plausible.ts are mocked
 * automatically by the vi.mock() calls below so tests run in a plain Node env.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock "server-only" before importing modules that use it
vi.mock("server-only", () => ({}));

import { stripPii, shouldTrack, DEFAULT_PRIVACY_POLICY } from "./privacy";
import {
  computeLinearAttribution,
  computePositionBasedAttribution,
} from "./attribution";
import { PERSONA_FUNNELS } from "./funnels";
import type { TouchPoint } from "./attribution";

// ── stripPii ──────────────────────────────────────────────────────────────

describe("stripPii", () => {
  it("removes the email field", () => {
    const payload = {
      email: "test@example.com",
      path: "/map",
      locale: "en",
    };
    const result = stripPii(payload);
    expect(result).not.toHaveProperty("email");
    expect(result.path).toBe("/map");
    expect(result.locale).toBe("en");
  });

  it("removes the name field", () => {
    const payload = { name: "Jane Doe", userId: "abc123" };
    const result = stripPii(payload);
    expect(result).not.toHaveProperty("name");
    expect(result.userId).toBe("abc123");
  });

  it("removes the ip field", () => {
    const payload = { ip: "1.2.3.4", event: "page_view" };
    const result = stripPii(payload);
    expect(result).not.toHaveProperty("ip");
  });

  it("leaves non-PII fields intact", () => {
    const payload = { path: "/alerts", tier: "pro", locale: "uk" };
    expect(stripPii(payload)).toEqual(payload);
  });

  it("is case-insensitive for PII key matching", () => {
    const payload = { Email: "x@y.com", Name: "Bob" } as Record<string, unknown>;
    const result = stripPii(payload);
    expect(result).not.toHaveProperty("Email");
    expect(result).not.toHaveProperty("Name");
  });
});

// ── computeLinearAttribution ──────────────────────────────────────────────

describe("computeLinearAttribution", () => {
  it("divides credit equally among three touch-points", () => {
    const tps: TouchPoint[] = [
      { channel: "organic",       timestamp: "2026-01-01T00:00:00Z" },
      { channel: "direct",        timestamp: "2026-01-05T00:00:00Z" },
      { channel: "embed_referral",timestamp: "2026-01-10T00:00:00Z" },
    ];
    const result = computeLinearAttribution(tps, "user-1");
    expect(result.model).toBe("linear");
    // Each touch-point should carry 1/3 weight
    for (const tp of result.touchPoints) {
      expect(tp.weight).toBeCloseTo(1 / 3, 10);
    }
  });

  it("credits the channel with the highest total weight", () => {
    // Two organic touches vs one direct → organic should win
    const tps: TouchPoint[] = [
      { channel: "organic", timestamp: "2026-01-01T00:00:00Z" },
      { channel: "organic", timestamp: "2026-01-03T00:00:00Z" },
      { channel: "direct",  timestamp: "2026-01-10T00:00:00Z" },
    ];
    const result = computeLinearAttribution(tps, "user-2");
    expect(result.creditedChannel).toBe("organic");
    expect(result.creditWeight).toBeCloseTo(2 / 3, 10);
  });

  it("handles a single touch-point (100% credit)", () => {
    const tps: TouchPoint[] = [
      { channel: "press", timestamp: "2026-01-01T00:00:00Z" },
    ];
    const result = computeLinearAttribution(tps, "user-3");
    expect(result.creditedChannel).toBe("press");
    expect(result.creditWeight).toBeCloseTo(1, 10);
  });

  it("returns creditWeight 0 for an empty touch-point list", () => {
    const result = computeLinearAttribution([], "user-4");
    expect(result.creditWeight).toBe(0);
  });
});

// ── computePositionBasedAttribution ──────────────────────────────────────

describe("computePositionBasedAttribution", () => {
  it("gives first and last touch 40% each by default", () => {
    const tps: TouchPoint[] = [
      { channel: "organic",       timestamp: "2026-01-01T00:00:00Z" },
      { channel: "social",        timestamp: "2026-01-05T00:00:00Z" },
      { channel: "embed_referral",timestamp: "2026-01-10T00:00:00Z" },
    ];
    const result = computePositionBasedAttribution(tps, 0.4, 0.4, "user-5");

    expect(result.model).toBe("position_based");
    expect(result.touchPoints[0].weight).toBeCloseTo(0.4, 10); // first
    expect(result.touchPoints[2].weight).toBeCloseTo(0.4, 10); // last
    expect(result.touchPoints[1].weight).toBeCloseTo(0.2, 10); // middle
  });

  it("handles two touch-points (no middle)", () => {
    const tps: TouchPoint[] = [
      { channel: "paid",   timestamp: "2026-01-01T00:00:00Z" },
      { channel: "direct", timestamp: "2026-01-10T00:00:00Z" },
    ];
    const result = computePositionBasedAttribution(tps, 0.4, 0.4, "user-6");
    expect(result.touchPoints[0].weight).toBeCloseTo(0.4, 10);
    expect(result.touchPoints[1].weight).toBeCloseTo(0.4, 10);
  });

  it("assigns 100% to a single touch-point", () => {
    const tps: TouchPoint[] = [
      { channel: "email", timestamp: "2026-01-01T00:00:00Z" },
    ];
    const result = computePositionBasedAttribution(tps, 0.4, 0.4, "user-7");
    expect(result.touchPoints[0].weight).toBeCloseTo(1, 10);
    expect(result.creditedChannel).toBe("email");
  });

  it("returns creditWeight 0 for empty input", () => {
    const result = computePositionBasedAttribution([], 0.4, 0.4, "user-8");
    expect(result.creditWeight).toBe(0);
  });
});

// ── shouldTrack ───────────────────────────────────────────────────────────

describe("shouldTrack", () => {
  function makeHeaders(entries: Record<string, string>): Headers {
    return new Headers(entries);
  }

  it("returns false when DNT header is '1' and dntRespected is true", () => {
    const req = {
      headers: makeHeaders({ dnt: "1" }),
      consentFlags: { analytics_consent_gdpr: true },
    };
    expect(shouldTrack(req, "gdpr", DEFAULT_PRIVACY_POLICY)).toBe(false);
  });

  it("returns true when DNT is '0'", () => {
    const req = {
      headers: makeHeaders({ dnt: "0" }),
      consentFlags: { analytics_consent_gdpr: true },
    };
    expect(shouldTrack(req, "gdpr", DEFAULT_PRIVACY_POLICY)).toBe(true);
  });

  it("returns false when consent flag is missing for the region", () => {
    const req = {
      headers: makeHeaders({}),
      consentFlags: {}, // no consent given
    };
    expect(shouldTrack(req, "gdpr", DEFAULT_PRIVACY_POLICY)).toBe(false);
  });

  it("returns false when consent flag is explicitly false", () => {
    const req = {
      headers: makeHeaders({}),
      consentFlags: { analytics_consent_uk_gdpr: false },
    };
    expect(shouldTrack(req, "uk_gdpr", DEFAULT_PRIVACY_POLICY)).toBe(false);
  });

  it("returns true when consent is given and DNT is absent", () => {
    const req = {
      headers: makeHeaders({}),
      consentFlags: { analytics_consent_gdpr: true },
    };
    expect(shouldTrack(req, "gdpr", DEFAULT_PRIVACY_POLICY)).toBe(true);
  });

  it("respects a custom policy with dntRespected=false", () => {
    const policy = { ...DEFAULT_PRIVACY_POLICY, dntRespected: false };
    const req = {
      headers: makeHeaders({ dnt: "1" }),
      consentFlags: { analytics_consent_gdpr: true },
    };
    // DNT set, but policy ignores it → should track if consent present
    expect(shouldTrack(req, "gdpr", policy)).toBe(true);
  });
});

// ── PERSONA_FUNNELS ───────────────────────────────────────────────────────

describe("PERSONA_FUNNELS", () => {
  const PERSONA_TAGS = [
    "journalist",
    "researcher",
    "ngo",
    "government",
    "military",
    "investor",
    "developer",
    "general",
  ] as const;

  it("has exactly one entry per persona tag", () => {
    expect(PERSONA_FUNNELS).toHaveLength(PERSONA_TAGS.length);
  });

  it("covers every persona tag", () => {
    const covered = new Set(
      PERSONA_FUNNELS.flatMap((f) => f.filters.persona ?? []),
    );
    for (const tag of PERSONA_TAGS) {
      expect(covered.has(tag)).toBe(true);
    }
  });

  it("every funnel has at least one stage", () => {
    for (const funnel of PERSONA_FUNNELS) {
      expect(funnel.stages.length).toBeGreaterThan(0);
    }
  });
});
