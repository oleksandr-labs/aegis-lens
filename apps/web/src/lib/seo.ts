import type { Metadata } from "next";
import { hreflangs, absoluteUrl } from "@aegis/url-builder";
import { type Locale } from "@aegis/i18n-config";
import { SITE } from "./site";

type BuildArgs = {
  locale: Locale;
  title: string;
  description: string;
  /** Function that returns the path for a given locale. Used for hreflang. */
  pathFor: (locale: Locale) => string;
  /** OG image absolute or relative path. */
  ogImage?: string;
  /** Index policy. */
  noindex?: boolean;
  /** Feed `<link rel="alternate">` entries — e.g. RSS + Atom for autodiscovery. */
  feeds?: { type: "application/rss+xml" | "application/atom+xml" | "application/feed+json"; href: string; title?: string }[];
};

export function buildMetadata(args: BuildArgs): Metadata {
  const { locale, title, description, pathFor, ogImage, noindex, feeds } = args;
  const canonical = absoluteUrl(SITE.url, pathFor(locale));
  const alternates = hreflangs(SITE.url, pathFor);

  const feedTypes: Record<string, { url: string; title?: string }[]> = {};
  if (feeds) {
    for (const f of feeds) {
      const url = absoluteUrl(SITE.url, f.href);
      (feedTypes[f.type] ??= []).push({ url, title: f.title });
    }
  }

  return {
    title,
    description,
    metadataBase: new URL(SITE.url),
    alternates: {
      canonical,
      languages: Object.fromEntries(
        alternates.map(({ hreflang, href }) => [hreflang, href]),
      ),
      ...(Object.keys(feedTypes).length > 0
        ? {
            types: Object.fromEntries(
              Object.entries(feedTypes).map(([t, list]) => [t, list]),
            ),
          }
        : {}),
    },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

/**
 * JSON-LD `Organization` site-wide.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
  };
}

/**
 * JSON-LD `WebSite` with SearchAction.
 */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
