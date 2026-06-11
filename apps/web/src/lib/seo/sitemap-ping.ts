/**
 * Auto-ping sitemaps on publish.
 *
 * TODO/seo/TODO_crawl_indexing.md:
 *  - Auto-ping sitemaps on publish
 *
 * On content publish we notify search engines so they re-crawl promptly. This is
 * the ping client: it builds the correct ping endpoints and submits them.
 *
 * NOTE: Google deprecated its sitemap ping endpoint (Jan 2024) and Bing followed;
 * the durable modern path is IndexNow (see indexnow.ts). We keep a Google/Bing
 * sitemap-ping shim (still harmless, useful for engines that honour it) AND
 * delegate URL-level freshness to IndexNow. `submitIndexNow` is the recommended
 * call on publish; sitemap pings are best-effort.
 *
 * Network call is injected (`fetchImpl`) so this stays unit-testable / SSR-safe.
 */

export type FetchLike = (url: string, init?: { method?: string }) => Promise<{ ok: boolean; status: number }>;

export type PingTarget = {
  engine: "google" | "bing";
  url: string;
};

/** Build legacy sitemap-ping URLs for a given sitemap location. */
export function buildSitemapPings(sitemapUrl: string): PingTarget[] {
  const enc = encodeURIComponent(sitemapUrl);
  return [
    { engine: "google", url: `https://www.google.com/ping?sitemap=${enc}` },
    { engine: "bing", url: `https://www.bing.com/ping?sitemap=${enc}` },
  ];
}

export type PingResult = {
  engine: string;
  url: string;
  ok: boolean;
  status: number;
  error?: string;
};

/**
 * Ping search engines that a sitemap changed. Best-effort: failures are captured,
 * never thrown, so a publish flow is never blocked by an SEO ping.
 */
export async function pingSitemaps(
  sitemapUrl: string,
  fetchImpl: FetchLike,
): Promise<PingResult[]> {
  const targets = buildSitemapPings(sitemapUrl);
  const results: PingResult[] = [];
  for (const t of targets) {
    try {
      const res = await fetchImpl(t.url, { method: "GET" });
      results.push({ engine: t.engine, url: t.url, ok: res.ok, status: res.status });
    } catch (err) {
      results.push({
        engine: t.engine,
        url: t.url,
        ok: false,
        status: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return results;
}

/**
 * Recommended publish hook: ping sitemaps (legacy, best-effort) AND return the
 * URLs that should additionally be submitted via IndexNow (the modern path).
 * The caller wires IndexNow submission via indexnow.ts.
 */
export type PublishNotification = {
  sitemapPings: PingResult[];
  /** Changed/new URLs the caller should push to IndexNow. */
  indexNowUrls: string[];
};

export async function onPublish(
  args: { sitemapUrl: string; changedUrls: string[] },
  fetchImpl: FetchLike,
): Promise<PublishNotification> {
  const sitemapPings = await pingSitemaps(args.sitemapUrl, fetchImpl);
  return { sitemapPings, indexNowUrls: args.changedUrls };
}
