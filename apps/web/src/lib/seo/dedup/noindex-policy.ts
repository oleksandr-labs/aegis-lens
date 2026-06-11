/**
 * Robots `noindex` policy — the single decision point that turns the
 * uniqueness + thin-content signals (and a few hard route rules) into a robots
 * meta directive the metadata builder can consume.
 *
 * Two responsibilities:
 *  1. Auto-`noindex` pages that fall below the uniqueness threshold or are too
 *     thin (TODO #3).
 *  2. Always-`noindex` route classes that must never be indexed — search
 *     results, internal/account pages, raw faceted combos (TODO #8).
 *
 * Output shape mirrors what `buildMetadata({ noindex })` already understands,
 * plus a richer directive for callers that want `noindex, follow`.
 *
 * Pure, no network.
 */

import { isSufficientlyUnique, type TemplateId } from "./uniqueness";
import { evaluateThinContent, type PageContent } from "./thin-guard";

/** Robots directive resolved for a page. */
export type RobotsDirective = {
  index: boolean;
  follow: boolean;
  /** Human-readable reason, for audit logs / debugging. */
  reason: string;
};

export const INDEX_FOLLOW: RobotsDirective = {
  index: true,
  follow: true,
  reason: "passes all index gates",
};

/**
 * Path prefixes (locale stripped) that must ALWAYS be `noindex`.
 * `follow` stays true so link equity still flows through them.
 *
 * - search/help/contact use a `?q=` search box → infinite low-value URLs.
 * - account/dashboard/settings are private, per-user, non-canonical.
 */
export const NOINDEX_ROUTE_PREFIXES: readonly string[] = [
  "/search",
  "/help", // help has a ?q= search; individual /help/<slug> articles are listed below as exceptions
  "/account",
  "/dashboard",
  "/settings",
  "/login",
  "/signup",
  "/api",
  "/embed",
];

/**
 * Routes that LOOK like a noindex prefix match but are real, indexable content
 * and must be allowed through (checked before the prefix list).
 */
export const INDEX_EXCEPTION_PREFIXES: readonly string[] = [
  "/help/", // /help/<slug> articles are indexable; bare /help (search) is not
];

/** Strip a leading `/<locale>` segment so route rules are locale-agnostic. */
export function stripLocale(path: string, locales: readonly string[]): string {
  const m = path.match(/^\/([a-z]{2})(\/|$)/);
  if (m && locales.includes(m[1]) && m[1] !== "en") {
    return path.slice(m[1].length + 1) || "/";
  }
  return path;
}

/** True if a (locale-stripped) path is a hard-`noindex` route. */
export function isNoindexRoute(
  pathWithoutLocale: string,
  prefixes: readonly string[] = NOINDEX_ROUTE_PREFIXES,
  exceptions: readonly string[] = INDEX_EXCEPTION_PREFIXES,
): boolean {
  const path = pathWithoutLocale || "/";
  if (exceptions.some((ex) => path.startsWith(ex))) return false;
  return prefixes.some((p) => path === p || path.startsWith(p + "/") || path.startsWith(p + "?"));
}

export type IndexDecisionInput = {
  /** Locale-stripped path of the page (e.g. "/threats/uav/in/ua"). */
  path: string;
  /** Locales known to the app, for `stripLocale`. */
  locales?: readonly string[];
  /** Template this page belongs to (for uniqueness ceiling). */
  template?: TemplateId;
  /** Cosine similarity to the nearest sibling, if computed by the audit. */
  similarityToNearest?: number;
  /** Page content for the thin-content gate, if available. */
  content?: PageContent;
};

/**
 * Resolve the robots directive for a page. Hard route rules win first, then
 * thin-content, then uniqueness. Anything that fails a gate becomes
 * `index:false, follow:true` (noindex, follow) — never `nofollow`, so we don't
 * strand link equity.
 */
export function resolveRobots(input: IndexDecisionInput): RobotsDirective {
  const path = stripLocale(input.path, input.locales ?? ["en", "uk"]);

  if (isNoindexRoute(path)) {
    return { index: false, follow: true, reason: `noindex route: ${path}` };
  }

  if (input.content) {
    const thin = evaluateThinContent(input.content);
    if (!thin.ok) {
      return {
        index: false,
        follow: true,
        reason: `thin content: ${thin.reasons.join("; ")}`,
      };
    }
  }

  if (
    input.template != null &&
    typeof input.similarityToNearest === "number" &&
    !isSufficientlyUnique(input.similarityToNearest, input.template)
  ) {
    return {
      index: false,
      follow: true,
      reason: `below uniqueness threshold (sim=${input.similarityToNearest.toFixed(
        3,
      )})`,
    };
  }

  return INDEX_FOLLOW;
}

/** Shorthand for `buildMetadata({ noindex })`: true when the page must not index. */
export function shouldNoindex(input: IndexDecisionInput): boolean {
  return !resolveRobots(input).index;
}
