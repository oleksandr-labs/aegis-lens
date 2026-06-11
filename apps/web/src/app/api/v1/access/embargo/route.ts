/**
 * GET /api/v1/access/embargo
 *
 * Returns the full list of embargo window configurations and
 * early-access programmes offered by Aegis Lens.
 *
 * Response:
 *   200  {
 *          object: "list",
 *          embargo_configs: { count: number, data: EmbargoConfig[] },
 *          early_access_programs: { count: number, data: EarlyAccessProgram[] }
 *        }
 *
 * Повертає конфігурації вікон ембарго та програми раннього доступу Aegis Lens.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  EMBARGO_CONFIGS,
  EARLY_ACCESS_PROGRAMS,
} from "../../../../../lib/access/embargo";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      embargo_configs: {
        count: EMBARGO_CONFIGS.length,
        data: EMBARGO_CONFIGS,
      },
      early_access_programs: {
        count: EARLY_ACCESS_PROGRAMS.length,
        data: EARLY_ACCESS_PROGRAMS,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    },
  );
}

export function OPTIONS(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
