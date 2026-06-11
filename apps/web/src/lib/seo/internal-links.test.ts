import { describe, it, expect } from "vitest";
import {
  buildLinkGraph,
  findOrphans,
  bfsDepth,
  topHubs,
  parentPath,
  type GraphRoute,
} from "./link-graph-from-sitemap";
import {
  linkifyParagraph,
  linkifyBody,
  tokensToHtml,
  type GazetteerEntry,
} from "./auto-link-entities";
import { rankRelatedEvents, similarity, type RelatableEvent } from "./related-events";
import { rankRelatedPosts, type RelatablePost } from "./related-posts";

// ── link-graph-from-sitemap ──────────────────────────────────────────────────

const routes: GraphRoute[] = [
  { pathFor: () => "/" },
  { pathFor: () => "/blog" },
  { pathFor: () => "/blog/post-a" },
  { pathFor: () => "/blog/post-b" },
  { pathFor: () => "/orphan-section/deep/page" }, // parent chain not declared
];

describe("link-graph-from-sitemap", () => {
  it("derives parent path", () => {
    expect(parentPath("/blog/post-a")).toBe("/blog");
    expect(parentPath("/blog")).toBe("/");
    expect(parentPath("/")).toBe("/");
  });

  it("builds nodes + structural edges", () => {
    const g = buildLinkGraph(routes);
    expect(g.nodes.has("/blog")).toBe(true);
    // child links to parent and back
    expect(g.edges.get("/blog/post-a")?.has("/blog")).toBe(true);
    expect(g.edges.get("/blog")?.has("/blog/post-a")).toBe(true);
  });

  it("computes click-depth from root via BFS", () => {
    const g = buildLinkGraph(routes);
    const d = bfsDepth(g, "/");
    expect(d.get("/")).toBe(0);
    expect(d.get("/blog")).toBe(1);
    expect(d.get("/blog/post-a")).toBe(2);
  });

  it("flags orphan beyond 3 clicks / no inbound", () => {
    const g = buildLinkGraph(routes);
    const orphans = findOrphans(g, 3).map((n) => n.path);
    // deep page's parent segments aren't real nodes → unreachable from /
    expect(orphans).toContain("/orphan-section/deep/page");
    expect(orphans).not.toContain("/blog/post-a");
  });

  it("ranks hubs by inbound × priority", () => {
    const g = buildLinkGraph(routes);
    const hubs = topHubs(g, 1);
    expect(hubs[0].path).toBe("/blog"); // two children point to it
  });
});

// ── auto-link-entities ───────────────────────────────────────────────────────

const gaz: GazetteerEntry[] = [
  {
    id: "shahed-136",
    surfaces: { en: ["Shahed-136", "Geran-2"], uk: ["Шахед-136", "Герань-2"] },
    hrefFor: (lc) => (lc === "en" ? "/entities/shahed-136" : `/${lc}/entities/shahed-136`),
    kind: "equipment",
  },
  {
    id: "kharkiv",
    surfaces: { en: ["Kharkiv"], uk: ["Харків"] },
    hrefFor: (lc) => (lc === "en" ? "/regions/ua/kharkiv" : `/${lc}/regions/ua/kharkiv`),
    kind: "region",
  },
];

describe("auto-link-entities", () => {
  it("links known entities with locale-correct hrefs (en)", () => {
    const tokens = linkifyParagraph("A Shahed-136 was downed over Kharkiv.", gaz, "en");
    const links = tokens.filter((t) => t.type === "link");
    expect(links).toHaveLength(2);
    expect(tokensToHtml(tokens)).toContain('href="/entities/shahed-136"');
    expect(tokensToHtml(tokens)).toContain('href="/regions/ua/kharkiv"');
  });

  it("uses translated uk surfaces + uk URLs (not transliterated)", () => {
    const tokens = linkifyParagraph("Над містом Харків збили Шахед-136.", gaz, "uk");
    const html = tokensToHtml(tokens);
    expect(html).toContain('href="/uk/regions/ua/kharkiv"');
    expect(html).toContain(">Харків<");
  });

  it("respects max links per paragraph", () => {
    const para = "Kharkiv Kharkiv Kharkiv"; // same id only linked once anyway
    const tokens = linkifyParagraph(para, gaz, "en", { maxLinksPerParagraph: 1 });
    expect(tokens.filter((t) => t.type === "link")).toHaveLength(1);
  });

  it("links each distinct target at most once per paragraph", () => {
    const tokens = linkifyParagraph("Kharkiv and Kharkiv again.", gaz, "en");
    expect(tokens.filter((t) => t.type === "link")).toHaveLength(1);
  });

  it("honors whole-word boundaries", () => {
    const tokens = linkifyParagraph("Kharkivites live here.", gaz, "en");
    expect(tokens.filter((t) => t.type === "link")).toHaveLength(0);
  });

  it("excludes the page's own subject", () => {
    const tokens = linkifyParagraph("Kharkiv news.", gaz, "en", {
      excludeIds: new Set(["kharkiv"]),
    });
    expect(tokens.filter((t) => t.type === "link")).toHaveLength(0);
  });

  it("splits body into paragraph token streams", () => {
    const body = "Kharkiv strike.\n\nA Shahed-136 fell.";
    const paras = linkifyBody(body, gaz, "en");
    expect(paras).toHaveLength(2);
  });
});

// ── related-events ───────────────────────────────────────────────────────────

const baseEvent: RelatableEvent = {
  eventId: "A",
  class: "military_action",
  subclass: "drone",
  occurredAt: "2026-05-01T00:00:00Z",
  location: { lat: 50, lon: 36 },
  dangerScore: 60,
  tags: ["drones"],
};

describe("related-events", () => {
  it("ranks same-class, same-time, same-place highest", () => {
    const pool: RelatableEvent[] = [
      { ...baseEvent, eventId: "near", occurredAt: "2026-05-01T06:00:00Z" },
      {
        ...baseEvent,
        eventId: "far",
        class: "cyber",
        subclass: "ddos",
        tags: ["cyber"],
        occurredAt: "2026-01-01T00:00:00Z",
        location: { lat: 0, lon: 0 },
      },
    ];
    const ranked = rankRelatedEvents(baseEvent, pool, 6);
    expect(ranked[0].item.eventId).toBe("near");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it("excludes the target itself", () => {
    const ranked = rankRelatedEvents(baseEvent, [baseEvent], 6);
    expect(ranked).toHaveLength(0);
  });

  it("similarity is symmetric and in [0,1]", () => {
    const other = { ...baseEvent, eventId: "B", occurredAt: "2026-05-02T00:00:00Z" };
    const s1 = similarity(baseEvent, other);
    const s2 = similarity(other, baseEvent);
    expect(s1).toBeCloseTo(s2, 10);
    expect(s1).toBeGreaterThanOrEqual(0);
    expect(s1).toBeLessThanOrEqual(1);
  });
});

// ── related-posts ────────────────────────────────────────────────────────────

const posts: RelatablePost[] = [
  { slug: "a", title: "Air Defense Deep Dive", category: "Analysis", tags: ["air-defense", "drones"], publishedAt: "2026-05-01" },
  { slug: "b", title: "Drone Saturation Patterns", category: "Analysis", tags: ["drones"], publishedAt: "2026-04-01" },
  { slug: "c", title: "Cyber Operations Report", category: "Brief", tags: ["cyber"], publishedAt: "2026-03-01" },
];

describe("related-posts", () => {
  it("ranks tag-overlapping posts above unrelated", () => {
    const ranked = rankRelatedPosts(posts[0], posts, 2);
    expect(ranked[0].item.slug).toBe("b");
  });

  it("excludes self", () => {
    const ranked = rankRelatedPosts(posts[0], posts, 3);
    expect(ranked.every((r) => r.item.slug !== "a")).toBe(true);
  });

  it("backfills to fill the limit when overlap is thin", () => {
    const isolated: RelatablePost = {
      slug: "x", title: "Unrelated Musings", category: "Analysis", tags: [], publishedAt: "2026-06-01",
    };
    const ranked = rankRelatedPosts(isolated, [isolated, ...posts], 2);
    expect(ranked.length).toBe(2);
  });
});
