/**
 * GET /api/v1/directory/companies
 *
 * Returns the companies directory index: filter facets and all policy notes.
 * Full paginated company list is served by a separate database-backed endpoint (Sprint 2.7+).
 *
 * Публічний ендпоінт директорії компаній — фасети фільтрів і нотатки.
 * Повний список компаній обслуговується окремим ендпоінтом із базою даних (Sprint 2.7+).
 */

import { NextRequest, NextResponse } from "next/server";
import {
  COMPANY_FILTER_FACETS,
  COMPANY_PROGRAMMATIC_ROUTES_EN,
  COMPANY_PROGRAMMATIC_ROUTES_UK,
  COMPANY_SCHEMA_NOTE_EN,
  COMPANY_SCHEMA_NOTE_UK,
  COMPANY_LEAD_GEN_NOTE_EN,
  COMPANY_LEAD_GEN_NOTE_UK,
  COMPANY_ANTI_IMPERSONATION_NOTE_EN,
  COMPANY_ANTI_IMPERSONATION_NOTE_UK,
  COMPANY_EXPORT_NOTE_EN,
  COMPANY_EXPORT_NOTE_UK,
  COMPANY_SEED_NOTE_EN,
  COMPANY_SEED_NOTE_UK,
  COMPANY_INTEL_INTEGRATION_NOTE_EN,
  COMPANY_INTEL_INTEGRATION_NOTE_UK,
} from "../../../../../lib/directory/companies";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "directory.companies.index",
      filter_facets: COMPANY_FILTER_FACETS,
      notes: {
        programmatic_routes_en: COMPANY_PROGRAMMATIC_ROUTES_EN,
        programmatic_routes_uk: COMPANY_PROGRAMMATIC_ROUTES_UK,
        schema_en: COMPANY_SCHEMA_NOTE_EN,
        schema_uk: COMPANY_SCHEMA_NOTE_UK,
        lead_gen_en: COMPANY_LEAD_GEN_NOTE_EN,
        lead_gen_uk: COMPANY_LEAD_GEN_NOTE_UK,
        anti_impersonation_en: COMPANY_ANTI_IMPERSONATION_NOTE_EN,
        anti_impersonation_uk: COMPANY_ANTI_IMPERSONATION_NOTE_UK,
        export_en: COMPANY_EXPORT_NOTE_EN,
        export_uk: COMPANY_EXPORT_NOTE_UK,
        seed_en: COMPANY_SEED_NOTE_EN,
        seed_uk: COMPANY_SEED_NOTE_UK,
        intel_integration_en: COMPANY_INTEL_INTEGRATION_NOTE_EN,
        intel_integration_uk: COMPANY_INTEL_INTEGRATION_NOTE_UK,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    },
  );
}
