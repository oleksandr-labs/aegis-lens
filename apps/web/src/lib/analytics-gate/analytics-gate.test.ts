/**
 * analytics-gate/analytics-gate.test.ts
 * Vitest unit tests for the analytics gating module.
 *
 * Run:  npx vitest run src/lib/analytics-gate/analytics-gate.test.ts
 */

import { describe, expect, it } from "vitest";

import { checkAnalyticAccess, getEffectiveFreshness } from "./check-gate";
import { ANALYTIC_GATES } from "./gate-config";
import { buildTeaserData, formatTeaserNumber, shouldShowLockIcon } from "./teaser-policy";
import { checkUpgradeTrigger } from "./upgrade-triggers";

// ── Access gating ─────────────────────────────────────────────────────────────

describe("checkAnalyticAccess", () => {
  it("free tier cannot access forecast_24h (minTier = pro_plus)", () => {
    const result = checkAnalyticAccess("forecast_24h", "free");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.minTier).toBe("pro_plus");
    }
  });

  it("anonymous tier cannot access forecast_24h", () => {
    const result = checkAnalyticAccess("forecast_24h", "anonymous");
    expect(result.allowed).toBe(false);
  });

  it("pro_plus tier CAN access forecast_24h", () => {
    expect(checkAnalyticAccess("forecast_24h", "pro_plus").allowed).toBe(true);
  });

  it("pro tier can access trend_lines (minTier = pro)", () => {
    expect(checkAnalyticAccess("trend_lines", "pro").allowed).toBe(true);
  });

  it("observer tier cannot access trend_lines", () => {
    const result = checkAnalyticAccess("trend_lines", "observer");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.minTier).toBe("pro");
    }
  });

  it("enterprise tier can access all analytics", () => {
    const allIds = Object.keys(ANALYTIC_GATES) as (keyof typeof ANALYTIC_GATES)[];
    for (const id of allIds) {
      expect(checkAnalyticAccess(id, "enterprise").allowed).toBe(true);
    }
  });

  it("returns teaserPolicy when access is denied", () => {
    const result = checkAnalyticAccess("heatmap", "free");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.teaserPolicy).toBeDefined();
      expect(result.teaserPolicy.showLockIcon).toBe(true);
    }
  });
});

// ── Freshness ─────────────────────────────────────────────────────────────────

describe("getEffectiveFreshness", () => {
  it("enterprise gets realtime freshness for event_counter", () => {
    expect(getEffectiveFreshness("event_counter", "enterprise")).toBe("realtime");
  });

  it("pro gets realtime freshness for trend_lines", () => {
    expect(getEffectiveFreshness("trend_lines", "pro")).toBe("realtime");
  });

  it("free gets 15min freshness for event_counter", () => {
    expect(getEffectiveFreshness("event_counter", "free")).toBe("15min");
  });

  it("observer gets daily freshness for heatmap", () => {
    expect(getEffectiveFreshness("heatmap", "observer")).toBe("daily");
  });

  it("pro gets hourly freshness for heatmap", () => {
    expect(getEffectiveFreshness("heatmap", "pro")).toBe("hourly");
  });
});

// ── Teaser number formatting ───────────────────────────────────────────────────

describe("formatTeaserNumber", () => {
  it('formats 1247 as "≈ 1.2k"', () => {
    expect(formatTeaserNumber(1247)).toBe("≈ 1.2k");
  });

  it('formats 340 as "≈ 300"', () => {
    expect(formatTeaserNumber(340)).toBe("≈ 300");
  });

  it('formats 1_000_000 as "≈ 1M"', () => {
    expect(formatTeaserNumber(1_000_000)).toBe("≈ 1M");
  });

  it('formats 1_200_000 as "≈ 1.2M"', () => {
    expect(formatTeaserNumber(1_200_000)).toBe("≈ 1.2M");
  });

  it('formats 88_500 as "≈ 89k"', () => {
    expect(formatTeaserNumber(88_500)).toBe("≈ 89k");
  });

  it('formats 42 as "≈ 40"', () => {
    expect(formatTeaserNumber(42)).toBe("≈ 40");
  });

  it('formats 1000 as "≈ 1k"', () => {
    expect(formatTeaserNumber(1000)).toBe("≈ 1k");
  });

  it('returns "≈ ?" for negative numbers', () => {
    expect(formatTeaserNumber(-5)).toBe("≈ ?");
  });
});

// ── buildTeaserData ───────────────────────────────────────────────────────────

describe("buildTeaserData", () => {
  it("returns rounded value when rawValue provided", () => {
    const data = buildTeaserData("forecast_24h", "free", 1247);
    expect(data.roundedValue).toBe("≈ 1.2k");
  });

  it("returns null roundedValue when no rawValue", () => {
    const data = buildTeaserData("forecast_24h", "free");
    expect(data.roundedValue).toBeNull();
  });

  it("always sets showLockIcon = true", () => {
    const data = buildTeaserData("trend_lines", "observer");
    expect(data.showLockIcon).toBe(true);
  });

  it("sets upgradeToTier from gate config", () => {
    const data = buildTeaserData("trend_lines", "observer");
    expect(data.upgradeToTier).toBe("pro");
  });
});

// ── shouldShowLockIcon ────────────────────────────────────────────────────────

describe("shouldShowLockIcon", () => {
  it("shows lock icon when user is below minTier", () => {
    expect(shouldShowLockIcon("forecast_24h", "pro")).toBe(true);
  });

  it("does not show lock icon when user meets minTier", () => {
    expect(shouldShowLockIcon("forecast_24h", "pro_plus")).toBe(false);
  });

  it("does not show lock icon for enterprise on any analytic", () => {
    const allIds = Object.keys(ANALYTIC_GATES) as (keyof typeof ANALYTIC_GATES)[];
    for (const id of allIds) {
      expect(shouldShowLockIcon(id, "enterprise")).toBe(false);
    }
  });
});

// ── Upgrade triggers ──────────────────────────────────────────────────────────

describe("checkUpgradeTrigger", () => {
  it("trigger 2 (lookback_wall) fires for AOI date range request", () => {
    const prompt = checkUpgradeTrigger({
      type: "lookback_wall",
      userTier: "free",
      analyticId: "trend_lines",
      payload: { requestedDays: 400 }, // > 30d but ≤ 1y → pro
    });
    expect(prompt).not.toBeNull();
    expect(prompt?.triggeredBy).toBe("lookback_wall");
    expect(prompt?.suggestedTier).toBe("pro_plus");
  });

  it("aoi_limit_reached fires for free user", () => {
    const prompt = checkUpgradeTrigger({
      type: "aoi_limit_reached",
      userTier: "free",
    });
    expect(prompt).not.toBeNull();
    expect(prompt?.suggestedTier).toBe("pro_plus");
    expect(prompt?.telemetryLabel).toBe("aoi_limit_reached__free_to_pro_plus");
  });

  it("aoi_limit_reached does NOT fire for pro_plus user", () => {
    const prompt = checkUpgradeTrigger({
      type: "aoi_limit_reached",
      userTier: "pro_plus",
    });
    expect(prompt).toBeNull();
  });

  it("api_access_denied fires for observer tier", () => {
    const prompt = checkUpgradeTrigger({
      type: "api_access_denied",
      userTier: "observer",
    });
    expect(prompt).not.toBeNull();
    expect(prompt?.suggestedTier).toBe("pro");
  });

  it("api_access_denied does NOT fire for pro tier", () => {
    const prompt = checkUpgradeTrigger({
      type: "api_access_denied",
      userTier: "pro",
    });
    expect(prompt).toBeNull();
  });

  it("export_blocked returns correct tier for bulk_raw format", () => {
    const prompt = checkUpgradeTrigger({
      type: "export_blocked",
      userTier: "pro",
      payload: { format: "bulk_raw" },
    });
    expect(prompt?.suggestedTier).toBe("business");
  });

  it("locked_analytic_clicked includes analytic name in telemetry label", () => {
    const prompt = checkUpgradeTrigger({
      type: "locked_analytic_clicked",
      userTier: "free",
      analyticId: "network_graph",
    });
    expect(prompt?.telemetryLabel).toContain("network_graph");
  });

  it("returns null when no trigger matches", () => {
    // freshness_wall for enterprise should theoretically match the trigger
    // but enterprise has no freshness wall — use a type that no definition covers
    const prompt = checkUpgradeTrigger({
      // @ts-expect-error — deliberately unknown type for coverage
      type: "unknown_trigger_type",
      userTier: "free",
    });
    expect(prompt).toBeNull();
  });
});
