import { SITE } from "@/lib/site";

/**
 * Search-engine ping hook — notify Google, Bing, and IndexNow that content
 * changed so they re-crawl the sitemap / specific URLs.
 *
 * Named `sitemap-ping-hook.ts` to avoid colliding with the crawl cluster's
 * `sitemap-ping.ts`. This module is the publish-time HOOK: a typed,
 * fail-soft orchestrator that builds the endpoints and fires them. It is
 * network-touching by nature, so it is loosely coupled — `fetchImpl` is
 * injectable for tests, and every failure is swallowed into a result record
 * (a ping failure must never block a publish).
 */

export type PingTarget = "google" | "bing" | "indexnow";

export type PingResult = {
  target: PingTarget;
  url: string;
  ok: boolean;
  status?: number;
  error?: string;
};

export type PingOptions = {
  /** Absolute sitemap URL to advertise. Defaults to `${SITE.url}/sitemap.xml`. */
  sitemapUrl?: string;
  /** Specific URLs that changed (used by IndexNow). */
  changedUrls?: string[];
  /** IndexNow key (from env in prod). Pings skip IndexNow when absent. */
  indexNowKey?: string;
  /** Injected fetch for tests / non-browser runtimes. */
  fetchImpl?: typeof fetch;
  /** Subset of targets to ping. Defaults to all available. */
  targets?: PingTarget[];
};

/** Build the GET ping URL for the classic sitemap-submission endpoints. */
export function buildSitemapPingUrls(sitemapUrl: string): { target: PingTarget; url: string }[] {
  const enc = encodeURIComponent(sitemapUrl);
  return [
    { target: "google", url: `https://www.google.com/ping?sitemap=${enc}` },
    { target: "bing", url: `https://www.bing.com/ping?sitemap=${enc}` },
  ];
}

/** Build the IndexNow submission payload (host + key + URL list). */
export function buildIndexNowPayload(host: string, key: string, urls: string[]) {
  return {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: urls,
  };
}

/**
 * Fire all configured pings. Never throws — returns a result row per target.
 * Safe to call from a publish webhook / revalidation handler.
 */
export async function pingSearchEngines(
  opts: PingOptions = {},
): Promise<PingResult[]> {
  const sitemapUrl = opts.sitemapUrl ?? `${SITE.url}/sitemap.xml`;
  const doFetch = opts.fetchImpl ?? (typeof fetch !== "undefined" ? fetch : undefined);
  const results: PingResult[] = [];

  if (!doFetch) {
    return [
      { target: "google", url: sitemapUrl, ok: false, error: "no fetch available" },
    ];
  }

  const wantedTargets = new Set<PingTarget>(
    opts.targets ?? ["google", "bing", "indexnow"],
  );

  // Classic sitemap pings (Google + Bing).
  for (const { target, url } of buildSitemapPingUrls(sitemapUrl)) {
    if (!wantedTargets.has(target)) continue;
    try {
      const res = await doFetch(url, { method: "GET" });
      results.push({ target, url, ok: res.ok, status: res.status });
    } catch (err) {
      results.push({
        target,
        url,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // IndexNow (single request notifies Bing, Yandex, Seznam, …).
  if (wantedTargets.has("indexnow") && opts.indexNowKey) {
    let host = "localhost";
    try {
      host = new URL(SITE.url).host;
    } catch {
      /* keep fallback host */
    }
    const urlList =
      opts.changedUrls && opts.changedUrls.length > 0
        ? opts.changedUrls
        : [sitemapUrl];
    const endpoint = "https://api.indexnow.org/indexnow";
    try {
      const res = await doFetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify(buildIndexNowPayload(host, opts.indexNowKey, urlList)),
      });
      results.push({ target: "indexnow", url: endpoint, ok: res.ok, status: res.status });
    } catch (err) {
      results.push({
        target: "indexnow",
        url: endpoint,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
