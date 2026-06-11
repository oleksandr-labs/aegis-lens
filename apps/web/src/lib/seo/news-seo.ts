/**
 * News SEO utilities — JSON-LD schema builders for news articles and breadcrumbs.
 * Aligned with Google News requirements and schema.org/NewsArticle spec.
 */

import { SITE } from "./site";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NewsArticle {
  headline_en: string;
  headline_uk: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName?: string;
  /** Absolute URL to OG/hero image */
  imageUrl?: string;
  description_en: string;
  description_uk: string;
  keywords: string[];
  isBreaking: boolean;
}

// ── News Sitemap Config ───────────────────────────────────────────────────────

/**
 * Configuration for Google News sitemap entries.
 * `maxAgeHours`: events older than this are excluded from the news sitemap.
 */
export const NEWS_SITEMAP_CONFIG: {
  changefreq: string;
  priority: number;
  maxAgeHours: number;
} = {
  changefreq: "always",
  priority: 0.9,
  maxAgeHours: 48,
};

// ── JSON-LD Builders ──────────────────────────────────────────────────────────

/**
 * Builds a schema.org/NewsArticle JSON-LD object.
 * Pass `locale` to select the correct language headline/description.
 */
export function buildNewsArticleJsonLd(
  article: NewsArticle,
  locale: "en" | "uk",
): object {
  const headline = locale === "uk" ? article.headline_uk : article.headline_en;
  const description =
    locale === "uk" ? article.description_uk : article.description_en;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline,
    description,
    datePublished: article.publishedAt,
    ...(article.modifiedAt && { dateModified: article.modifiedAt }),
    ...(article.authorName && {
      author: {
        "@type": "Person",
        name: article.authorName,
      },
    }),
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/logo.png`,
      },
    },
    ...(article.imageUrl && {
      image: {
        "@type": "ImageObject",
        url: article.imageUrl,
      },
    }),
    keywords: article.keywords.join(", "),
    inLanguage: locale === "uk" ? "uk" : "en",
    ...(article.isBreaking && {
      articleSection: "Breaking News",
    }),
  };
}

/**
 * Builds a schema.org/BreadcrumbList JSON-LD object.
 *
 * @param items — ordered breadcrumb items; last item is the current page.
 */
export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Builds a combined JSON-LD array for a news article page
 * (article + breadcrumbs).
 */
export function buildNewsPageJsonLd(
  article: NewsArticle,
  breadcrumbs: { name: string; url: string }[],
  locale: "en" | "uk",
): object[] {
  return [
    buildNewsArticleJsonLd(article, locale),
    buildBreadcrumbJsonLd(breadcrumbs),
  ];
}
