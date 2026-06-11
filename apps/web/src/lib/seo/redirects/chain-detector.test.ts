import { describe, expect, it } from "vitest";
import { buildRegistry, type RedirectRule } from "./registry";
import { detectChains } from "./chain-detector";

function rule(from: string, to: string | null, status: RedirectRule["status"] = 301): RedirectRule {
  return { from, to, status, createdAt: "2026-01-01", reason: "test" };
}

describe("detectChains", () => {
  it("passes for single-hop redirects to terminal pages", () => {
    const reg = buildRegistry([rule("/a", "/page"), rule("/b", "/other")]);
    const report = detectChains(reg);
    expect(report.ok).toBe(true);
    expect(report.issues).toHaveLength(0);
  });

  it("passes for 410 (terminal, no destination)", () => {
    const reg = buildRegistry([rule("/gone", null, 410)]);
    expect(detectChains(reg).ok).toBe(true);
  });

  it("flags a 2-hop chain A -> B -> C", () => {
    const reg = buildRegistry([rule("/a", "/b"), rule("/b", "/c")]);
    const report = detectChains(reg);
    expect(report.ok).toBe(false);
    const chain = report.issues.find((i) => i.kind === "chain");
    expect(chain).toBeDefined();
    expect(chain?.path[0]).toBe("/a");
    expect(chain?.hops).toBeGreaterThanOrEqual(2);
  });

  it("flags a cycle A -> B -> A", () => {
    const reg = buildRegistry([rule("/a", "/b"), rule("/b", "/a")]);
    const report = detectChains(reg);
    expect(report.ok).toBe(false);
    expect(report.issues.some((i) => i.kind === "cycle")).toBe(true);
  });

  it("de-duplicates a cycle seen from multiple entry points", () => {
    const reg = buildRegistry([rule("/a", "/b"), rule("/b", "/a")]);
    const report = detectChains(reg);
    expect(report.issues.filter((i) => i.kind === "cycle")).toHaveLength(1);
  });

  it("preserves locale prefixes when chaining across locales", () => {
    const reg = buildRegistry([rule("/uk/a", "/uk/b"), rule("/uk/b", "/uk/c")]);
    const report = detectChains(reg);
    expect(report.ok).toBe(false);
    expect(report.issues[0].path[0]).toBe("/uk/a");
  });
});
