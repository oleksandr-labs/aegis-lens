/**
 * GET /api/v1 — API v1 root with version info and link header
 *
 * This is the versioned API entry point. All /api/v1/* routes are aliases
 * of the main /api/* routes (via rewrite in middleware or Next.js routing).
 *
 * Versioning policy:
 *   - v1: current stable version
 *   - Breaking changes require a new major version (v2+)
 *   - Additive changes are non-breaking and go into the current version
 *   - Deprecation notice period: 12 months minimum
 *
 * See: TODO/api/TODO_versioning.md
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(): NextResponse {
  return NextResponse.json(
    {
      version: "v1",
      status: "stable",
      deprecatedAt: null,
      sunsetAt: null,
      endpoints: {
        events:       "/api/v1/events",
        eventById:    "/api/v1/events/:id",
        search:       "/api/v1/search",
        layers:       "/api/v1/layers",
        regions:      "/api/v1/regions",
        sources:      "/api/v1/sources",
        alerts:       "/api/v1/alerts",
        aois:         "/api/v1/aois",
        cases:        "/api/v1/cases",
        webhooks:     "/api/v1/webhooks",
        travelRisk:   "/api/v1/travel-risk",
        review:       "/api/v1/review",
        copilot:      "/api/v1/copilot",
        health:       "/api/v1/health",
        openapi:      "/api/openapi.json",
      },
      rateLimit: {
        default: "60 req/min per IP",
        search:  "60 req/min per IP",
        copilot: "10 req/min per IP",
        export:  "10 req/min per IP",
      },
      auth: {
        bearerToken: "Authorization: Bearer <api_key>",
        docs: "https://docs.aegislens.com/api/authentication",
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
        "Deprecation": "false",
      },
    },
  );
}
