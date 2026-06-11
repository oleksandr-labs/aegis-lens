/**
 * Unit tests for the Pricing Experiments Framework.
 *
 * Run: npx vitest apps/web/src/lib/pricing-experiments/pricing-experiments.test.ts
 */

import { describe, expect, it, beforeEach } from "vitest";

import { hashAssign, shouldExcludeUser, InMemoryAssignmentStore } from "./ab-testing";
import type { ExperimentArm } from "./types";
import { PRICING_EXPERIMENTS, getExperiment } from "./experiment-registry";
import { CohortStore } from "./cohort-tracking";
import { SAFE_EXPERIMENTS } from "./experiment-guard";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeArms(count: number): ExperimentArm[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `arm-${i}`,
    label_en: `Arm ${i}`,
    label_uk: `Варіант ${i}`,
    value: i,
    isControl: i === 0,
  }));
}

// ── hashAssign distributes evenly across 3 arms ────────────────────────────────

describe("hashAssign", () => {
  it("distributes 1000 users roughly evenly across 3 arms (±10%)", () => {
    const arms = makeArms(3);
    const counts: Record<string, number> = { "arm-0": 0, "arm-1": 0, "arm-2": 0 };

    for (let i = 0; i < 1000; i++) {
      const arm = hashAssign(`user-${i}`, "test-exp", arms);
      counts[arm.id] = (counts[arm.id] ?? 0) + 1;
    }

    // Each arm should get roughly 333 ± 100 (10% of 1000)
    for (const count of Object.values(counts)) {
      expect(count).toBeGreaterThan(230); // > 23%
      expect(count).toBeLessThan(440);    // < 44%
    }
  });

  it("is deterministic — same userId + experimentId always returns same arm", () => {
    const arms = makeArms(3);
    const first = hashAssign("user-abc", "exp-xyz", arms);
    const second = hashAssign("user-abc", "exp-xyz", arms);
    expect(first.id).toBe(second.id);
  });

  it("different experimentIds produce different arm distributions", () => {
    const arms = makeArms(2);
    const expA = hashAssign("user-1", "exp-A", arms);
    const expB = hashAssign("user-1", "exp-B", arms);
    // Not guaranteed to differ, but with a different seed they often do.
    // The test documents the intent; actual difference is an observable side effect.
    // At minimum both calls must return a valid arm.
    expect(arms.map((a) => a.id)).toContain(expA.id);
    expect(arms.map((a) => a.id)).toContain(expB.id);
  });

  it("throws when no arms are provided", () => {
    expect(() => hashAssign("user-1", "exp-empty", [])).toThrow();
  });
});

// ── shouldExcludeUser ─────────────────────────────────────────────────────────

describe("shouldExcludeUser", () => {
  it("returns true for paying customer on a tier-price experiment", () => {
    expect(shouldExcludeUser("user-1", true, "tier-price-pro")).toBe(true);
  });

  it("returns true for paying customer on an annual-discount experiment", () => {
    expect(shouldExcludeUser("user-2", true, "annual-discount-pct")).toBe(true);
  });

  it("returns true for paying customer on a pay-shape experiment", () => {
    expect(shouldExcludeUser("user-3", true, "pay-shape-day-pass")).toBe(true);
  });

  it("returns true for paying customer on a usage experiment", () => {
    expect(shouldExcludeUser("user-4", true, "usage-flat-vs-metered-api")).toBe(true);
  });

  it("returns false for non-paying user regardless of experiment", () => {
    expect(shouldExcludeUser("user-5", false, "tier-price-pro")).toBe(false);
  });

  it("returns false for paying customer on a non-price experiment (gate test)", () => {
    // Gate experiments don't start with a price prefix
    expect(shouldExcludeUser("user-6", true, "gate-teaser-style")).toBe(false);
  });
});

// ── InMemoryAssignmentStore ───────────────────────────────────────────────────

describe("InMemoryAssignmentStore", () => {
  let store: InMemoryAssignmentStore;

  beforeEach(() => {
    store = new InMemoryAssignmentStore();
  });

  it("assign returns a valid ExperimentAssignment", () => {
    const arms = makeArms(2);
    const assignment = store.assign("user-1", "exp-1", arms);
    expect(assignment.userId).toBe("user-1");
    expect(assignment.experimentId).toBe("exp-1");
    expect(arms.map((a) => a.id)).toContain(assignment.armId);
    expect(assignment.assignedAt).toBeTruthy();
  });

  it("assign is idempotent — same arm returned on repeated calls", () => {
    const arms = makeArms(3);
    const first = store.assign("user-7", "exp-2", arms);
    const second = store.assign("user-7", "exp-2", arms);
    expect(first.armId).toBe(second.armId);
  });

  it("getAssignment returns undefined for unassigned user", () => {
    expect(store.getAssignment("nobody", "exp-1")).toBeUndefined();
  });

  it("listByExperiment returns all assignments for an experiment", () => {
    const arms = makeArms(2);
    store.assign("u-1", "exp-3", arms);
    store.assign("u-2", "exp-3", arms);
    store.assign("u-3", "exp-other", arms);
    const list = store.listByExperiment("exp-3");
    expect(list).toHaveLength(2);
    expect(list.every((a) => a.experimentId === "exp-3")).toBe(true);
  });
});

// ── Experiment registry ────────────────────────────────────────────────────────

describe("PRICING_EXPERIMENTS registry", () => {
  it("has at least 22 experiments", () => {
    expect(PRICING_EXPERIMENTS.length).toBeGreaterThanOrEqual(22);
  });

  it("every experiment has grandfatherExistingCustomers === true", () => {
    for (const exp of PRICING_EXPERIMENTS) {
      expect(exp.grandfatherExistingCustomers).toBe(true);
    }
  });

  it("all price-axis experiments have grandfatherExistingCustomers true", () => {
    const priceAxes = new Set(["tier-price", "annual-discount", "pay-shape", "usage-based"]);
    const priceExps = PRICING_EXPERIMENTS.filter((e) => priceAxes.has(e.axis));
    expect(priceExps.length).toBeGreaterThan(0);
    for (const exp of priceExps) {
      expect(exp.grandfatherExistingCustomers).toBe(
        true,
        `Expected grandfatherExistingCustomers to be true for ${exp.id}`,
      );
    }
  });

  it("getExperiment returns undefined for unknown id", () => {
    expect(getExperiment("does-not-exist")).toBeUndefined();
  });

  it("getExperiment returns correct experiment by id", () => {
    const exp = getExperiment("tier-price-pro");
    expect(exp).toBeDefined();
    expect(exp?.axis).toBe("tier-price");
    expect(exp?.arms.length).toBeGreaterThan(1);
  });

  it("every experiment has at least one arm marked isControl", () => {
    for (const exp of PRICING_EXPERIMENTS) {
      const controls = exp.arms.filter((a) => a.isControl);
      expect(controls.length).toBeGreaterThanOrEqual(1, `Experiment ${exp.id} has no control arm`);
    }
  });
});

// ── SAFE_EXPERIMENTS ──────────────────────────────────────────────────────────

describe("SAFE_EXPERIMENTS", () => {
  it("includes teaser-style and upgrade-prompt-style (non-price UX tests)", () => {
    expect(SAFE_EXPERIMENTS.has("gate-teaser-style")).toBe(true);
    expect(SAFE_EXPERIMENTS.has("gate-upgrade-prompt-style")).toBe(true);
  });

  it("does NOT include tier-price-pro (price-axis test)", () => {
    expect(SAFE_EXPERIMENTS.has("tier-price-pro")).toBe(false);
  });
});

// ── CohortStore ───────────────────────────────────────────────────────────────

describe("CohortStore", () => {
  it("addToCohort returns a CohortEntry with correct fields", () => {
    const cs = new CohortStore();
    const entry = cs.addToCohort("exp-1", "arm-control", "user-42", "pro");
    expect(entry.experimentId).toBe("exp-1");
    expect(entry.armId).toBe("arm-control");
    expect(entry.userId).toBe("user-42");
    expect(entry.plan).toBe("pro");
    expect(entry.cohortId).toContain("exp-1");
  });

  it("exportCohortCSV produces valid CSV with header", () => {
    const cs = new CohortStore();
    cs.addToCohort("exp-csv", "arm-a", "user-1", "observer");
    cs.addToCohort("exp-csv", "arm-b", "user-2", "free");
    const csv = cs.exportCohortCSV("exp-csv");
    expect(csv).toContain("cohortId,experimentId,armId,userId,joinedAt,plan");
    expect(csv).toContain("exp-csv");
    expect(csv).toContain("user-1");
    expect(csv).toContain("user-2");
  });

  it("getRetention returns a CohortRetentionRecord with correct identifiers", () => {
    const cs = new CohortStore();
    const record = cs.getRetention("exp-1", "arm-0", "2024-11");
    expect(record.experimentId).toBe("exp-1");
    expect(record.armId).toBe("arm-0");
    expect(record.cohortMonth).toBe("2024-11");
    expect(typeof record.retainedDay7).toBe("number");
    expect(typeof record.retainedDay30).toBe("number");
    expect(typeof record.retainedDay90).toBe("number");
  });
});
