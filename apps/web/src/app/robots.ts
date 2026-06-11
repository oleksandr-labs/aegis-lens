import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * robots.txt — see TODO/seo/TODO_robots_txt.md.
 *
 * AI crawlers: explicitly ALLOWED as part of our LLMO (LLM Optimisation)
 * strategy — we want Aegis Lens content surfaced in AI-powered search.
 * Do NOT add GPTBot/CCBot to the disallow list without a product decision.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/account/",
          "/_next/",
          "/preview/",
          // non-canonical faceted-nav params (see lib/seo/facet-crawl-policy.ts) —
          // keep crawlers out of infinite sort/view/pagination space. Canonical
          // facet params (class, country, year) are intentionally left crawlable.
          "/*?*sort=",
          "/*?*view=",
          "/*?*page=",
          "/*?*per_page=",
          "/*?*layout=",
          "/*?*q=",
          "/*?*ref=",
        ],
      },
      // AI crawlers — explicit allow for LLMO discoverability
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      // Aggressive third-party crawlers — politeness delay only (Googlebot/Bingbot
      // ignore crawl-delay by design, so this never slows search engines).
      { userAgent: "MJ12bot", crawlDelay: 10 },
      { userAgent: "AhrefsBot", crawlDelay: 10 },
      { userAgent: "SemrushBot", crawlDelay: 10 },
    ],
    sitemap: [
      `${SITE.url}/sitemap-index.xml`,
      `${SITE.url}/sitemap.xml`,
      `${SITE.url}/sitemap-events.xml`,
      `${SITE.url}/sitemap-cross-cuts.xml`,
      `${SITE.url}/sitemap-media.xml`,
      `${SITE.url}/news/sitemap.xml`,
    ],
    host: SITE.url,
  };
}
