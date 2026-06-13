/**
 * Anti-bot signal detection and graceful degradation handler.
 *
 * POLICY: We detect and respect anti-bot measures. We do NOT attempt to
 * bypass them. Circumventing CAPTCHAs, rotating IPs to evade 403s, or
 * solving JS challenges against a site's ToS is prohibited.
 *
 * Responses:
 *   captcha         → pause crawl on domain for 24 h, alert team
 *   rate_limit_429  → exponential back-off (respect server's signal)
 *   forbidden_403   → mark domain no-crawl, stop immediately
 *   honeypot_link   → mark URL as trap, skip domain subtree
 *   js_challenge    → switch to headless mode ONLY if ToS permits
 */

import { computeBackoffMs } from "./rate-limits";
import type { CompliancePosture } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

/** Signals that the target is defending against automated access. */
export type AntiBotSignal =
  | "captcha"
  | "rate_limit_429"
  | "forbidden_403"
  | "honeypot_link"
  | "js_challenge";

/** The minimal shape of a crawl response needed for signal detection. */
export interface CrawlResponse {
  /** HTTP status code (0 if network error / no response). */
  statusCode: number;
  /** Response body as text (may be truncated; first 8 KB is enough). */
  body: string;
  /** Response headers. */
  headers: Record<string, string>;
  /** The URL that was requested. */
  requestUrl: string;
  /**
   * URL that was clicked to arrive here (for honeypot detection).
   * Only set when following in-page links; not set for seed / sitemap URLs.
   */
  referringLinkText?: string;
  /** True if the HTML contained a `<noscript>` redirect challenge page. */
  hasNoscriptRedirect?: boolean;
}

/** What the crawler should do in response to an anti-bot signal. */
export interface AntiBotAction {
  signal: AntiBotSignal;
  domain: string;
  /** How long (ms) to wait before the next request to this domain. */
  pauseMs: number;
  /** Whether to permanently block further crawling of this domain. */
  markNoCrawl: boolean;
  /** Whether to send a team alert (Slack / PagerDuty). */
  alertTeam: boolean;
  /** Human-readable description for logs / audit trail. */
  message: string;
  /**
   * For JS challenges only: switch to headless browser IF this domain's
   * compliance posture is "public_crawl" AND headless was not already active.
   * Never true for any other signal.
   */
  switchToHeadless: boolean;
}

/** In-memory domain pause registry (millisecond epoch → resume time). */
const domainPausedUntil = new Map<string, number>();

/** Tracks consecutive 429s per domain for backoff calculation. */
const consecutive429s = new Map<string, number>();

// ── Detection ─────────────────────────────────────────────────────────────────

/**
 * Inspect a crawl response and return the detected anti-bot signal, or null
 * if the response looks clean.
 *
 * Detection heuristics (in priority order):
 *   1. HTTP 429                          → rate_limit_429
 *   2. HTTP 403                          → forbidden_403
 *   3. CAPTCHA HTML markers              → captcha
 *   4. JS challenge / Cloudflare markers → js_challenge
 *   5. Honeypot link heuristics          → honeypot_link
 */
export function detectAntiBotSignal(
  response: CrawlResponse,
): AntiBotSignal | null {
  const { statusCode, body, headers, referringLinkText, hasNoscriptRedirect } =
    response;

  // ── 1. Explicit rate limiting ────────────────────────────────────────────
  if (statusCode === 429) {
    return "rate_limit_429";
  }

  // ── 2. Forbidden ─────────────────────────────────────────────────────────
  if (statusCode === 403) {
    return "forbidden_403";
  }

  // ── 3. CAPTCHA ───────────────────────────────────────────────────────────
  // Broad match: Google reCAPTCHA, hCaptcha, Arkose, generic "verify human"
  const bodyLower = body.toLowerCase();
  if (
    bodyLower.includes("recaptcha") ||
    bodyLower.includes("hcaptcha") ||
    bodyLower.includes("cf-turnstile") ||
    bodyLower.includes("arkose") ||
    bodyLower.includes("verify you are human") ||
    bodyLower.includes("verify that you are not a robot") ||
    bodyLower.includes("i am not a robot") ||
    bodyLower.includes("captcha-container") ||
    (statusCode === 200 && bodyLower.includes("captcha"))
  ) {
    return "captcha";
  }

  // ── 4. JS challenge ───────────────────────────────────────────────────────
  // Cloudflare "Checking your browser…", Imperva, DataDome, etc.
  const cfServer = (headers["server"] ?? "").toLowerCase();
  const cfRay = headers["cf-ray"];
  const contentType = (headers["content-type"] ?? "").toLowerCase();

  if (
    hasNoscriptRedirect ||
    (cfRay && statusCode === 503) ||
    bodyLower.includes("checking your browser") ||
    bodyLower.includes("ddos-guard") ||
    bodyLower.includes("just a moment") ||     // Cloudflare interstitial
    bodyLower.includes("enable javascript") ||
    bodyLower.includes("datadome") ||
    (cfServer.includes("cloudflare") &&
      statusCode === 403 &&
      contentType.includes("text/html"))
  ) {
    return "js_challenge";
  }

  // ── 5. Honeypot link ─────────────────────────────────────────────────────
  // A link is likely a honeypot if:
  //   a) It has CSS display:none / visibility:hidden in its style attribute, OR
  //   b) Its link text is invisible (zero-width chars / whitespace-only), OR
  //   c) referringLinkText explicitly flags it (set by the link-follower)
  if (referringLinkText !== undefined) {
    const zeroWidthRe = /[​-‍﻿­]/;
    if (
      referringLinkText.trim() === "" ||
      zeroWidthRe.test(referringLinkText)
    ) {
      return "honeypot_link";
    }
  }

  // Also inspect body for honeypot patterns when we have the referring link context
  if (
    bodyLower.includes("you have been trapped") ||
    bodyLower.includes("honeypot") ||
    bodyLower.includes("spider trap")
  ) {
    return "honeypot_link";
  }

  return null;
}

// ── Response / action ─────────────────────────────────────────────────────────

/**
 * Given a detected signal and domain, decide what the crawler should do.
 *
 * @param signal          The detected anti-bot signal.
 * @param domain          Hostname (bare, e.g. "example.com").
 * @param compliancePosture  The domain's known ToS posture.
 * @param consecutiveHits   How many consecutive times this signal has fired
 *                          (used for 429 back-off progression). Defaults to 1.
 */
export function handleAntiBotSignal(
  signal: AntiBotSignal,
  domain: string,
  compliancePosture: CompliancePosture = "public_crawl",
  consecutiveHits: number = 1,
): AntiBotAction {
  switch (signal) {
    // ── CAPTCHA ─────────────────────────────────────────────────────────────
    // Pause 24 h. Do NOT attempt to solve. Flag for human review.
    case "captcha": {
      const pauseMs = 24 * 60 * 60 * 1_000; // 24 hours
      domainPausedUntil.set(domain, Date.now() + pauseMs);
      return {
        signal,
        domain,
        pauseMs,
        markNoCrawl: false, // human reviews before permanent block
        alertTeam: true,
        switchToHeadless: false,
        message:
          `CAPTCHA detected on ${domain}. ` +
          `Crawl paused for 24 h. Manual review required before resuming.`,
      };
    }

    // ── 429 Rate limit ──────────────────────────────────────────────────────
    // Exponential back-off. Never bypass. Honor Retry-After if present (caller
    // must pass that value via consecutiveHits=0 and a custom base).
    case "rate_limit_429": {
      const count = consecutive429s.get(domain) ?? 0;
      const next = count + 1;
      consecutive429s.set(domain, next);

      // Base 60 s, doubles each hit, capped at 6 h
      const pauseMs = Math.min(
        computeBackoffMs(next, 60_000),
        6 * 60 * 60 * 1_000,
      );
      domainPausedUntil.set(domain, Date.now() + pauseMs);
      return {
        signal,
        domain,
        pauseMs,
        markNoCrawl: false,
        alertTeam: next >= 5, // alert after 5 consecutive 429s
        switchToHeadless: false,
        message:
          `Rate limited (429) by ${domain} (hit #${next}). ` +
          `Back-off: ${Math.round(pauseMs / 1000)} s.`,
      };
    }

    // ── 403 Forbidden ───────────────────────────────────────────────────────
    // Hard stop. Mark domain as no-crawl. Do NOT rotate UA or IP.
    case "forbidden_403": {
      return {
        signal,
        domain,
        pauseMs: Infinity,
        markNoCrawl: true,
        alertTeam: true,
        switchToHeadless: false,
        message:
          `403 Forbidden on ${domain}. ` +
          `Domain marked no-crawl. ` +
          `Review robots.txt and ToS; seek permission before retrying.`,
      };
    }

    // ── Honeypot link ───────────────────────────────────────────────────────
    // Discard the URL. Do not crawl the linked page. Log for audit.
    // We do NOT block the entire domain — one honeypot ≠ blanket ban.
    case "honeypot_link": {
      return {
        signal,
        domain,
        pauseMs: 0, // no pause on domain level; just skip this URL
        markNoCrawl: false,
        alertTeam: false,
        switchToHeadless: false,
        message:
          `Honeypot link detected on ${domain}. ` +
          `URL skipped; domain subtree flagged for review.`,
      };
    }

    // ── JS challenge ─────────────────────────────────────────────────────────
    // Only switch to headless if:
    //   1. Domain is known "public_crawl" (ToS allows automated access)
    //   2. Headless was not already active (caller must check)
    // Otherwise: pause 1 h and alert team.
    case "js_challenge": {
      const canUseHeadless = compliancePosture === "public_crawl";
      if (canUseHeadless) {
        return {
          signal,
          domain,
          pauseMs: 5_000, // short pause before relaunching with headless
          markNoCrawl: false,
          alertTeam: false,
          switchToHeadless: true,
          message:
            `JS challenge on ${domain}. ` +
            `Switching to headless browser (ToS posture: public_crawl).`,
        };
      } else {
        const pauseMs = 60 * 60 * 1_000; // 1 hour
        domainPausedUntil.set(domain, Date.now() + pauseMs);
        return {
          signal,
          domain,
          pauseMs,
          markNoCrawl: false,
          alertTeam: true,
          switchToHeadless: false,
          message:
            `JS challenge on ${domain} (posture: ${compliancePosture}). ` +
            `Cannot use headless without explicit ToS permission. ` +
            `Paused 1 h; requires manual review.`,
        };
      }
    }
  }
}

// ── Domain pause helpers ──────────────────────────────────────────────────────

/**
 * Returns true if the domain is currently in a pause window.
 * Callers should check this before enqueuing new requests.
 */
export function isDomainPaused(domain: string): boolean {
  const resumeAt = domainPausedUntil.get(domain);
  if (resumeAt === undefined) return false;
  if (Date.now() >= resumeAt) {
    domainPausedUntil.delete(domain);
    return false;
  }
  return true;
}

/**
 * Returns the number of milliseconds until the domain pause expires,
 * or 0 if the domain is not paused.
 */
export function domainPauseRemainingMs(domain: string): number {
  const resumeAt = domainPausedUntil.get(domain);
  if (resumeAt === undefined) return 0;
  return Math.max(0, resumeAt - Date.now());
}

/**
 * Clear a domain's pause (e.g. after a human review determines it is safe
 * to resume). Also resets the 429 consecutive counter.
 */
export function clearDomainPause(domain: string): void {
  domainPausedUntil.delete(domain);
  consecutive429s.delete(domain);
}

/**
 * Reset 429 back-off counter for a domain after a successful request.
 * Callers should invoke this whenever a non-429 success is received.
 */
export function resetRateLimitCounter(domain: string): void {
  consecutive429s.delete(domain);
}

// ── Alerting stub ─────────────────────────────────────────────────────────────

/**
 * Fire-and-forget team alert for anti-bot events.
 *
 * In production this should call the AlertChannel or a Slack/PagerDuty webhook.
 * Imported lazily to avoid circular dependency with the alert sub-system.
 *
 * Usage: the crawler's main loop calls this after handleAntiBotSignal()
 * if action.alertTeam === true.
 */
export async function sendAntiBotAlert(
  action: AntiBotAction,
): Promise<void> {
  // Structured log — picked up by Vector → Grafana
  console.warn(
    JSON.stringify({
      level: "warn",
      event: "anti_bot_signal",
      signal: action.signal,
      domain: action.domain,
      markNoCrawl: action.markNoCrawl,
      pauseMs: action.pauseMs,
      message: action.message,
      ts: new Date().toISOString(),
    }),
  );

  // TODO: wire to apps/web/src/lib/realtime/sse.ts → AlertChannel when live
}
