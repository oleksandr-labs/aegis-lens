/**
 * Barrel for the Sprint 2.61 "Crawl Optimization & Indexing + robots.txt"
 * cluster modules. Import sites use `@/lib/seo` for these crawl/indexing helpers.
 *
 * Note: `news-sitemap` is re-exported under a namespace because a sibling
 * module (`news-sitemap-xml.ts`, a different cluster) also exports a
 * `NewsSitemapOptions` type — namespacing avoids the name collision.
 */
export * from "./crawl-budget";
export * from "./crawl-surface";
export * from "./pagination";
export * from "./facet-crawl-policy";
export * from "./sitemap-segments";
export * from "./sitemap-ping";
export * from "./indexnow";
export * from "./search-console";
export * from "./robots-locale-policy";

export * as newsSitemap from "./news-sitemap";
