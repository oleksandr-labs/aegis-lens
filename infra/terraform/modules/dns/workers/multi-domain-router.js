/**
 * Cloudflare Worker — Multi-Domain / White-Label Custom Domain Handler
 *
 * Allows enterprise customers to serve Aegis Lens on their own custom domain
 * (e.g. osint.client.com) while proxying to the main app origin.
 *
 * Flow:
 *   1. Request arrives on custom domain (e.g. osint.acme.com)
 *   2. Worker looks up the domain in the KV store (DOMAIN_MAP)
 *   3. Finds the orgId + subdomain config
 *   4. Rewrites the request to app.aegislens.com with X-Org-Id header
 *   5. Strips Aegis branding headers in the response
 *   6. Injects white-label headers (canonical URL, robots)
 *
 * KV key format: "domain:<hostname>"
 * KV value (JSON):
 *   {
 *     "orgId": "acme-corp",
 *     "plan": "enterprise",
 *     "canonicalOrigin": "app.aegislens.com",
 *     "allowIndexing": false,
 *     "customLogoUrl": "https://cdn.acme.com/logo.svg"  // optional
 *   }
 *
 * KV namespace binding: DOMAIN_MAP (set in wrangler.toml)
 *
 * Security:
 *   - Only pre-registered domains (in KV) are proxied
 *   - Requests to unregistered domains → 404
 *   - X-Org-Id is set by worker, not client (client cannot forge it)
 *   - Cloudflare Access can be layered on the custom domain for auth
 */

const APP_ORIGIN = "https://app.aegislens.com";
const KV_CACHE_TTL = 300; // 5 min — KV lookups are cached in edge memory

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Skip if this is the native aegislens.com domain (not a white-label)
    if (hostname.endsWith(".aegislens.com") || hostname === "aegislens.com") {
      return fetch(request);
    }

    // Look up custom domain config from KV
    const domainConfig = await lookupDomainConfig(env, hostname);

    if (!domainConfig) {
      return new Response(
        "This domain is not configured. Please contact support@aegislens.com.",
        { status: 404, headers: { "Content-Type": "text/plain" } }
      );
    }

    // Validate plan
    if (domainConfig.plan !== "enterprise" && domainConfig.plan !== "business") {
      return new Response("Custom domains require an Enterprise plan.", {
        status: 402,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Build proxied request to app origin
    const targetUrl = new URL(url.pathname + url.search, domainConfig.canonicalOrigin ?? APP_ORIGIN);

    const proxiedRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: buildProxiedHeaders(request.headers, hostname, domainConfig),
      body: request.body,
      redirect: "manual",
    });

    const response = await fetch(proxiedRequest);

    // Handle redirects — rewrite Location header to custom domain
    if (response.status >= 301 && response.status <= 308) {
      const location = response.headers.get("Location");
      if (location) {
        const rewritten = rewriteLocationHeader(location, hostname, APP_ORIGIN);
        const headers = new Headers(response.headers);
        headers.set("Location", rewritten);
        return new Response(response.body, { status: response.status, headers });
      }
    }

    return buildWhiteLabelResponse(response, hostname, domainConfig);
  },
};

// ── KV lookup ──────────────────────────────────────────────────────────────────

async function lookupDomainConfig(env, hostname) {
  if (!env.DOMAIN_MAP) {
    // KV not bound (dev environment) — allow all with a stub config
    console.warn("DOMAIN_MAP KV binding not found; using stub config");
    return null;
  }

  try {
    const raw = await env.DOMAIN_MAP.get(`domain:${hostname}`, {
      cacheTtl: KV_CACHE_TTL,
      type: "json",
    });
    return raw;
  } catch {
    console.error(`KV lookup failed for domain: ${hostname}`);
    return null;
  }
}

// ── Request transformation ────────────────────────────────────────────────────

function buildProxiedHeaders(originalHeaders, customHostname, config) {
  const headers = new Headers(originalHeaders);

  // Tell the app which org this request is for
  headers.set("X-Org-Id", config.orgId);
  headers.set("X-White-Label-Domain", customHostname);
  headers.set("X-Forwarded-Host", customHostname);

  // Override Host header to match app origin
  headers.set("Host", new URL(APP_ORIGIN).hostname);

  // Remove any client-supplied org spoofing headers
  headers.delete("X-Internal-Org-Override");

  return headers;
}

// ── Response transformation ───────────────────────────────────────────────────

function buildWhiteLabelResponse(response, hostname, config) {
  const headers = new Headers(response.headers);

  // Canonical URL points to the custom domain
  headers.set("Link", `<https://${hostname}>; rel="canonical"`);

  // Respect the org's indexing preference
  if (!config.allowIndexing) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // Remove any Aegis-specific branding headers the app might set
  headers.delete("X-Powered-By-Aegis");

  // HSTS for custom domains (requires Cloudflare to manage the TLS cert)
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");

  // Security
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Identify that this response was served via white-label proxy
  headers.set("X-WL-Domain", hostname);
  headers.set("X-WL-Org", config.orgId);

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

// ── Redirect rewrite ──────────────────────────────────────────────────────────

function rewriteLocationHeader(location, customHostname, appOrigin) {
  try {
    const loc = new URL(location, appOrigin);
    if (loc.origin === appOrigin || loc.hostname.endsWith(".aegislens.com")) {
      // Rewrite aegislens.com → custom domain
      loc.hostname = customHostname;
      loc.protocol = "https:";
      return loc.toString();
    }
    return location; // External redirect — do not rewrite
  } catch {
    return location;
  }
}
