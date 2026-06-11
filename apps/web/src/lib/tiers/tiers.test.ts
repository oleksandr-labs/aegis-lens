/**
 * Unit tests for tiers + paywall helpers.
 *
 * Run: npx vitest apps/web/src/lib/tiers/tiers.test.ts
 */

import { describe, expect, it } from "vitest";

// Mocking server-only so tests can import server modules without Next.js context.
// vitest.config.ts should alias "server-only" → a no-op.

import { tierIsAtLeast } from "./constants";
import { isNeverPaywalled } from "./free-tier-guard";
import { shouldShowUpgradeModal, buildUpgradeDeepLink } from "../paywall/upgrade-flow";

// ── tierIsAtLeast ─────────────────────────────────────────────────────────────

describe("tierIsAtLeast", () => {
  it("pro is at least free → true", () => {
    expect(tierIsAtLeast("pro", "free")).toBe(true);
  });

  it("free is at least pro → false", () => {
    expect(tierIsAtLeast("free", "pro")).toBe(false);
  });

  it("same tier → true", () => {
    expect(tierIsAtLeast("pro", "pro")).toBe(true);
  });

  it("anonymous is not at least free → false", () => {
    expect(tierIsAtLeast("anonymous", "free")).toBe(false);
  });

  it("enterprise is at least everything → true", () => {
    expect(tierIsAtLeast("enterprise", "anonymous")).toBe(true);
    expect(tierIsAtLeast("enterprise", "pro_plus")).toBe(true);
    expect(tierIsAtLeast("enterprise", "enterprise")).toBe(true);
  });

  it("observer is at least free → true", () => {
    expect(tierIsAtLeast("observer", "free")).toBe(true);
  });

  it("observer is NOT at least pro → false", () => {
    expect(tierIsAtLeast("observer", "pro")).toBe(false);
  });
});

// ── isNeverPaywalled ──────────────────────────────────────────────────────────

describe("isNeverPaywalled", () => {
  it("civilian_alert_sirens is never paywalled → true", () => {
    expect(isNeverPaywalled("civilian_alert_sirens")).toBe(true);
  });

  it("evacuation_routes is never paywalled → true", () => {
    expect(isNeverPaywalled("evacuation_routes")).toBe(true);
  });

  it("shelter_index is never paywalled → true", () => {
    expect(isNeverPaywalled("shelter_index")).toBe(true);
  });

  it("glossary is never paywalled → true", () => {
    expect(isNeverPaywalled("glossary")).toBe(true);
  });

  it("heatmap_subcountry IS paywalled → false", () => {
    expect(isNeverPaywalled("heatmap_subcountry")).toBe(false);
  });

  it("unknown feature IS paywalled → false", () => {
    expect(isNeverPaywalled("some_pro_only_feature")).toBe(false);
  });
});

// ── shouldShowUpgradeModal ────────────────────────────────────────────────────

describe("shouldShowUpgradeModal", () => {
  const now = new Date();

  it("first time ever (null) → show modal", () => {
    expect(shouldShowUpgradeModal(null, now)).toBe(true);
  });

  it("shown 20h ago → do NOT show (within 24h window)", () => {
    const twentyHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 20);
    expect(shouldShowUpgradeModal(twentyHoursAgo, now)).toBe(false);
  });

  it("shown 25h ago → show again (past 24h window)", () => {
    const twentyFiveHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 25);
    expect(shouldShowUpgradeModal(twentyFiveHoursAgo, now)).toBe(true);
  });

  it("shown exactly 24h ago → boundary: do NOT show (not strictly past window)", () => {
    const exactlyOneDay = new Date(now.getTime() - 1000 * 60 * 60 * 24);
    expect(shouldShowUpgradeModal(exactlyOneDay, now)).toBe(false);
  });

  it("shown 1 minute ago → do NOT show", () => {
    const oneMinAgo = new Date(now.getTime() - 60_000);
    expect(shouldShowUpgradeModal(oneMinAgo, now)).toBe(false);
  });
});

// ── buildUpgradeDeepLink ──────────────────────────────────────────────────────

describe("buildUpgradeDeepLink", () => {
  it("encodes feature URL and appends target tier", () => {
    const link = buildUpgradeDeepLink("/analytics/heatmap", "pro");
    expect(link).toBe("/pricing?plan=pro&return=%2Fanalytics%2Fheatmap");
  });

  it("handles query strings in feature URL", () => {
    const link = buildUpgradeDeepLink("/events?date=2024-01-01&region=kyiv", "observer");
    expect(link).toContain("plan=observer");
    expect(link).toContain("return=");
  });
});
