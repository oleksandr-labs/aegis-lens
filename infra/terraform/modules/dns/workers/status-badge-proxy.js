/**
 * Cloudflare Worker — Status Badge Proxy
 *
 * Proxies GitHub Actions CI badge SVGs and Uptime-Kuma status badges through
 * the Cloudflare edge, adding:
 *   - Short CDN cache (60 s) to avoid badge services being rate-limited
 *   - CORS headers so <img> can be embedded cross-origin
 *   - Content-Security-Policy headers stripped (badges need no CSP)
 *   - A unified /status/badge/* namespace for all badge sources
 *
 * Route: status.aegislens.com/badge/*
 *
 * URL format:
 *   /badge/gh/<owner>/<repo>/<workflow-name>/<branch>
 *       → https://github.com/<owner>/<repo>/actions/workflows/<workflow>.yml/badge.svg?branch=<branch>
 *
 *   /badge/uptime/<monitor-id>
 *       → https://uptime.aegislens.com/api/badge/<monitor-id>/status
 *
 *   /badge/coverage/<owner>/<repo>
 *       → https://codecov.io/gh/<owner>/<repo>/graph/badge.svg
 *
 * Security: only allowlisted upstream origins are fetched.
 */

const ALLOWED_ORIGINS = new Set([
  "github.com",
  "img.shields.io",
  "codecov.io",
  "uptime.aegislens.com",
  "status.aegislens.com",
]);

const BADGE_CACHE_TTL = 60;  // seconds — badges update at most every minute
const SVG_CONTENT_TYPE = "image/svg+xml;charset=utf-8";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname; // e.g. /badge/gh/oleksandr-labs/aegis-lens/ci/main

    if (!path.startsWith("/badge/")) {
      return new Response("Not found", { status: 404 });
    }

    // Only allow GET / HEAD
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Parse badge type
    const parts = path.slice("/badge/".length).split("/");
    const badgeType = parts[0];

    let upstreamUrl;
    try {
      upstreamUrl = buildUpstreamUrl(badgeType, parts.slice(1), url.searchParams);
    } catch (err) {
      return new Response(`Bad request: ${err.message}`, { status: 400 });
    }

    // Security: validate upstream host
    const upstreamHost = new URL(upstreamUrl).hostname;
    if (!ALLOWED_ORIGINS.has(upstreamHost)) {
      return new Response("Forbidden upstream origin", { status: 403 });
    }

    // Cache key: normalize by upstream URL
    const cacheKey = new Request(upstreamUrl, { method: "GET" });
    const cache = caches.default;

    // Try cache first
    const cached = await cache.match(cacheKey);
    if (cached) {
      return addBadgeHeaders(cached, true);
    }

    // Fetch from upstream
    const upstream = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": "AegisLens-StatusProxy/1.0",
        Accept: "image/svg+xml,image/*,*/*",
      },
      cf: {
        cacheTtl: BADGE_CACHE_TTL,
        cacheEverything: true,
      },
    });

    if (!upstream.ok) {
      return new Response(`Upstream error: ${upstream.status}`, {
        status: upstream.status,
      });
    }

    const response = buildBadgeResponse(await upstream.text(), upstream.status);

    // Store in edge cache
    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return addBadgeHeaders(response, false);
  },
};

// ── URL builders ───────────────────────────────────────────────────────────────

function buildUpstreamUrl(type, parts, searchParams) {
  switch (type) {
    case "gh": {
      // parts: [owner, repo, workflow-slug, branch]
      const [owner, repo, workflow, branch = "main"] = parts;
      if (!owner || !repo || !workflow) throw new Error("gh badge: owner/repo/workflow required");
      const workflowFile = workflow.endsWith(".yml") ? workflow : `${workflow}.yml`;
      return `https://github.com/${owner}/${repo}/actions/workflows/${workflowFile}/badge.svg?branch=${branch}`;
    }

    case "uptime": {
      // parts: [monitor-id]
      const [monitorId] = parts;
      if (!monitorId) throw new Error("uptime badge: monitor-id required");
      return `https://uptime.aegislens.com/api/badge/${monitorId}/status`;
    }

    case "coverage": {
      // parts: [owner, repo]
      const [owner, repo] = parts;
      if (!owner || !repo) throw new Error("coverage badge: owner/repo required");
      return `https://codecov.io/gh/${owner}/${repo}/graph/badge.svg`;
    }

    case "shields": {
      // Pass-through shields.io badge: remaining parts reconstructed
      const shieldsPath = parts.join("/");
      const qs = searchParams.toString();
      return `https://img.shields.io/${shieldsPath}${qs ? "?" + qs : ""}`;
    }

    default:
      throw new Error(`Unknown badge type: ${type}`);
  }
}

// ── Response helpers ───────────────────────────────────────────────────────────

function buildBadgeResponse(svgBody, status) {
  return new Response(svgBody, {
    status,
    headers: {
      "Content-Type": SVG_CONTENT_TYPE,
      "Cache-Control": `public, max-age=${BADGE_CACHE_TTL}, stale-while-revalidate=30`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function addBadgeHeaders(response, fromCache) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("X-Badge-Cache", fromCache ? "HIT" : "MISS");
  return new Response(response.body, { status: response.status, headers });
}
