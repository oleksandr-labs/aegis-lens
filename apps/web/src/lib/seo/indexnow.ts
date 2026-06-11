/**
 * IndexNow submissions (Bing + Yandex).
 *
 * TODO/seo/TODO_crawl_indexing.md:
 *  - IndexNow submissions (Bing + Yandex)
 *
 * IndexNow lets us push changed URLs directly to participating engines (Bing,
 * Yandex, Seznam, Naver — a single submission fans out). Requires a key hosted at
 * `https://<host>/<key>.txt`. This module: builds the key file path, validates the
 * key, and submits batches. Network call is injected for testability / SSR.
 *
 * Secret: the key comes from `process.env.INDEXNOW_KEY` — never hardcode it.
 */

export type IndexNowFetch = (
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string },
) => Promise<{ ok: boolean; status: number }>;

/** IndexNow endpoints (any one fans out to all participating engines). */
export const INDEXNOW_ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
] as const;

/** IndexNow keys must be 8–128 hex-ish chars (a–z, A–Z, 0–9, -). */
export function isValidIndexNowKey(key: string): boolean {
  return /^[A-Za-z0-9-]{8,128}$/.test(key);
}

/** The path at which the verification key file must be served. */
export function keyFilePath(key: string): string {
  return `/${key}.txt`;
}

/** Body of the key verification file (just the key itself). */
export function keyFileContents(key: string): string {
  return key;
}

export type IndexNowPayload = {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
};

/**
 * Build the IndexNow JSON payload. `host` is the bare hostname (no scheme),
 * URLs must be absolute and on that host.
 */
export function buildIndexNowPayload(args: {
  siteUrl: string;
  key: string;
  urls: string[];
}): IndexNowPayload {
  const host = new URL(args.siteUrl).host;
  return {
    host,
    key: args.key,
    keyLocation: `${args.siteUrl.replace(/\/$/, "")}${keyFilePath(args.key)}`,
    urlList: args.urls,
  };
}

export type IndexNowResult = {
  endpoint: string;
  ok: boolean;
  status: number;
  submitted: number;
  error?: string;
};

/** IndexNow caps a single submission at 10,000 URLs. */
export const INDEXNOW_MAX_URLS = 10_000;

/**
 * Submit a batch of changed URLs to IndexNow. Reads the key from
 * `process.env.INDEXNOW_KEY` unless explicitly passed. Returns a no-op result
 * (ok=false) when the key is missing/invalid rather than throwing, so a publish
 * flow degrades gracefully.
 */
export async function submitIndexNow(
  args: { siteUrl: string; urls: string[]; key?: string; endpoint?: string },
  fetchImpl: IndexNowFetch,
): Promise<IndexNowResult> {
  const endpoint = args.endpoint ?? INDEXNOW_ENDPOINTS[0];
  const key = args.key ?? process.env.INDEXNOW_KEY ?? "";

  if (!isValidIndexNowKey(key)) {
    return { endpoint, ok: false, status: 0, submitted: 0, error: "missing or invalid INDEXNOW_KEY" };
  }
  const urls = args.urls.slice(0, INDEXNOW_MAX_URLS);
  if (urls.length === 0) {
    return { endpoint, ok: true, status: 200, submitted: 0 };
  }
  const payload = buildIndexNowPayload({ siteUrl: args.siteUrl, key, urls });
  try {
    const res = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return { endpoint, ok: res.ok, status: res.status, submitted: urls.length };
  } catch (err) {
    return {
      endpoint,
      ok: false,
      status: 0,
      submitted: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
