import { describe, expect, it } from "vitest";
import {
  identifyBot,
  parseCrawlLogLine,
  normalisePath,
  aggregateCrawlBudget,
  buildCrawlDashboard,
  flagLowValue,
  detectRegression,
  type RawCrawlLogLine,
} from "./crawl-budget";
import { decideFacet } from "./facet-crawl-policy";
import { buildPaginationLinks, isPaginatedPageIndexable } from "./pagination";
import { newsWindow, renderNewsSitemap } from "./news-sitemap";
import { isValidIndexNowKey, buildIndexNowPayload } from "./indexnow";

describe("crawl-budget", () => {
  it("identifies bots by kind", () => {
    expect(identifyBot("Mozilla Googlebot/2.1").kind).toBe("search");
    expect(identifyBot("GPTBot/1.0").kind).toBe("ai");
    expect(identifyBot("Mozilla Firefox").kind).toBe("other");
  });

  it("normalises paths", () => {
    expect(normalisePath("/uk/news/?page=2#x")).toBe("/uk/news");
    expect(normalisePath("/")).toBe("/");
    expect(normalisePath("about")).toBe("/about");
  });

  it("aggregates per-URL crawl stats and surfaces waste", () => {
    const raw: RawCrawlLogLine[] = [
      { timestamp: "2026-06-01T00:00:00Z", path: "/junk?sort=x", status: 200, userAgent: "Googlebot" },
      { timestamp: "2026-06-02T00:00:00Z", path: "/junk?sort=x", status: 200, userAgent: "Googlebot" },
      { timestamp: "2026-06-01T00:00:00Z", path: "/gold", status: 200, userAgent: "Googlebot" },
      { timestamp: "2026-06-01T00:00:00Z", path: "/dead", status: 404, userAgent: "bingbot" },
    ];
    const hits = raw.map(parseCrawlLogLine);
    const report = aggregateCrawlBudget(hits, (p) => (p === "/gold" ? 0.9 : 0.1));
    expect(report.totalHits).toBe(4);
    expect(report.searchHits).toBe(4);
    const junk = report.perUrl.find((u) => u.path === "/junk")!;
    const gold = report.perUrl.find((u) => u.path === "/gold")!;
    expect(junk.crawlDays).toBe(2);
    expect(junk.wasteScore).toBeGreaterThan(gold.wasteScore);
  });

  it("flags low-value pages with an action", () => {
    const raw: RawCrawlLogLine[] = Array.from({ length: 10 }, (_, i) => ({
      timestamp: `2026-06-0${(i % 9) + 1}T00:00:00Z`,
      path: "/p/5",
      status: 200,
      userAgent: "Googlebot",
    }));
    const report = aggregateCrawlBudget(raw.map(parseCrawlLogLine), () => 0.05);
    const flags = flagLowValue(report);
    expect(flags.length).toBeGreaterThan(0);
    expect(flags[0]!.action).toBe("block"); // /p/5 looks paginated
  });

  it("builds a dashboard shape", () => {
    const report = aggregateCrawlBudget(
      [{ timestamp: "2026-06-01T00:00:00Z", path: "/x", status: 200, userAgent: "Googlebot" }].map(parseCrawlLogLine),
    );
    const dash = buildCrawlDashboard(report);
    expect(dash.summary.totalHits).toBe(1);
    expect(dash.summary.wastedShare).toBe(0);
  });

  it("detects regressions", () => {
    const alerts = detectRegression(
      { date: "2026-06-06", searchHits: 40, distinctUrls: 100, wastedShare: 0.4 },
      { date: "2026-06-05", searchHits: 100, distinctUrls: 200, wastedShare: 0.05 },
    );
    expect(alerts.some((a) => a.metric === "searchHits" && a.severity === "critical")).toBe(true);
    expect(alerts.some((a) => a.metric === "wastedShare")).toBe(true);
  });
});

describe("facet-crawl-policy", () => {
  it("indexes base listing and single canonical facet", () => {
    expect(decideFacet({}).index).toBe(true);
    expect(decideFacet({ class: "cyber" }).index).toBe(true);
  });
  it("noindexes combinations and presentational params", () => {
    expect(decideFacet({ class: "cyber", country: "ua" }).index).toBe(false);
    expect(decideFacet({ sort: "new" }).index).toBe(false);
    expect(decideFacet({ class: ["a", "b"] }).index).toBe(false);
  });
});

describe("pagination", () => {
  it("builds rel prev/next + canonical", () => {
    const links = buildPaginationLinks({ basePath: "/uk/news", page: 2, totalPages: 3 });
    expect(links.prev).toBe("/uk/news");
    expect(links.next).toBe("/uk/news?page=3");
    expect(links.canonical).toBe("/uk/news?page=2");
  });
  it("canonical-to-first collapses deep pages", () => {
    const links = buildPaginationLinks({ basePath: "/news", page: 3, totalPages: 5, canonical: "first" });
    expect(links.canonical).toBe("/news");
    expect(isPaginatedPageIndexable(3, "first")).toBe(false);
    expect(isPaginatedPageIndexable(3, "self")).toBe(true);
  });
});

describe("news-sitemap", () => {
  const now = new Date("2026-06-06T12:00:00Z");
  it("keeps only the 48h window", () => {
    const arts = [
      { path: "/a", publishedAt: "2026-06-06T00:00:00Z", title: { en: "A" } },
      { path: "/b", publishedAt: "2026-06-01T00:00:00Z", title: { en: "B" } },
    ];
    const w = newsWindow(arts, now);
    expect(w.map((a) => a.path)).toEqual(["/a"]);
  });
  it("renders valid news xml with escaping", () => {
    const xml = renderNewsSitemap(
      [{ path: "/e/1", publishedAt: "2026-06-06T00:00:00Z", title: { en: "A & B <x>" } }],
      { siteUrl: "https://aegislens.io", now },
    );
    expect(xml).toContain("<news:news>");
    expect(xml).toContain("A &amp; B &lt;x&gt;");
    expect(xml).toContain("https://aegislens.io/e/1");
  });
});

describe("indexnow", () => {
  it("validates keys", () => {
    expect(isValidIndexNowKey("abcdef1234")).toBe(true);
    expect(isValidIndexNowKey("short")).toBe(false);
  });
  it("builds payload with key location", () => {
    const p = buildIndexNowPayload({ siteUrl: "https://aegislens.io", key: "abcdef1234", urls: ["https://aegislens.io/x"] });
    expect(p.host).toBe("aegislens.io");
    expect(p.keyLocation).toBe("https://aegislens.io/abcdef1234.txt");
  });
});
