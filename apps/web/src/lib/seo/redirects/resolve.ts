/**
 * Redirect resolution — the edge-time decision logic.
 *
 * Wraps the registry with two SEO-critical behaviours (see TODO_redirects.md):
 *
 *  6. Hreflang-aware redirects: a redirect authored for the EN path should also
 *     apply to the localized counterpart, mapping the destination into the SAME
 *     locale so we never bounce a user across languages. If an explicit
 *     locale-specific rule exists it always wins.
 *
 *  7. Locale-prefix redirects: matching strips/re-applies the `/uk` style prefix
 *     so authors can write one rule. The DEFAULT_LOCALE (en) has no prefix.
 *
 * Everything stays root-relative; the middleware turns the result into a
 * NextResponse.redirect (see handoff snippet in sprint261_shared_REDIRECTS.txt).
 */

import { LOCALES, DEFAULT_LOCALE, isLocale, type Locale } from "@aegis/i18n-config";
import { lookup, type RedirectRegistry, type RedirectRule } from "./registry";

export interface ResolvedRedirect {
  /** Absolute-from-root destination path, in the request's locale. Null for 410. */
  to: string | null;
  status: RedirectRule["status"];
  reason: string;
  /** True when the match came from the EN base rule via locale mapping. */
  viaHreflang: boolean;
}

/** Split a path into its locale prefix (if any) and the remainder. */
export function splitLocale(path: string): { locale: Locale; rest: string } {
  const seg = path.split("/")[1] ?? "";
  if (isLocale(seg) && seg !== DEFAULT_LOCALE) {
    const rest = path.slice(seg.length + 1) || "/";
    return { locale: seg, rest: rest.startsWith("/") ? rest : `/${rest}` };
  }
  return { locale: DEFAULT_LOCALE, rest: path };
}

/** Apply a locale prefix to a root (EN-shaped, prefix-less) path. */
export function applyLocale(locale: Locale, rest: string): string {
  const normalized = rest.startsWith("/") ? rest : `/${rest}`;
  return locale === DEFAULT_LOCALE ? normalized : `/${locale}${normalized}`;
}

/**
 * Resolve a redirect for the given request path.
 *
 * Match order:
 *   1. Exact rule on the full path (locale-specific wins).
 *   2. Locale-stripped rule on the EN-shaped remainder (hreflang-aware): the
 *      destination is re-prefixed into the request's locale.
 *
 * Returns undefined when no rule matches (request proceeds normally).
 */
export function resolveRedirect(
  registry: RedirectRegistry,
  path: string,
): ResolvedRedirect | undefined {
  // 1. Exact, locale-specific rule.
  const exact = lookup(registry, path);
  if (exact) {
    return { to: exact.to, status: exact.status, reason: exact.reason, viaHreflang: false };
  }

  // 2. Hreflang-aware: match the prefix-less remainder against the base rule.
  const { locale, rest } = splitLocale(path);
  if (locale !== DEFAULT_LOCALE) {
    const base = lookup(registry, rest);
    if (base) {
      const to = base.to == null ? null : applyLocale(locale, stripLocale(base.to));
      return { to, status: base.status, reason: base.reason, viaHreflang: true };
    }
  }

  return undefined;
}

/** Remove a leading locale prefix from a path, yielding the EN-shaped form. */
function stripLocale(path: string): string {
  const seg = path.split("/")[1] ?? "";
  if (isLocale(seg) && seg !== DEFAULT_LOCALE) {
    return path.slice(seg.length + 1) || "/";
  }
  return path;
}

/** All locale variants a base rule effectively covers (for audit/reporting). */
export function localeVariants(basePath: string): string[] {
  const { rest } = splitLocale(basePath);
  return LOCALES.map((lc) => applyLocale(lc, rest));
}
