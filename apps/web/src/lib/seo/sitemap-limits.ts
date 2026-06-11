/**
 * Sitemap protocol limit enforcement.
 *
 * The sitemaps.org protocol (and Google/Bing) cap a single sitemap file at
 * 50,000 URLs and 50 MB uncompressed. This module provides the constants plus
 * pure helpers to (a) check a rendered XML string against the limits and
 * (b) chunk a flat list of routes into limit-safe pages so a segment can be
 * emitted as `seg-1.xml`, `seg-2.xml`, ... under a sitemap index.
 *
 * Kept dependency-free so it is callable from both route handlers and the CI
 * parsability test.
 */

export const MAX_URLS_PER_SITEMAP = 50_000;
export const MAX_BYTES_PER_SITEMAP = 50 * 1024 * 1024; // 50 MB

export type LimitCheck = {
  ok: boolean;
  urlCount: number;
  byteSize: number;
  /** Human-readable reasons a sitemap exceeds a limit (empty when ok). */
  violations: string[];
};

/** Byte length of a UTF-8 string without pulling in Buffer (edge-safe). */
export function utf8ByteLength(s: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(s).length;
  }
  // Fallback manual count (BMP + surrogate pairs).
  let bytes = 0;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff) {
      bytes += 4;
      i++; // skip low surrogate
    } else bytes += 3;
  }
  return bytes;
}

/** Count `<url>` (urlset) or `<sitemap>` (index) entries in rendered XML. */
export function countSitemapUrls(xml: string): number {
  const urlMatches = xml.match(/<url(?:\s|>)/g);
  if (urlMatches && urlMatches.length > 0) return urlMatches.length;
  const sitemapMatches = xml.match(/<sitemap(?:\s|>)/g);
  return sitemapMatches ? sitemapMatches.length : 0;
}

/** Validate a rendered sitemap XML string against the protocol limits. */
export function checkSitemapLimits(xml: string): LimitCheck {
  const urlCount = countSitemapUrls(xml);
  const byteSize = utf8ByteLength(xml);
  const violations: string[] = [];
  if (urlCount > MAX_URLS_PER_SITEMAP) {
    violations.push(
      `URL count ${urlCount} exceeds ${MAX_URLS_PER_SITEMAP} per sitemap`,
    );
  }
  if (byteSize > MAX_BYTES_PER_SITEMAP) {
    violations.push(
      `Size ${byteSize} bytes exceeds ${MAX_BYTES_PER_SITEMAP} per sitemap`,
    );
  }
  return { ok: violations.length === 0, urlCount, byteSize, violations };
}

/**
 * Split a flat array into limit-safe pages by URL count. Byte-size paging is
 * handled conservatively: at our per-URL XML weight (~700B with hreflang),
 * 50k URLs is ~35 MB, comfortably under 50 MB, so a URL-count cap is the
 * binding constraint. The optional `maxUrls` lets callers tighten it.
 */
export function paginateRoutes<T>(
  routes: T[],
  maxUrls: number = MAX_URLS_PER_SITEMAP,
): T[][] {
  if (maxUrls < 1) throw new RangeError("maxUrls must be >= 1");
  if (routes.length === 0) return [[]];
  const pages: T[][] = [];
  for (let i = 0; i < routes.length; i += maxUrls) {
    pages.push(routes.slice(i, i + maxUrls));
  }
  return pages;
}

/** How many pages a segment of `count` URLs will need. */
export function pageCount(count: number, maxUrls = MAX_URLS_PER_SITEMAP): number {
  return Math.max(1, Math.ceil(count / maxUrls));
}
