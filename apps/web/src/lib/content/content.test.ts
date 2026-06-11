/**
 * Content Strategy + Topical Authority — unit tests
 * Ukrainian MAP / Aegis Lens
 *
 * Run with: pnpm vitest run apps/web/src/lib/content/content.test.ts
 */

import { describe, expect, it } from "vitest";

import { EDITORIAL_SCHEDULE, getNextPublishDate } from "./editorial-calendar";
import { PILLAR_PAGES } from "./pillar-config";
import {
  computeClusterMaturity,
  getStaleClusterItems,
} from "../seo/topical-authority/cluster-kpi";
import { computeCoverageGap } from "../seo/topical-authority/cluster-map";
import type { ClusterKpi, ClusterRefreshPolicy } from "../seo/topical-authority/types";

// ---------------------------------------------------------------------------
// Pillar pages
// ---------------------------------------------------------------------------

describe("PILLAR_PAGES", () => {
  it("has exactly 8 entries", () => {
    expect(PILLAR_PAGES).toHaveLength(8);
  });

  it("every pillar has a non-empty English title", () => {
    for (const pillar of PILLAR_PAGES) {
      expect(pillar.title.en.length).toBeGreaterThan(0);
    }
  });

  it("every pillar has a wordCountTarget >= 3000", () => {
    for (const pillar of PILLAR_PAGES) {
      expect(pillar.wordCountTarget).toBeGreaterThanOrEqual(3000);
    }
  });

  it("every pillar has a unique id", () => {
    const ids = PILLAR_PAGES.map((p) => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// Editorial schedule
// ---------------------------------------------------------------------------

describe("EDITORIAL_SCHEDULE", () => {
  it("has exactly 5 rules", () => {
    expect(EDITORIAL_SCHEDULE).toHaveLength(5);
  });

  it("every rule has a non-empty English description", () => {
    for (const rule of EDITORIAL_SCHEDULE) {
      expect(rule.description.en.length).toBeGreaterThan(0);
    }
  });

  it("every rule has a non-empty Ukrainian description", () => {
    for (const rule of EDITORIAL_SCHEDULE) {
      expect(rule.description.uk.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// getNextPublishDate — weekly (Monday) rule
// ---------------------------------------------------------------------------

describe("getNextPublishDate", () => {
  it("returns a future Monday for the weekly-intel-brief rule", () => {
    const weeklyRule = EDITORIAL_SCHEDULE.find(
      (r) => r.id === "weekly-intel-brief"
    );
    expect(weeklyRule).toBeDefined();

    // Use a known Tuesday as reference so the next Monday is unambiguous
    const tuesday = new Date("2026-06-09"); // a Tuesday
    const nextMonday = getNextPublishDate(weeklyRule!, tuesday);

    // Result must be after the reference date
    expect(nextMonday.getTime()).toBeGreaterThan(tuesday.getTime());

    // Day of week must be Monday (1)
    expect(nextMonday.getDay()).toBe(1);
  });

  it("returns a different Monday when called from a Monday (next week)", () => {
    const weeklyRule = EDITORIAL_SCHEDULE.find(
      (r) => r.id === "weekly-intel-brief"
    );
    expect(weeklyRule).toBeDefined();

    const monday = new Date("2026-06-08"); // a known Monday
    const nextMonday = getNextPublishDate(weeklyRule!, monday);

    // Must be strictly after the given Monday
    expect(nextMonday.getTime()).toBeGreaterThan(monday.getTime());
    expect(nextMonday.getDay()).toBe(1);
  });

  it("returns same day for event-triggered (intervalDays: 0) rule", () => {
    const reactionRule = EDITORIAL_SCHEDULE.find(
      (r) => r.id === "reaction-post"
    );
    expect(reactionRule).toBeDefined();

    const from = new Date("2026-06-10");
    const result = getNextPublishDate(reactionRule!, from);

    expect(result.toISOString().slice(0, 10)).toBe("2026-06-10");
  });

  it("bi-weekly rule returns date intervalDays days ahead", () => {
    const biweeklyRule = EDITORIAL_SCHEDULE.find(
      (r) => r.id === "methodology-biweekly"
    );
    expect(biweeklyRule).toBeDefined();

    const from = new Date("2026-06-10");
    const next = getNextPublishDate(biweeklyRule!, from);
    const diffDays =
      (next.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);

    expect(diffDays).toBe(14);
  });
});

// ---------------------------------------------------------------------------
// computeCoverageGap
// ---------------------------------------------------------------------------

describe("computeCoverageGap", () => {
  it("returns subtopics not present in existingPostSlugs", () => {
    const existing = [
      "reverse-image-search-techniques",
      "video-geolocation-verification",
    ];
    const gaps = computeCoverageGap("verification", existing);

    // None of the existing slugs should appear in gaps
    for (const slug of existing) {
      expect(gaps).not.toContain(slug);
    }

    // Gaps must be a non-empty array (verification has 20 child topics)
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps.length).toBe(20 - existing.length);
  });

  it("returns empty array when all child topics are covered", () => {
    // Use equipment_id which has 15 child topics; pass all of them inline
    const { CLUSTER_HIERARCHY } = require("../seo/topical-authority/cluster-map") as typeof import("../seo/topical-authority/cluster-map");
    const childTopics = CLUSTER_HIERARCHY["equipment_id"].childTopics;

    const gaps = computeCoverageGap("equipment_id", childTopics);
    expect(gaps).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// computeClusterMaturity
// ---------------------------------------------------------------------------

describe("computeClusterMaturity", () => {
  const baseKpi: ClusterKpi = {
    clusterId: "verification",
    organicShareOfVoice: 0.1,
    postCount: 20,
    avgRankedKeywords: 15,
    coveredSubtopics: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
    missingSubtopics: ["k", "l"],
    lastAuditedAt: "2026-05-01",
  };

  it("5 posts → not mature, blockers include post count", () => {
    const kpi: ClusterKpi = { ...baseKpi, postCount: 5 };
    const result = computeClusterMaturity(kpi);

    expect(result.mature).toBe(false);
    expect(result.blockers.some((b) => b.toLowerCase().includes("post count"))).toBe(
      true
    );
  });

  it("20 posts + low SoV → not mature, blockers include share-of-voice", () => {
    const kpi: ClusterKpi = {
      ...baseKpi,
      postCount: 20,
      organicShareOfVoice: 0.02, // below 0.05 threshold
    };
    const result = computeClusterMaturity(kpi);

    expect(result.mature).toBe(false);
    expect(
      result.blockers.some((b) => b.toLowerCase().includes("share-of-voice"))
    ).toBe(true);
  });

  it("20 posts + high SoV + few missing → mature", () => {
    const kpi: ClusterKpi = {
      ...baseKpi,
      postCount: 20,
      organicShareOfVoice: 0.08,
      missingSubtopics: ["x"],
    };
    const result = computeClusterMaturity(kpi);

    expect(result.mature).toBe(true);
    expect(result.blockers).toHaveLength(0);
    expect(result.score).toBeGreaterThan(80);
  });

  it("score is 0–100", () => {
    const worst: ClusterKpi = {
      ...baseKpi,
      postCount: 0,
      organicShareOfVoice: 0,
      missingSubtopics: Array.from({ length: 20 }, (_, i) => `m${i}`),
    };
    const { score } = computeClusterMaturity(worst);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// getStaleClusterItems
// ---------------------------------------------------------------------------

describe("getStaleClusterItems", () => {
  const kpi: ClusterKpi = {
    clusterId: "methodology",
    organicShareOfVoice: 0.07,
    postCount: 10,
    avgRankedKeywords: 8,
    coveredSubtopics: ["osint-tools-directory", "structured-analytic-techniques"],
    missingSubtopics: [],
    lastAuditedAt: "2025-01-01", // very old
  };

  const policy: ClusterRefreshPolicy = {
    clusterId: "methodology",
    reviewIntervalDays: 90,
    staleThresholdDays: 180,
    autoFlagStale: true,
  };

  it("flags covered subtopics as stale when audit is old", () => {
    const now = new Date("2026-06-10");
    const stale = getStaleClusterItems(kpi, policy, now);
    expect(stale).toEqual(kpi.coveredSubtopics);
  });

  it("returns empty array when autoFlagStale is false", () => {
    const now = new Date("2026-06-10");
    const stale = getStaleClusterItems(kpi, { ...policy, autoFlagStale: false }, now);
    expect(stale).toHaveLength(0);
  });

  it("returns empty array when audit is recent", () => {
    const recentKpi: ClusterKpi = { ...kpi, lastAuditedAt: "2026-06-01" };
    const now = new Date("2026-06-10");
    const stale = getStaleClusterItems(recentKpi, policy, now);
    expect(stale).toHaveLength(0);
  });
});
