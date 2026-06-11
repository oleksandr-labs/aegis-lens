/**
 * Search Console + Bing Webmaster setup model.
 *
 * See TODO/seo/TODO_core_web_vitals.md ("Search Console + Bing Webmaster set
 * up"). The broader crawl/index ownership (IndexNow submissions, per-locale GSC
 * properties, ongoing monitoring) lives in the crawl cluster
 * (TODO/seo/TODO_crawl_indexing.md). THIS module is the verification + property
 * registry needed so CWV/CrUX data can be pulled per locale.
 *
 * It encodes: which webmaster properties exist, how each is verified, and the
 * meta-tag verification tokens (read from env — never hardcode secrets). The
 * site serves en (no prefix) + uk (/uk) so each is its own property to get
 * per-locale CrUX + coverage data.
 */

import { ACTIVE_LOCALES } from "@aegis/i18n-config";
import type { Locale } from "@aegis/i18n-config";
import { SITE } from "../../site";

export type WebmasterProvider = "google" | "bing";

/** How a property is verified with the provider. */
export type VerificationMethod = "dns-txt" | "meta-tag" | "html-file";

export interface WebmasterProperty {
  provider: WebmasterProvider;
  /** Locale this property scopes to (URL-prefix property). */
  locale: Locale;
  /** Property URL prefix, e.g. https://site/ or https://site/uk/. */
  urlPrefix: string;
  method: VerificationMethod;
  /** Env var name holding the verification token (NOT the token itself). */
  tokenEnvVar: string;
}

function prefixForLocale(locale: Locale): string {
  const base = SITE.url.replace(/\/+$/, "");
  // en is the default locale and has no path prefix.
  return locale === "en" ? `${base}/` : `${base}/${locale}/`;
}

/**
 * The webmaster properties to register: one Google + one Bing per active
 * locale (en, uk). DNS-TXT for the apex Google property, meta-tag for the rest.
 */
export const WEBMASTER_PROPERTIES: readonly WebmasterProperty[] = ACTIVE_LOCALES.flatMap(
  (locale): WebmasterProperty[] => [
    {
      provider: "google",
      locale,
      urlPrefix: prefixForLocale(locale),
      method: locale === "en" ? "dns-txt" : "meta-tag",
      tokenEnvVar: `GSC_VERIFICATION_${locale.toUpperCase()}`,
    },
    {
      provider: "bing",
      locale,
      urlPrefix: prefixForLocale(locale),
      method: "meta-tag",
      tokenEnvVar: `BING_VERIFICATION_${locale.toUpperCase()}`,
    },
  ],
);

/**
 * Build the verification <meta> tags to render in <head> for the given locale,
 * pulling tokens from the environment. Returns only those whose env var is set
 * (so a missing token degrades gracefully rather than emitting empty tags).
 */
export function verificationMetaTags(
  locale: Locale,
  env: Record<string, string | undefined> = process.env,
): { name: string; content: string }[] {
  const names: Record<WebmasterProvider, string> = {
    google: "google-site-verification",
    bing: "msvalidate.01",
  };
  return WEBMASTER_PROPERTIES.filter((p) => p.locale === locale && p.method === "meta-tag")
    .map((p) => ({ name: names[p.provider], content: env[p.tokenEnvVar] }))
    .filter((t): t is { name: string; content: string } => Boolean(t.content));
}
