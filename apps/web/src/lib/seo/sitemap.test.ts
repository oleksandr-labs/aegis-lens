import { describe, it, expect } from "vitest";
import type { AegisEvent } from "@aegis/types";
import {
  checkSitemapLimits,
  countSitemapUrls,
  paginateRoutes,
  utf8ByteLength,
  MAX_URLS_PER_SITEMAP,
} from "./sitemap-limits";
import {
  buildSitemapIndexXml,
  buildIndexEntries,
  expandSegment,
  renderSitemapIndex,
} from "./sitemap-index";
import { SITEMAP_SEGMENTS, getSegment } from "./sitemap-segments";
import { buildNewsSitemapXml, filterRecent, MAX_NEWS_URLS } from "./news-sitemap-xml";
import { buildImageSitemapXml, eventImageEntries } from "./image-sitemap";
import { renderVideoSitemapXml, videoSeedToEntries } from "./video-sitemap";
import { buildSitemapPingUrls, pingSearchEngines } from "./sitemap-ping-hook";
import { buildArchiveSummary, extractiveSummary, rankSalient } from "./archive-summary";

/**
 * CI test: sitemap parsability + builder invariants. Pure (no network).
 * The injected fetch in the ping test ensures no real request is made.
 */

function fakeEvent(over: Partial<AegisEvent> = {}): AegisEvent {
  return {
    eventId: "01ABCDEF",
    occurredAt: "2026-06-05T10:00:00.000Z",
    reportedAt: "2026-06-05T10:05:00.000Z",
    ingestedAt: "2026-06-05T10:06:00.000Z",
    location: { lat: 50, lon: 36 } as AegisEvent["location"],
    class: "military_action",
    subclass: "strike",
    severity: 4,
    dangerScore: 80,
    confidence: 0.9,
    verificationState: "verified",
    sources: [],
    media: [],
    summary: { en: "Test event <b> & 'quotes'", uk: "Тестова подія" },
    originalText: null,
    ...over,
  };
}

/** Minimal well-formedness check: balanced root tag + xml prolog. */
function isWellFormed(xml: string, root: string): boolean {
  if (!xml.startsWith("<?xml")) return false;
  const open = (xml.match(new RegExp(`<${root}[\\s>]`, "g")) ?? []).length;
  const close = (xml.match(new RegExp(`</${root}>`, "g")) ?? []).length;
  return open === 1 && close === 1;
}

describe("sitemap-limits", () => {
  it("counts UTF-8 bytes including multibyte", () => {
    expect(utf8ByteLength("abc")).toBe(3);
    expect(utf8ByteLength("Київ")).toBe(8); // 4 Cyrillic × 2 bytes
  });

  it("counts url entries in a urlset", () => {
    const xml = "<urlset><url></url><url></url></urlset>";
    expect(countSitemapUrls(xml)).toBe(2);
  });

  it("passes a small sitemap and flags an oversized one", () => {
    const ok = checkSitemapLimits("<urlset><url></url></urlset>");
    expect(ok.ok).toBe(true);
    expect(ok.urlCount).toBe(1);

    const huge = `<urlset>${"<url></url>".repeat(MAX_URLS_PER_SITEMAP + 1)}</urlset>`;
    const bad = checkSitemapLimits(huge);
    expect(bad.ok).toBe(false);
    expect(bad.violations.length).toBeGreaterThan(0);
  });

  it("paginates routes by URL cap", () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    const pages = paginateRoutes(items, 10);
    expect(pages).toHaveLength(3);
    expect(pages[0]).toHaveLength(10);
    expect(pages[2]).toHaveLength(5);
  });
});

describe("sitemap-index", () => {
  it("has a child entry per live segment when no paging needed", () => {
    const entries = buildIndexEntries();
    expect(entries.length).toBe(SITEMAP_SEGMENTS.length);
  });

  it("pages an oversized segment into numbered children", () => {
    const seg = getSegment("events")!;
    const paths = expandSegment(seg, MAX_URLS_PER_SITEMAP * 2 + 1);
    expect(paths[0]).toBe("/sitemap-events.xml");
    expect(paths).toContain("/sitemap-events-2.xml");
    expect(paths.length).toBe(3);
  });

  it("renders well-formed sitemapindex XML", () => {
    const xml = buildSitemapIndexXml();
    expect(isWellFormed(xml, "sitemapindex")).toBe(true);
    expect(xml).toContain("<loc>");
    expect(countSitemapUrls(xml)).toBe(SITEMAP_SEGMENTS.length);
  });

  it("escapes nothing unexpected and round-trips entries", () => {
    const xml = renderSitemapIndex([
      { path: "/sitemap.xml", lastmod: "2026-06-06T00:00:00.000Z" },
    ]);
    expect(xml).toContain("/sitemap.xml");
  });
});

describe("news-sitemap-xml", () => {
  it("keeps only events within the 48h window", () => {
    const now = Date.parse("2026-06-06T00:00:00.000Z");
    const recent = fakeEvent({ occurredAt: "2026-06-05T12:00:00.000Z" });
    const stale = fakeEvent({ occurredAt: "2026-06-01T12:00:00.000Z" });
    const out = filterRecent([recent, stale], now);
    expect(out).toHaveLength(1);
    expect(out[0].occurredAt).toBe(recent.occurredAt);
  });

  it("renders well-formed news XML and escapes the title", () => {
    const xml = buildNewsSitemapXml([fakeEvent()], {
      now: Date.parse("2026-06-05T11:00:00.000Z"),
    });
    expect(isWellFormed(xml, "urlset")).toBe(true);
    expect(xml).toContain("<news:news>");
    expect(xml).toContain("&lt;b&gt;");
    expect(xml).not.toContain("<b>");
  });

  it("caps at the Google News max", () => {
    expect(MAX_NEWS_URLS).toBe(1000);
  });
});

describe("image-sitemap", () => {
  it("emits only events that carry non-retracted imagery", () => {
    const withImg = fakeEvent({
      eventId: "IMG1",
      media: [
        { id: "m1", type: "image", url: "https://cdn/x.jpg", thumbnailUrl: null, verificationState: "verified" },
        { id: "m2", type: "video", url: "https://cdn/v.mp4", thumbnailUrl: null, verificationState: "verified" },
      ],
    });
    const noImg = fakeEvent({ eventId: "NOIMG", media: [] });
    const entries = eventImageEntries([withImg, noImg]);
    expect(entries).toHaveLength(1);
    expect(entries[0].images).toHaveLength(1);
  });

  it("renders well-formed image XML", () => {
    const xml = buildImageSitemapXml([
      fakeEvent({
        media: [
          { id: "m1", type: "image", url: "https://cdn/x.jpg", thumbnailUrl: null, verificationState: "verified" },
        ],
      }),
    ]);
    expect(isWellFormed(xml, "urlset")).toBe(true);
    expect(xml).toContain("<image:image>");
    expect(xml).toContain("<image:loc>");
  });
});

describe("video-sitemap", () => {
  it("maps the seed shape and renders required fields", () => {
    const entries = videoSeedToEntries([
      { slug: "v1", title: "Title", summary: "Desc", durationSeconds: 120, publishedAt: "2026-01-01", tags: ["a"] },
    ]);
    const xml = renderVideoSitemapXml(entries);
    expect(isWellFormed(xml, "urlset")).toBe(true);
    expect(xml).toContain("<video:video>");
    expect(xml).toContain("<video:title>Title</video:title>");
    expect(xml).toContain("<video:duration>120</video:duration>");
  });

  it("omits out-of-range duration", () => {
    const xml = renderVideoSitemapXml([
      { pageUrl: "https://x/v", title: "t", description: "d", durationSeconds: 999999 },
    ]);
    expect(xml).not.toContain("<video:duration>");
  });
});

describe("sitemap-ping-hook", () => {
  it("builds google + bing endpoints with encoded sitemap", () => {
    const urls = buildSitemapPingUrls("https://aegislens.io/sitemap.xml");
    expect(urls.map((u) => u.target).sort()).toEqual(["bing", "google"]);
    expect(urls[0].url).toContain(encodeURIComponent("https://aegislens.io/sitemap.xml"));
  });

  it("fires with an injected fetch and never throws", async () => {
    const calls: string[] = [];
    const fakeFetch = (async (url: string) => {
      calls.push(String(url));
      return { ok: true, status: 200 } as Response;
    }) as unknown as typeof fetch;
    const results = await pingSearchEngines({
      sitemapUrl: "https://aegislens.io/sitemap.xml",
      indexNowKey: "abc123",
      changedUrls: ["https://aegislens.io/events/x"],
      fetchImpl: fakeFetch,
    });
    expect(results.every((r) => r.ok)).toBe(true);
    expect(results.map((r) => r.target).sort()).toEqual(["bing", "google", "indexnow"]);
    expect(calls.some((c) => c.includes("indexnow"))).toBe(true);
  });

  it("captures fetch errors as failed results", async () => {
    const failFetch = (async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    const results = await pingSearchEngines({ targets: ["google"], fetchImpl: failFetch });
    expect(results[0].ok).toBe(false);
    expect(results[0].error).toContain("network down");
  });
});

describe("archive-summary", () => {
  it("ranks by danger × confidence", () => {
    const a = fakeEvent({ eventId: "A", dangerScore: 90, confidence: 0.9 });
    const b = fakeEvent({ eventId: "B", dangerScore: 30, confidence: 0.5 });
    expect(rankSalient([b, a], 1)[0].eventId).toBe("A");
  });

  it("builds a grounded extractive summary with citations + caveat", () => {
    const s = extractiveSummary([fakeEvent()], "June 2026", "en");
    expect(s.grounded).toBe(true);
    expect(s.citations.length).toBeGreaterThan(0);
    expect(s.caveat.length).toBeGreaterThan(0);
    expect(s.text).toContain("1 verified");
  });

  it("falls soft to extractive when the summarizer throws", async () => {
    const s = await buildArchiveSummary({
      events: [fakeEvent()],
      periodLabel: "June 2026",
      locale: "en",
      summarizer: async () => {
        throw new Error("model unavailable");
      },
    });
    expect(s.grounded).toBe(true);
    expect(s.text).toContain("verified");
  });

  it("uses the AI text when summarizer succeeds, still attaches citations", async () => {
    const s = await buildArchiveSummary({
      events: [fakeEvent()],
      periodLabel: "June 2026",
      locale: "en",
      summarizer: async () => "A concise grounded recap.",
    });
    expect(s.grounded).toBe(false);
    expect(s.text).toBe("A concise grounded recap.");
    expect(s.citations.length).toBeGreaterThan(0);
  });

  it("handles an empty period", async () => {
    const s = await buildArchiveSummary({ events: [], periodLabel: "June 2026", locale: "uk" });
    expect(s.citations).toHaveLength(0);
    expect(s.text).toContain("не зафіксовано");
  });
});
