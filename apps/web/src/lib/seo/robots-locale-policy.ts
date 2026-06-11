/**
 * Per-locale robots.txt policy — decision note + helper.
 *
 * TODO/seo/TODO_robots_txt.md:
 *  - Per-locale variant only if subdomain strategy
 *
 * DECISION (Sprint 2.61): Aegis Lens serves locales as PATH PREFIXES on a single
 * origin (`/` = en, `/uk/...` = Ukrainian — see @aegis/url-builder localePath).
 * robots.txt is an ORIGIN-scoped resource: one robots.txt per scheme+host+port.
 * With a single origin there is exactly one robots.txt, so a per-locale robots
 * variant is NOT applicable and MUST NOT be created — `/uk/robots.txt` is not a
 * thing crawlers fetch.
 *
 * A per-locale robots.txt only becomes meaningful under a SUBDOMAIN strategy
 * (e.g. `uk.aegislens.io`), where each subdomain is a distinct origin with its
 * own robots.txt. We are not on that strategy, so this task resolves as a
 * documented "no-op by design" rather than code.
 *
 * This module encodes that decision as a typed predicate so any future switch to
 * subdomains makes the requirement explicit and testable.
 */

export type LocaleStrategy = "path-prefix" | "subdomain";

/** The strategy currently in force. Flip to "subdomain" only if we migrate. */
export const LOCALE_STRATEGY: LocaleStrategy = "path-prefix";

/**
 * Whether per-locale robots.txt files are required. True ONLY under a subdomain
 * strategy (each subdomain = distinct origin = own robots.txt).
 */
export function requiresPerLocaleRobots(strategy: LocaleStrategy = LOCALE_STRATEGY): boolean {
  return strategy === "subdomain";
}

/**
 * Resolve the robots.txt URL for a given locale origin. Under path-prefix there
 * is a single origin-level robots.txt for all locales.
 */
export function robotsUrlForLocale(
  siteUrl: string,
  _locale: string,
  strategy: LocaleStrategy = LOCALE_STRATEGY,
): string {
  const origin = siteUrl.replace(/\/$/, "");
  if (strategy === "path-prefix") return `${origin}/robots.txt`;
  // subdomain strategy would derive the per-locale host here; not in use today.
  return `${origin}/robots.txt`;
}

/** Human-readable rationale (en/uk) for surfacing in SEO docs/dashboards. */
export const PER_LOCALE_ROBOTS_RATIONALE = {
  en: "Single-origin path-prefix locales share one origin-scoped robots.txt; a per-locale robots.txt is not applicable and is intentionally not created.",
  uk: "Локалі на одному джерелі (префікс шляху) спільно використовують один robots.txt, прив'язаний до джерела; окремий robots.txt для кожної локалі недоцільний і навмисно не створюється.",
} as const;
