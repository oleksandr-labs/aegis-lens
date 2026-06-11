import "server-only";

/**
 * Bot / Scraping Defense — API Gateway edge module.
 *
 * Combines two strategies:
 *   1. User-agent fingerprinting — match against known bad/good bot UA patterns.
 *   2. Behavioural heuristics — requests-per-minute, accept header anomalies,
 *      missing common headers.
 *
 * This module is the "custom heuristics" half of the "Cloudflare + custom
 * heuristics" task. In production, the Cloudflare Bot Management score
 * (available as the `cf-bot-management-score` header) should be read and
 * fused into `detectBot` via the `cfBotScore` field.
 *
 * All pattern matching is case-insensitive string inclusion.
 *
 * Good bots (Googlebot, Bingbot, etc.) are detected and allowed through — never
 * block crawlers that are needed for SEO.
 */

// ── Signal and decision types ─────────────────────────────────────────────────

export interface BotSignal {
  /** Raw user-agent string (may be undefined if the header is absent). */
  userAgent?: string;
  /** Client IP address (for rate signal correlation). */
  ip: string;
  /** Estimated requests per minute from this IP in the last sliding window. */
  requestsPerMin: number;
  /** Value of the `Accept` header (absent = suspicious for browser-like UAs). */
  acceptHeader?: string;
  /**
   * Cloudflare Bot Management score (0–100, higher = more likely bot).
   * Only available when the origin sits behind Cloudflare Enterprise.
   * Pass undefined if not available.
   */
  cfBotScore?: number;
}

export type BotType = "scraper" | "good_bot" | "unknown" | "legitimate";
export type BotRecommendation = "allow" | "challenge" | "block";

export interface BotDecision {
  isBot: boolean;
  /** Confidence that this is a bot, 0–1. */
  confidence: number;
  botType: BotType;
  recommendation: BotRecommendation;
  /** Primary signal that drove the decision (for logging). */
  primarySignal: string;
}

// ── Pattern lists ─────────────────────────────────────────────────────────────

/**
 * Known scraper / bad-bot user-agent substrings (case-insensitive).
 * Sources: https://github.com/monperrus/crawler-user-agents, commercial lists.
 */
export const KNOWN_BOT_UA_PATTERNS: string[] = [
  "scrapy",
  "python-requests",
  "python-urllib",
  "go-http-client",
  "java/",
  "curl/",
  "wget/",
  "libwww-perl",
  "lwp-trivial",
  "mechanize",
  "httpclient",
  "okhttp",
  "axios",
  "node-fetch",
  "got/",
  "superagent",
  "aiohttp",
  "httpx/",
  "pycurl",
  "jakarta commons-httpclient",
  "restsharp",
  "php-curl",
  "dataprovider",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "dotbot",
  "petalbot",
  "sistrix",
  "serpstatbot",
  "siteauditbot",
  "project25499",
  "blexbot",
  "archive.org_bot",
  "megaindex",
  "crawler",
  "spider",
  "scraper",
];

/**
 * Good-bot user-agent substrings — search engine crawlers and other legitimate
 * automated agents that should always be allowed through.
 */
export const GOOD_BOT_UA_PATTERNS: string[] = [
  "googlebot",
  "bingbot",
  "slurp", // Yahoo
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "applebot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  "discordbot",
  "slackbot",
  "google-inspectiontool",
  "googleother",
  "adsbot-google",
  "mediapartners-google",
  "facebot",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchesAny(
  haystack: string,
  patterns: string[],
): string | null {
  const lower = haystack.toLowerCase();
  for (const p of patterns) {
    if (lower.includes(p.toLowerCase())) return p;
  }
  return null;
}

/** Requests-per-minute thresholds */
const RPM_CHALLENGE_THRESHOLD = 60;
const RPM_BLOCK_THRESHOLD = 200;

/** Cloudflare bot score thresholds (0 = definitely not bot, 100 = definitely bot) */
const CF_CHALLENGE_SCORE = 30;
const CF_BLOCK_SCORE = 70;

// ── Core detection function ───────────────────────────────────────────────────

/**
 * Detect whether a request originates from a bot and recommend an action.
 *
 * The function is pure (no I/O, no side effects) and fast — safe to call on
 * every incoming request in middleware.
 */
export function detectBot(request: BotSignal): BotDecision {
  const ua = request.userAgent ?? "";

  // 1. Good-bot fast-path — always allow, no further scoring needed.
  const goodMatch = matchesAny(ua, GOOD_BOT_UA_PATTERNS);
  if (goodMatch) {
    return {
      isBot: true,
      confidence: 0.95,
      botType: "good_bot",
      recommendation: "allow",
      primarySignal: `good-bot UA pattern "${goodMatch}"`,
    };
  }

  // Accumulate signals as a weighted confidence score.
  let score = 0; // 0 = human, 1 = definitely bot
  let primarySignal = "no signal";

  // 2. Bad-bot UA pattern match (strong signal, weight 0.7)
  const badMatch = matchesAny(ua, KNOWN_BOT_UA_PATTERNS);
  if (badMatch) {
    score = Math.max(score, 0.7);
    primarySignal = `known scraper UA pattern "${badMatch}"`;
  }

  // 3. Absent user-agent (moderate signal, weight 0.6)
  if (!request.userAgent || ua.trim() === "") {
    score = Math.max(score, 0.6);
    if (score === 0.6) primarySignal = "missing user-agent";
  }

  // 4. Absent Accept header when UA looks browser-like (weak signal, weight 0.3)
  if (
    !request.acceptHeader &&
    !badMatch &&
    ua.length > 0
  ) {
    score = Math.max(score, 0.3);
    if (score <= 0.3) primarySignal = "missing Accept header";
  }

  // 5. Rate-based signals
  if (request.requestsPerMin >= RPM_BLOCK_THRESHOLD) {
    score = Math.max(score, 0.85);
    primarySignal = `high RPM (${request.requestsPerMin})`;
  } else if (request.requestsPerMin >= RPM_CHALLENGE_THRESHOLD) {
    score = Math.max(score, 0.55);
    if (score <= 0.55) primarySignal = `elevated RPM (${request.requestsPerMin})`;
  }

  // 6. Cloudflare bot score (if available)
  if (request.cfBotScore !== undefined) {
    const cfNormalized = request.cfBotScore / 100;
    if (cfNormalized > score) {
      score = cfNormalized;
      primarySignal = `Cloudflare bot score ${request.cfBotScore}`;
    }
  }

  // ── Decision ───────────────────────────────────────────────────────────────

  if (score >= 0.7) {
    return {
      isBot: true,
      confidence: score,
      botType: "scraper",
      recommendation: "block",
      primarySignal,
    };
  }

  if (score >= 0.4) {
    return {
      isBot: true,
      confidence: score,
      botType: "unknown",
      recommendation: "challenge",
      primarySignal,
    };
  }

  return {
    isBot: false,
    confidence: score,
    botType: "legitimate",
    recommendation: "allow",
    primarySignal: score > 0 ? primarySignal : "no bot signals detected",
  };
}
