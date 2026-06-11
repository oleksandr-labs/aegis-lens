/**
 * GET /api/v1/compliance/addons
 *
 * Returns the canonical compliance and trust add-on registry as a JSON list.
 *
 * Query params:
 *   ?tier=<tierId>  — filter to add-ons available/purchasable at this tier
 *   ?type=<type>    — filter by ComplianceAddonType
 *
 * Public endpoint — no authentication required.
 * Cache: 5 minutes (compliance catalogue changes rarely; invalidate on deploy).
 *
 * Публічний ендпоінт реєстру надбудов відповідності та довіри.
 * Підтримує фільтрацію за рівнем та типом надбудови.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  COMPLIANCE_ADDONS,
  getComplianceAddonsForTier,
} from "../../../../../lib/compliance/addons";
import type { ComplianceAddonType } from "../../../../../lib/compliance/addons";

export const dynamic = "force-dynamic";

const VALID_TYPES: ComplianceAddonType[] = [
  "gdpr-dpa",
  "soc2-report",
  "pen-test-results",
  "data-residency",
  "audit-log-export",
  "siem-integration",
  "custom-dpa",
  "hipaa-baa",
  "iso27001-cert",
  "right-to-erasure-api",
];

export function GET(req: NextRequest): NextResponse {
  const url = req.nextUrl;
  const tierParam = url.searchParams.get("tier");
  const typeParam = url.searchParams.get("type");

  let addons = COMPLIANCE_ADDONS;

  if (tierParam) {
    addons = getComplianceAddonsForTier(tierParam);
  }

  if (typeParam) {
    if (!VALID_TYPES.includes(typeParam as ComplianceAddonType)) {
      return NextResponse.json(
        {
          error: `Invalid type "${typeParam}". Must be one of: ${VALID_TYPES.join(", ")}`,
          error_uk: `Невалідний тип "${typeParam}". Допустимі: ${VALID_TYPES.join(", ")}`,
        },
        { status: 422 }
      );
    }
    addons = addons.filter((a) => a.type === typeParam);
  }

  return NextResponse.json(
    { object: "list", count: addons.length, data: addons },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    }
  );
}
