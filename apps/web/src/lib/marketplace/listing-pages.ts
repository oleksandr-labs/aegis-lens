/**
 * Marketplace — Public listing pages configuration.
 *
 * Each plugin gets its own SEO surface: a canonical slug-based URL,
 * Schema.org structured data (SoftwareApplication), and Open Graph metadata.
 * These are generated at build time and revalidated on publish/update.
 *
 * Кожен плагін має власну SEO-сторінку: slug, структуровані дані Schema.org
 * і Open Graph мета-теги. Генеруються при білді та оновлюються при публікації.
 */

import type { PluginManifest } from "../../../packages/plugin-sdk/src/types";

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Schema.org type applied to every plugin listing page.
 *
 * Тип Schema.org для кожної сторінки плагіну.
 */
export const LISTING_SCHEMA_ORG_TYPE = "SoftwareApplication" as const;

/** Base URL for marketplace listing pages. */
const MARKETPLACE_BASE_URL = "https://aegislens.com/marketplace/plugins";

// ── MarketplaceListing ────────────────────────────────────────────────────────

/**
 * All data required to render a public plugin listing page.
 *
 * Усі дані для рендерингу публічної сторінки плагіну.
 */
export interface MarketplaceListing {
  /** Plugin manifest ID */
  pluginId: string;
  /** URL-safe slug, e.g. "acme-my-layer" */
  slug: string;
  /** Canonical listing URL */
  canonicalUrl: string;
  /** Page title — English */
  title_en: string;
  /** Page title — Ukrainian */
  title_uk: string;
  /** Short description — English (max 160 chars for meta) */
  description_en: string;
  /** Short description — Ukrainian */
  description_uk: string;
  /** Author display name */
  authorName: string;
  /** Icon URL for Open Graph image */
  iconUrl?: string;
  /** Plugin version string */
  version: string;
  /** ISO 8601 publish / last-updated timestamp */
  updatedAt: string;
  /**
   * Schema.org structured data object, ready for injection as JSON-LD.
   * Always SoftwareApplication type.
   *
   * Об'єкт Schema.org для впровадження як JSON-LD на сторінці.
   */
  schemaOrg: Record<string, unknown>;
}

// ── buildListingSlug ──────────────────────────────────────────────────────────

/**
 * Build a URL-safe slug from a plugin name and author.
 * e.g. ("My Layer", "ACME Corp") → "my-layer-acme-corp"
 *
 * Формує URL-безпечний slug із назви плагіну та автора.
 */
export function buildListingSlug(name: string, author: string): string {
  const sanitise = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  return `${sanitise(name)}-${sanitise(author)}`;
}

// ── buildListingSchemaOrg ─────────────────────────────────────────────────────

/**
 * Build a Schema.org SoftwareApplication object for a plugin manifest.
 * Intended for injection as a JSON-LD <script> tag on the listing page.
 *
 * SEO note: each plugin listing page gets its own Schema.org JSON-LD block,
 * canonical URL, and Open Graph tags — treated as an independent SEO surface.
 *
 * SEO-примітка: кожна сторінка плагіну — незалежна SEO-поверхня з власним
 * JSON-LD, canonical URL та Open Graph.
 */
export function buildListingSchemaOrg(plugin: PluginManifest): Record<string, unknown> {
  const slug = buildListingSlug(plugin.name, plugin.author.name);
  const url = `${MARKETPLACE_BASE_URL}/${slug}`;

  return {
    "@context": "https://schema.org",
    "@type": LISTING_SCHEMA_ORG_TYPE,
    name: plugin.name,
    description: plugin.description,
    url,
    softwareVersion: plugin.version,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/OnlineOnly",
    },
    author: {
      "@type": "Person",
      name: plugin.author.name,
      email: plugin.author.email,
      url: plugin.author.url,
    },
    ...(plugin.homepageUrl && { sameAs: plugin.homepageUrl }),
    ...(plugin.iconUrl && { image: plugin.iconUrl }),
  };
}

// ── buildMarketplaceListing ───────────────────────────────────────────────────

/**
 * Assemble a full MarketplaceListing from a plugin manifest.
 * Caller supplies Ukrainian title/description and timestamps.
 *
 * Формує повний об'єкт MarketplaceListing із маніфесту плагіну.
 */
export function buildMarketplaceListing(
  plugin: PluginManifest,
  opts: {
    title_uk: string;
    description_uk: string;
    updatedAt: string;
  },
): MarketplaceListing {
  const slug = buildListingSlug(plugin.name, plugin.author.name);
  const canonicalUrl = `${MARKETPLACE_BASE_URL}/${slug}`;

  return {
    pluginId: plugin.id,
    slug,
    canonicalUrl,
    title_en: plugin.name,
    title_uk: opts.title_uk,
    description_en: plugin.description.slice(0, 160),
    description_uk: opts.description_uk.slice(0, 160),
    authorName: plugin.author.name,
    iconUrl: plugin.iconUrl,
    version: plugin.version,
    updatedAt: opts.updatedAt,
    schemaOrg: buildListingSchemaOrg(plugin),
  };
}
