import { describe, it, expect } from "vitest";
import {
  CWV_BUDGETS,
  evaluateMetric,
  evaluateReport,
  type MetricSample,
} from "./budgets";

describe("CWV budgets", () => {
  it("encodes the Sprint 2.61 targets", () => {
    expect(CWV_BUDGETS.LCP.good).toBe(2000);
    expect(CWV_BUDGETS.INP.good).toBe(200);
    expect(CWV_BUDGETS.CLS.good).toBe(0.05);
    expect(CWV_BUDGETS.TTFB.good).toBe(600);
  });
});

describe("evaluateMetric", () => {
  it("passes a value at or under the good ceiling", () => {
    const r = evaluateMetric({ metric: "LCP", p75: 1800 });
    expect(r.verdict).toBe("pass");
    expect(r.overBy).toBe(0);
  });

  it("passes exactly at the ceiling (inclusive)", () => {
    expect(evaluateMetric({ metric: "INP", p75: 200 }).verdict).toBe("pass");
  });

  it("flags needs-improvement between good and poor", () => {
    const r = evaluateMetric({ metric: "LCP", p75: 3000 });
    expect(r.verdict).toBe("needs-improvement");
    expect(r.overBy).toBe(1000);
  });

  it("fails above the poor floor", () => {
    expect(evaluateMetric({ metric: "TTFB", p75: 2000 }).verdict).toBe("fail");
  });

  it("handles CLS ratio units with sub-integer overBy", () => {
    const r = evaluateMetric({ metric: "CLS", p75: 0.12 });
    expect(r.verdict).toBe("needs-improvement");
    expect(r.overBy).toBeCloseTo(0.07, 5);
  });
});

describe("evaluateReport", () => {
  const allGood: MetricSample[] = [
    { metric: "LCP", p75: 1500 },
    { metric: "INP", p75: 120 },
    { metric: "CLS", p75: 0.02 },
    { metric: "TTFB", p75: 400 },
  ];

  it("passes when every metric is within budget", () => {
    const rep = evaluateReport("landing", allGood);
    expect(rep.pass).toBe(true);
    expect(rep.failures).toHaveLength(0);
  });

  it("fails a public surface with any non-passing metric", () => {
    const rep = evaluateReport("programmatic", [
      ...allGood.slice(1),
      { metric: "LCP", p75: 5000 },
    ]);
    expect(rep.pass).toBe(false);
    expect(rep.failures[0].metric).toBe("LCP");
    expect(rep.failures[0].verdict).toBe("fail");
  });

  it("sorts failures worst-first (fail before needs-improvement)", () => {
    const rep = evaluateReport("landing", [
      { metric: "LCP", p75: 3000 }, // needs-improvement
      { metric: "TTFB", p75: 2500 }, // fail
    ]);
    expect(rep.failures.map((f) => f.metric)).toEqual(["TTFB", "LCP"]);
  });

  it("exempts the authenticated workspace surface", () => {
    const rep = evaluateReport("workspace", [{ metric: "LCP", p75: 9000 }]);
    expect(rep.pass).toBe(true);
    expect(rep.failures.length).toBeGreaterThan(0); // still computed for visibility
  });
});
