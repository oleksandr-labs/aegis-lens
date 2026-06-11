/**
 * Rate-limit configuration registry for the Aegis Lens crawler.
 *
 * All values are conservative by design — we are a polite crawler and
 * err on the side of fewer requests rather than more.
 */

import type { DomainCrawlConfig } from "./types";

// ── Default limits ────────────────────────────────────────────────────────

/**
 * Baseline rate-limit applied to any domain not listed in
 * KNOWN_DOMAIN_CONFIGS. Deliberately conservative.
 */
export const DEFAULT_RATE_LIMIT: Pick<
  DomainCrawlConfig,
  "rateLimit" | "politenessWindowMs"
> = {
  rateLimit: {
    requestsPerMinute: 10,
    burstAllowed: 2,
  },
  politenessWindowMs: 6_000, // 6 s between requests
};

// ── Per-domain overrides ──────────────────────────────────────────────────

/**
 * Known-domain rate-limit overrides.
 *
 * Values are Partial<DomainCrawlConfig> so callers merge with the default.
 * Keys are bare hostnames (no protocol / trailing slash).
 */
export const KNOWN_DOMAIN_CONFIGS: Record<string, Partial<DomainCrawlConfig>> =
  {
    // Ukrainian government portals — be extra polite
    "gov.ua": {
      rateLimit: { requestsPerMinute: 5, burstAllowed: 1 },
      politenessWindowMs: 12_000,
      compliancePosture: "public_crawl",
    },
    "president.gov.ua": {
      rateLimit: { requestsPerMinute: 5, burstAllowed: 1 },
      politenessWindowMs: 12_000,
      compliancePosture: "public_crawl",
    },
    "mil.gov.ua": {
      rateLimit: { requestsPerMinute: 3, burstAllowed: 1 },
      politenessWindowMs: 20_000,
      compliancePosture: "public_crawl",
    },

    // Wikipedia / Wikimedia — generous API limits, still be respectful
    "wikipedia.org": {
      rateLimit: { requestsPerMinute: 20, burstAllowed: 5 },
      politenessWindowMs: 3_000,
      compliancePosture: "public_crawl",
    },
    "en.wikipedia.org": {
      rateLimit: { requestsPerMinute: 20, burstAllowed: 5 },
      politenessWindowMs: 3_000,
      compliancePosture: "public_crawl",
    },
    "uk.wikipedia.org": {
      rateLimit: { requestsPerMinute: 20, burstAllowed: 5 },
      politenessWindowMs: 3_000,
      compliancePosture: "public_crawl",
    },

    // Wikidata SPARQL endpoint
    "wikidata.org": {
      rateLimit: { requestsPerMinute: 15, burstAllowed: 3 },
      politenessWindowMs: 4_000,
      compliancePosture: "public_crawl",
    },
    "www.wikidata.org": {
      rateLimit: { requestsPerMinute: 15, burstAllowed: 3 },
      politenessWindowMs: 4_000,
      compliancePosture: "public_crawl",
    },

    // Ukrainian news outlets
    "ukrinform.ua": {
      rateLimit: { requestsPerMinute: 8, burstAllowed: 2 },
      politenessWindowMs: 8_000,
      compliancePosture: "public_crawl",
    },
    "pravda.com.ua": {
      rateLimit: { requestsPerMinute: 8, burstAllowed: 2 },
      politenessWindowMs: 8_000,
      compliancePosture: "public_crawl",
    },
    "suspilne.media": {
      rateLimit: { requestsPerMinute: 8, burstAllowed: 2 },
      politenessWindowMs: 8_000,
      compliancePosture: "public_crawl",
    },

    // International sources
    "reuters.com": {
      rateLimit: { requestsPerMinute: 6, burstAllowed: 1 },
      politenessWindowMs: 10_000,
      compliancePosture: "requires_permission",
    },
    "bbc.com": {
      rateLimit: { requestsPerMinute: 6, burstAllowed: 1 },
      politenessWindowMs: 10_000,
      compliancePosture: "requires_permission",
    },

    // OSINT / mil-tracking sites
    "oryx.com": {
      rateLimit: { requestsPerMinute: 5, burstAllowed: 1 },
      politenessWindowMs: 12_000,
      compliancePosture: "public_crawl",
    },
  };

// ── Lookup helper ─────────────────────────────────────────────────────────

/**
 * Return the effective rate-limit config for a given hostname.
 *
 * Matching order:
 *   1. Exact hostname match in KNOWN_DOMAIN_CONFIGS
 *   2. Suffix match (e.g. "gov.ua" catches "www.gov.ua")
 *   3. DEFAULT_RATE_LIMIT
 */
export function getRateLimitForDomain(
  domain: string,
): Pick<DomainCrawlConfig, "rateLimit" | "politenessWindowMs"> {
  // 1. Exact match
  if (domain in KNOWN_DOMAIN_CONFIGS) {
    const cfg = KNOWN_DOMAIN_CONFIGS[domain];
    return {
      rateLimit: cfg.rateLimit ?? DEFAULT_RATE_LIMIT.rateLimit,
      politenessWindowMs:
        cfg.politenessWindowMs ?? DEFAULT_RATE_LIMIT.politenessWindowMs,
    };
  }

  // 2. Suffix match — longest matching suffix wins
  const suffixMatches = Object.keys(KNOWN_DOMAIN_CONFIGS).filter((key) =>
    domain.endsWith(`.${key}`) || domain === key,
  );

  if (suffixMatches.length > 0) {
    // pick the most-specific (longest) suffix
    const bestKey = suffixMatches.reduce((a, b) =>
      a.length >= b.length ? a : b,
    );
    const cfg = KNOWN_DOMAIN_CONFIGS[bestKey];
    return {
      rateLimit: cfg.rateLimit ?? DEFAULT_RATE_LIMIT.rateLimit,
      politenessWindowMs:
        cfg.politenessWindowMs ?? DEFAULT_RATE_LIMIT.politenessWindowMs,
    };
  }

  // 3. Default
  return { ...DEFAULT_RATE_LIMIT };
}

// ── Back-off ──────────────────────────────────────────────────────────────

const MAX_BACKOFF_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Exponential back-off: `base * 2^failureCount`, capped at 5 minutes.
 *
 * @param failureCount  Number of consecutive failures so far (0-indexed).
 * @param base          Base delay in ms (default: 1 000 ms).
 */
export function computeBackoffMs(
  failureCount: number,
  base: number = 1_000,
): number {
  const raw = base * Math.pow(2, failureCount);
  return Math.min(raw, MAX_BACKOFF_MS);
}
