/**
 * Locale variants use hreflang, NOT canonical (TODO #6).
 *
 * The classic programmatic-SEO mistake: pointing the UK page's canonical at the
 * EN page (or vice-versa) "to dedupe". That deindexes the whole non-default
 * locale. Correct behaviour:
 *  - canonical is ALWAYS self-referential per locale (each locale's page is its
 *    own canonical),
 *  - the locales are tied together via `<link rel="alternate" hreflang>` only.
 *
 * This module asserts that invariant against the metadata builder's output so a
 * future edit can never silently introduce a cross-locale canonical. It reuses
 * `hreflangs`/`absoluteUrl` from `@aegis/url-builder` — the same source the
 * builder uses — so the assertions track the real builder.
 *
 * Pure, no network.
 */

import { absoluteUrl, hreflangs } from "@aegis/url-builder";
import { type Locale } from "@aegis/i18n-config";

export type LocaleCanonicalCheckInput = {
  siteUrl: string;
  locale: Locale;
  /** Same path-builder passed to `buildMetadata`. */
  pathFor: (locale: Locale) => string;
};

export type LocaleCanonicalResult = {
  /** Self-referential canonical for this locale. */
  canonical: string;
  /** hreflang alternates (every locale + x-default). */
  alternates: { hreflang: string; href: string }[];
  ok: boolean;
  violations: string[];
};

/**
 * Compute the correct self-canonical + hreflang set and verify the locale
 * policy holds:
 *  1. canonical equals THIS locale's own URL (never another locale's).
 *  2. every active locale has its own hreflang entry.
 *  3. x-default exists.
 */
export function checkLocaleCanonical(
  input: LocaleCanonicalCheckInput,
): LocaleCanonicalResult {
  const { siteUrl, locale, pathFor } = input;
  const canonical = absoluteUrl(siteUrl, pathFor(locale));
  const alternates = hreflangs(siteUrl, pathFor);
  const violations: string[] = [];

  // (1) self-referential canonical
  const selfHref = alternates.find((a) => a.hreflang === locale)?.href;
  if (selfHref && canonical !== selfHref) {
    violations.push(
      `canonical ${canonical} does not match this locale's own URL ${selfHref}`,
    );
  }
  // canonical must NOT equal a *different* locale's URL
  for (const alt of alternates) {
    if (alt.hreflang === "x-default") continue;
    if (alt.hreflang !== locale && alt.href === canonical) {
      violations.push(
        `cross-locale canonical: ${locale} page points at ${alt.hreflang} URL ${alt.href}`,
      );
    }
  }

  // (2) hreflang present
  if (!alternates.some((a) => a.hreflang === locale)) {
    violations.push(`missing hreflang entry for ${locale}`);
  }
  // (3) x-default present
  if (!alternates.some((a) => a.hreflang === "x-default")) {
    violations.push("missing x-default hreflang entry");
  }

  return {
    canonical,
    alternates,
    ok: violations.length === 0,
    violations,
  };
}

/**
 * Assertion form for use in CI / the metadata builder's tests. Throws if the
 * locale policy is violated.
 */
export function assertHreflangNotCanonical(
  input: LocaleCanonicalCheckInput,
): void {
  const res = checkLocaleCanonical(input);
  if (!res.ok) {
    throw new Error(
      `locale-policy violation: ${res.violations.join("; ")}`,
    );
  }
}
