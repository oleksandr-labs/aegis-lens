/**
 * Core types for the Aegis Lens polite crawler system.
 *
 * Design principles:
 *   - Every domain has an explicit compliance posture
 *   - robots.txt is always respected (field is typed as `true`, never false)
 *   - Rate limits and politeness windows are first-class config
 */

// ── Branded primitives ────────────────────────────────────────────────────

/** Opaque identifier for a crawl target / domain config entry. */
export type CrawlTargetId = string & { __brand: "CrawlTargetId" };

// ── Enumerations ──────────────────────────────────────────────────────────

/** Headless-browser / fetch framework used for a domain. */
export type CrawlerFramework =
  | "playwright_cluster"
  | "scrapy"
  | "custom_fetch";

/** How raw content is extracted from a fetched page. */
export type ExtractionMethod =
  | "css"
  | "xpath"
  | "llm_assisted"
  | "api";

/**
 * Legal / ToS posture for a domain.
 *
 *   public_crawl        — publicly accessible, ToS permits crawling
 *   requires_permission — need explicit permission before crawling
 *   no_crawl            — disallow; e.g. robots.txt Disallow: / or known ToS ban
 */
export type CompliancePosture =
  | "public_crawl"
  | "requires_permission"
  | "no_crawl";

/** Current lifecycle state of an individual crawl job. */
export type CrawlJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "graceful_degraded";

// ── Domain configuration ──────────────────────────────────────────────────

/**
 * Full crawl configuration for a single domain.
 *
 * `robotsTxtRespected` is typed as the literal `true` — the system never
 * skips robots.txt; the field exists to make the contract explicit.
 */
export interface DomainCrawlConfig {
  domain: string;
  rateLimit: {
    /** Maximum sustained request rate. */
    requestsPerMinute: number;
    /** Extra requests allowed in a short burst window. */
    burstAllowed: number;
  };
  /** Always true — the crawler never bypasses robots.txt. */
  robotsTxtRespected: true;
  /** Value sent in the User-Agent HTTP header. */
  userAgent: string;
  /** Contact address included in the User-Agent or header. */
  contactEmail: string;
  /** Minimum gap between consecutive requests to this domain (ms). */
  politenessWindowMs: number;
  framework: CrawlerFramework;
  extractionMethod: ExtractionMethod;
  /** Whether to spin up a headless browser for JS-rendered pages. */
  jsRendering: boolean;
  compliancePosture: CompliancePosture;
}

// ── Crawl job ─────────────────────────────────────────────────────────────

/**
 * A single crawl job instance — one URL at one point in time.
 * Immutable raw HTML/content is archived under `rawArchiveKey`.
 */
export interface CrawlJob {
  jobId: string;
  targetUrl: string;
  domain: string;
  status: CrawlJobStatus;
  /** ISO-8601: when the job was enqueued. */
  scheduledAt: string;
  /** ISO-8601: when execution started; absent while queued. */
  startedAt?: string;
  /** ISO-8601: when execution finished (success or failure). */
  completedAt?: string;
  /** Object-store key for the raw archived response body. */
  rawArchiveKey?: string;
  /** Number of structured items extracted from this page. */
  extractedItemCount?: number;
  /** Human-readable error message if status is "failed". */
  error?: string;
}
