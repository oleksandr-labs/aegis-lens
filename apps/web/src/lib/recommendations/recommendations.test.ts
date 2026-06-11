/**
 * Vitest unit tests for the recommendation engine.
 *
 * Run: vitest run apps/web/src/lib/recommendations/recommendations.test.ts
 */

import { describe, expect, it } from "vitest";

import { isNewUser } from "./cold-start";
import { applyEditorialOverrides } from "./editorial-overrides";
import { isOptedOut } from "./opt-out";
import {
  computeRecencyBoost,
  computeRegionAffinity,
  DEFAULT_RECENCY_BOOST,
  injectDiversity,
} from "./scoring";
import type {
  EditorialOverride,
  OptOutConfig,
  RecommendableItem,
  ScoredItem,
  UserFeatureStore,
} from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeItem(
  id: string,
  regions: string[] = [],
  type: RecommendableItem["type"] = "report",
): RecommendableItem {
  return {
    id,
    type,
    title: { en: `Item ${id}` },
    tags: [],
    regions,
    topics: [],
    publishedAt: new Date().toISOString(),
  };
}

function makeScoredItem(
  id: string,
  score: number,
  regions: string[] = [],
  type: RecommendableItem["type"] = "report",
): ScoredItem {
  return {
    item: makeItem(id, regions, type),
    score,
    explanation: {
      reason_en: "test",
      reason_uk: "тест",
      signals: [],
    },
  };
}

// ── isNewUser ─────────────────────────────────────────────────────────────────

describe("isNewUser", () => {
  it("returns true when featureStore is null", () => {
    expect(isNewUser(null)).toBe(true);
  });

  it("returns true when recentFilters and watchlists are both empty", () => {
    const store: UserFeatureStore = {
      userId: "u1",
      recentFilters: [],
      watchlists: [],
      persona: "general",
      regionAffinity: ["UA-14"],
      topicAffinity: ["conflict"],
      recentItemIds: ["item-1"],
      lastActiveAt: new Date().toISOString(),
    };
    expect(isNewUser(store)).toBe(true);
  });

  it("returns false when user has watchlists", () => {
    const store: UserFeatureStore = {
      userId: "u2",
      recentFilters: [],
      watchlists: ["UA-14"],
      persona: "journalist",
      regionAffinity: [],
      topicAffinity: [],
      recentItemIds: [],
      lastActiveAt: new Date().toISOString(),
    };
    expect(isNewUser(store)).toBe(false);
  });

  it("returns false when user has recent filters", () => {
    const store: UserFeatureStore = {
      userId: "u3",
      recentFilters: ["conflict"],
      watchlists: [],
      persona: "researcher",
      regionAffinity: [],
      topicAffinity: [],
      recentItemIds: [],
      lastActiveAt: new Date().toISOString(),
    };
    expect(isNewUser(store)).toBe(false);
  });
});

// ── computeRecencyBoost ───────────────────────────────────────────────────────

describe("computeRecencyBoost", () => {
  it("returns close to maxBoost for a just-published item", () => {
    const publishedAt = new Date().toISOString();
    const boost = computeRecencyBoost(publishedAt);
    // Just published: ageHours ≈ 0, boost ≈ maxBoost
    expect(boost).toBeGreaterThan(DEFAULT_RECENCY_BOOST.maxBoost * 0.99);
    expect(boost).toBeLessThanOrEqual(DEFAULT_RECENCY_BOOST.maxBoost);
  });

  it("returns maxBoost / 2 for an item published exactly halfLifeHours ago", () => {
    const halfLifeHours = DEFAULT_RECENCY_BOOST.halfLifeHours;
    const publishedAt = new Date(
      Date.now() - halfLifeHours * 3_600_000,
    ).toISOString();
    const boost = computeRecencyBoost(publishedAt);
    const expected = DEFAULT_RECENCY_BOOST.maxBoost / 2;
    expect(boost).toBeCloseTo(expected, 5);
  });

  it("returns close to 0 for a very old item", () => {
    const publishedAt = new Date(
      Date.now() - 30 * 24 * 3_600_000, // 30 days ago
    ).toISOString();
    const boost = computeRecencyBoost(publishedAt);
    expect(boost).toBeLessThan(0.001);
  });

  it("returns maxBoost for a future-dated item", () => {
    const publishedAt = new Date(Date.now() + 3_600_000).toISOString();
    const boost = computeRecencyBoost(publishedAt);
    expect(boost).toBe(DEFAULT_RECENCY_BOOST.maxBoost);
  });
});

// ── computeRegionAffinity ─────────────────────────────────────────────────────

describe("computeRegionAffinity", () => {
  it("returns 0.5 for Jaccard(["UA-14"], ["UA-14","UA-63"])", () => {
    // |intersection| = 1, |union| = 2 → 0.5
    expect(computeRegionAffinity(["UA-14"], ["UA-14", "UA-63"])).toBeCloseTo(0.5, 10);
  });

  it("returns 1.0 for identical sets", () => {
    expect(computeRegionAffinity(["UA-14", "UA-63"], ["UA-14", "UA-63"])).toBe(1);
  });

  it("returns 0 for disjoint sets", () => {
    expect(computeRegionAffinity(["UA-14"], ["UA-63"])).toBe(0);
  });

  it("returns 0 when both sets are empty", () => {
    expect(computeRegionAffinity([], [])).toBe(0);
  });
});

// ── injectDiversity ───────────────────────────────────────────────────────────

describe("injectDiversity", () => {
  it("ensures no two consecutive items share the same region", () => {
    const items: ScoredItem[] = [
      makeScoredItem("a", 1.0, ["UA-14"]),
      makeScoredItem("b", 0.9, ["UA-14"]),
      makeScoredItem("c", 0.8, ["UA-63"]),
      makeScoredItem("d", 0.7, ["UA-63"]),
      makeScoredItem("e", 0.6, ["UA-40"]),
    ];
    const result = injectDiversity(items);
    for (let i = 1; i < result.length; i++) {
      const prevRegion = result[i - 1].item.regions[0];
      const currRegion = result[i].item.regions[0];
      // If both have regions and they are the same, it's a diversity failure
      if (prevRegion && currRegion) {
        expect(currRegion).not.toBe(prevRegion);
      }
    }
  });

  it("returns the same items (all ids present)", () => {
    const items: ScoredItem[] = [
      makeScoredItem("a", 1.0, ["UA-14"]),
      makeScoredItem("b", 0.9, ["UA-14"]),
      makeScoredItem("c", 0.8, ["UA-63"]),
    ];
    const result = injectDiversity(items);
    const ids = result.map((si) => si.item.id).sort();
    expect(ids).toEqual(["a", "b", "c"]);
  });

  it("returns original order when diversityFactor is 0", () => {
    const items: ScoredItem[] = [
      makeScoredItem("a", 1.0, ["UA-14"]),
      makeScoredItem("b", 0.9, ["UA-14"]),
    ];
    const result = injectDiversity(items, 0);
    expect(result.map((si) => si.item.id)).toEqual(["a", "b"]);
  });
});

// ── applyEditorialOverrides ───────────────────────────────────────────────────

describe("applyEditorialOverrides", () => {
  it("removes suppressed items from results", () => {
    const items: ScoredItem[] = [
      makeScoredItem("item-1", 0.8),
      makeScoredItem("item-2", 0.6),
      makeScoredItem("item-3", 0.4),
    ];
    const overrides: EditorialOverride[] = [
      {
        itemId: "item-2",
        action: "suppress",
        reason: "Unverified source",
        createdBy: "editor@aegislens.com",
      },
    ];
    const result = applyEditorialOverrides(items, overrides);
    const ids = result.map((si) => si.item.id);
    expect(ids).not.toContain("item-2");
    expect(ids).toContain("item-1");
    expect(ids).toContain("item-3");
  });

  it("doubles score (capped at 1.0) for boosted items", () => {
    const items: ScoredItem[] = [makeScoredItem("item-1", 0.4)];
    const overrides: EditorialOverride[] = [
      {
        itemId: "item-1",
        action: "boost",
        reason: "Editorial pick",
        createdBy: "editor@aegislens.com",
      },
    ];
    const result = applyEditorialOverrides(items, overrides);
    expect(result[0].score).toBeCloseTo(0.8, 10);
  });

  it("caps boosted score at 1.0", () => {
    const items: ScoredItem[] = [makeScoredItem("item-1", 0.9)];
    const overrides: EditorialOverride[] = [
      {
        itemId: "item-1",
        action: "boost",
        reason: "Breaking news",
        createdBy: "editor@aegislens.com",
      },
    ];
    const result = applyEditorialOverrides(items, overrides);
    expect(result[0].score).toBe(1.0);
  });

  it("ignores expired overrides", () => {
    const items: ScoredItem[] = [
      makeScoredItem("item-1", 0.8),
      makeScoredItem("item-2", 0.6),
    ];
    const overrides: EditorialOverride[] = [
      {
        itemId: "item-2",
        action: "suppress",
        reason: "Expired",
        expiresAt: new Date(Date.now() - 1000).toISOString(), // already expired
        createdBy: "editor@aegislens.com",
      },
    ];
    const result = applyEditorialOverrides(items, overrides);
    expect(result.map((si) => si.item.id)).toContain("item-2");
  });

  it("adds editorial_boost signal to boosted item explanation", () => {
    const items: ScoredItem[] = [makeScoredItem("item-1", 0.4)];
    const overrides: EditorialOverride[] = [
      {
        itemId: "item-1",
        action: "boost",
        reason: "Highlighted",
        createdBy: "editor@aegislens.com",
      },
    ];
    const result = applyEditorialOverrides(items, overrides);
    expect(result[0].explanation.signals).toContain("editorial_boost");
  });
});

// ── isOptedOut ────────────────────────────────────────────────────────────────

describe("isOptedOut", () => {
  it("returns true when surface is in opted-out list", () => {
    const config: OptOutConfig = {
      userId: "u1",
      surfaces: ["email", "sidebar"],
      updatedAt: new Date().toISOString(),
    };
    expect(isOptedOut(config, "email")).toBe(true);
  });

  it("returns false when surface is NOT in opted-out list", () => {
    const config: OptOutConfig = {
      userId: "u1",
      surfaces: ["email"],
      updatedAt: new Date().toISOString(),
    };
    expect(isOptedOut(config, "home_feed")).toBe(false);
  });

  it("returns false when config is null", () => {
    expect(isOptedOut(null, "home_feed")).toBe(false);
  });

  it("returns false when surfaces list is empty", () => {
    const config: OptOutConfig = {
      userId: "u1",
      surfaces: [],
      updatedAt: new Date().toISOString(),
    };
    expect(isOptedOut(config, "dashboard")).toBe(false);
  });
});
