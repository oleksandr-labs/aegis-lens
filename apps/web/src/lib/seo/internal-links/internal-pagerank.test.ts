import { describe, it, expect } from "vitest";
import { buildLinkGraph, type LinkEdge, type PageNode } from "./link-graph";
import { internalPageRank, topByPageRank } from "./internal-pagerank";
import { buildHubSpokeEdges, checkHubSpoke } from "./hub-spoke";
import { detectOrphans } from "./orphans";
import { auditClusters } from "./cluster-audit";
import { relatedByEmbedding } from "./related-embeddings";
import { buildEntityGraph, neighbours } from "./kg-traversal";
import { applyOverrides, buildOverrideTable } from "./overrides";

function node(url: string, p: Partial<PageNode> = {}): PageNode {
  return {
    url,
    locale: p.locale ?? "en",
    template: p.template ?? "other",
    cluster: p.cluster ?? "c",
    isHub: p.isHub,
    title: p.title,
  };
}

describe("link-graph", () => {
  it("drops cross-locale and missing-endpoint edges", () => {
    const nodes = [node("/a", { locale: "en" }), node("/uk/b", { locale: "uk" }), node("/c")];
    const edges: LinkEdge[] = [
      { from: "/a", to: "/uk/b", anchor: "x", relation: "related" }, // cross-locale → drop
      { from: "/a", to: "/missing", anchor: "x", relation: "related" }, // missing → drop
      { from: "/a", to: "/c", anchor: "ok", relation: "related" }, // keep
    ];
    const g = buildLinkGraph(nodes, edges);
    expect(g.out.get("/a")?.length).toBe(1);
    expect(g.out.get("/a")?.[0].to).toBe("/c");
  });
});

describe("internalPageRank (power method)", () => {
  it("ranks sum to ~1 and converge", () => {
    const nodes = [node("/", { template: "home" }), node("/a"), node("/b"), node("/c")];
    const edges: LinkEdge[] = [
      { from: "/", to: "/a", anchor: "a", relation: "hub-to-spoke" },
      { from: "/", to: "/b", anchor: "b", relation: "hub-to-spoke" },
      { from: "/a", to: "/c", anchor: "c", relation: "related" },
      { from: "/b", to: "/c", anchor: "c", relation: "related" },
      { from: "/c", to: "/", anchor: "home", relation: "spoke-to-hub" },
    ];
    const g = buildLinkGraph(nodes, edges);
    const res = internalPageRank(g, "en");
    const total = [...res.ranks.values()].reduce((s, x) => s + x, 0);
    expect(res.converged).toBe(true);
    expect(total).toBeGreaterThan(0.99);
    expect(total).toBeLessThan(1.01);
    // /c receives links from two pages → should outrank /a and /b.
    expect(res.ranks.get("/c")!).toBeGreaterThan(res.ranks.get("/a")!);
  });

  it("handles dangling nodes without losing mass", () => {
    const nodes = [node("/"), node("/dead")];
    const edges: LinkEdge[] = [{ from: "/", to: "/dead", anchor: "d", relation: "related" }];
    const g = buildLinkGraph(nodes, edges);
    const res = internalPageRank(g, "en");
    const total = [...res.ranks.values()].reduce((s, x) => s + x, 0);
    expect(total).toBeGreaterThan(0.99);
    expect(total).toBeLessThan(1.01);
  });

  it("isolates locales (no cross-locale rank flow)", () => {
    const nodes = [node("/a", { locale: "en" }), node("/uk/x", { locale: "uk" })];
    const g = buildLinkGraph(nodes, []);
    expect(internalPageRank(g, "en").ranks.size).toBe(1);
    expect(internalPageRank(g, "uk").ranks.size).toBe(1);
    expect(topByPageRank(internalPageRank(g, "en")).length).toBe(1);
  });
});

describe("hub-spoke crawl shape", () => {
  it("links hub→spokes, spoke→hub, and minSiblings siblings", () => {
    const spokes = ["/s1", "/s2", "/s3", "/s4"];
    const edges = buildHubSpokeEdges({
      hubUrl: "/hub",
      spokeUrls: spokes,
      siblingCount: 2,
      anchorFor: (_f, t) => `to ${t}`,
    });
    const health = checkHubSpoke(edges, "/hub", spokes, 2);
    expect(health.healthy).toBe(true);
    expect(health.unlinkedSpokes).toEqual([]);
    expect(health.spokesMissingHubLink).toEqual([]);
  });
});

describe("orphans", () => {
  it("flags too-deep and no-incoming pages", () => {
    const nodes = [
      node("/", { template: "home" }),
      node("/a"),
      node("/b"),
      node("/c"),
      node("/d"),
      node("/orphan"),
    ];
    const edges: LinkEdge[] = [
      { from: "/", to: "/a", anchor: "a", relation: "hub-to-spoke" },
      { from: "/a", to: "/b", anchor: "b", relation: "related" },
      { from: "/b", to: "/c", anchor: "c", relation: "related" },
      { from: "/c", to: "/d", anchor: "d", relation: "related" }, // depth 4 → too deep
    ];
    const g = buildLinkGraph(nodes, edges);
    const rep = detectOrphans(g, "en", { maxClicks: 3 });
    expect(rep.tooDeep).toContain("/d");
    expect(rep.unreachable).toContain("/orphan");
    expect(rep.noIncoming).toContain("/orphan");
    expect(rep.healthy).toBe(false);
  });
});

describe("cluster audit", () => {
  it("passes a well-formed hub-spoke cluster", () => {
    const hub = node("/hub", { cluster: "k", isHub: true });
    const spokes = ["/s1", "/s2", "/s3", "/s4"].map((u) => node(u, { cluster: "k" }));
    const edges = buildHubSpokeEdges({
      hubUrl: "/hub",
      spokeUrls: spokes.map((s) => s.url),
      siblingCount: 3,
      anchorFor: (_f, t) => t,
    });
    const g = buildLinkGraph([hub, ...spokes], edges);
    const audits = auditClusters(g, 3);
    expect(audits).toHaveLength(1);
    expect(audits[0].healthy).toBe(true);
  });
});

describe("related embeddings", () => {
  it("ranks topically-similar docs higher", () => {
    const target = { url: "/drone", text: "shahed drone strike kharkiv air defence" };
    const candidates = [
      { url: "/drone2", text: "shahed drone attack air defence kyiv" },
      { url: "/finance", text: "currency exchange rate banking salary" },
    ];
    const ranked = relatedByEmbedding(target, candidates, { limit: 5 });
    expect(ranked[0].url).toBe("/drone2");
  });
});

describe("kg traversal", () => {
  it("finds direct neighbours before tag-only ones", () => {
    const g = buildEntityGraph([
      { slug: "a", relatedSlugs: ["b"], tags: ["x"] },
      { slug: "b", relatedSlugs: ["a"], tags: ["x"] },
      { slug: "c", relatedSlugs: [], tags: ["x"] }, // shares tag only
    ]);
    const ns = neighbours(g, "a", { maxHops: 2 });
    expect(ns[0].slug).toBe("b");
    expect(ns.find((n) => n.slug === "c")).toBeTruthy();
  });
});

describe("editorial overrides", () => {
  it("suppresses and boost-injects", () => {
    const table = buildOverrideTable([
      { from: "/p", to: "/bad", kind: "suppress" },
      { from: "/p", to: "/forced", kind: "boost", amount: 5 },
    ]);
    const out = applyOverrides(
      "/p",
      [
        { url: "/bad", score: 0.9 },
        { url: "/ok", score: 0.5 },
      ],
      table,
    );
    const urls = out.map((r) => r.url);
    expect(urls).not.toContain("/bad");
    expect(urls).toContain("/forced");
    expect(out[0].url).toBe("/forced"); // boosted to top
  });
});
