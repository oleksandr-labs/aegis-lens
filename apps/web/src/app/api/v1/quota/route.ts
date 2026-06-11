import "server-only";

import { NextResponse } from "next/server";
import { buildQuotaDashboard, getQuotaWarnings } from "@/lib/quota-dashboard";
import { extractTier, identifyRequest } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/quota
 *
 * Returns the quota dashboard for the authenticated organisation.
 * Requires a valid API key in the Authorization header.
 *
 * Response:
 *   200 — QuotaDashboard + warnings array
 *   401 — missing or anonymous API key
 */
export async function GET(req: Request): Promise<Response> {
  const tier = extractTier(req);

  if (tier === "anonymous") {
    return NextResponse.json(
      { ok: false, error: "Authentication required. Provide a valid API key.", errorUk: "Потрібна автентифікація. Надайте дійсний ключ API." },
      { status: 401 },
    );
  }

  // Derive a stable orgId from the API key (prefix before second '_')
  const auth = req.headers.get("authorization") ?? req.headers.get("x-api-key") ?? "";
  const key = auth.replace(/^Bearer\s+/i, "").trim();
  // Fall back to IP-based identifier for anonymous quota tracking
  const orgId = key || identifyRequest(req);

  // Map internal tier names to dashboard tier labels
  const dashTier =
    tier === "enterprise" ? "enterprise"
    : tier === "pro" ? "pro"
    : tier === "internal" ? "enterprise"
    : "free";

  const dashboard = buildQuotaDashboard(orgId, dashTier);
  const warnings = getQuotaWarnings(dashboard);

  return NextResponse.json(
    { ok: true, data: dashboard, warnings },
    {
      status: 200,
      headers: {
        "Aegis-API-Version": "v1",
        "Cache-Control": "no-store",
      },
    },
  );
}
