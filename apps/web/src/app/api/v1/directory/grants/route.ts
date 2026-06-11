/**
 * GET /api/v1/directory/grants
 *
 * Returns grant focus configuration and seed profile list.
 * Query parameters:
 *   ?focus=<GrantFocus>         — filter by focus area
 *   ?funderType=<GrantFunder>   — filter by funder type
 *   ?verified=true              — return only verified grants
 *
 * Повертає конфігурацію напрямків грантів та список seed-профілів.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  GRANT_PROFILES,
  type GrantFocus,
  type GrantFunder,
} from "../../../../../lib/directory/grants-dir";

export const dynamic = "force-dynamic";

const VALID_FOCUS: GrantFocus[] = [
  "journalism",
  "osint-research",
  "disinformation-counter",
  "conflict-documentation",
  "digital-rights",
  "humanitarian",
  "security-research",
  "academic",
];

const VALID_FUNDER_TYPES: GrantFunder[] = [
  "foundation",
  "government",
  "eu-program",
  "us-government",
  "bilateral",
  "corporate-csr",
  "multilateral-un",
];

export function GET(req: NextRequest): NextResponse {
  const url = new URL(req.url);
  const focusParam = url.searchParams.get("focus") as GrantFocus | null;
  const funderTypeParam = url.searchParams.get("funderType") as GrantFunder | null;
  const verifiedParam = url.searchParams.get("verified");

  if (focusParam && !VALID_FOCUS.includes(focusParam)) {
    return NextResponse.json(
      {
        error: "invalid_param",
        message: `focus must be one of: ${VALID_FOCUS.join(", ")}`,
      },
      { status: 400 },
    );
  }

  if (funderTypeParam && !VALID_FUNDER_TYPES.includes(funderTypeParam)) {
    return NextResponse.json(
      {
        error: "invalid_param",
        message: `funderType must be one of: ${VALID_FUNDER_TYPES.join(", ")}`,
      },
      { status: 400 },
    );
  }

  let data = GRANT_PROFILES;

  if (focusParam) {
    data = data.filter((g) => g.focus.includes(focusParam));
  }

  if (funderTypeParam) {
    data = data.filter((g) => g.funderType === funderTypeParam);
  }

  if (verifiedParam === "true") {
    data = data.filter((g) => g.verified);
  }

  return NextResponse.json(
    {
      object: "list",
      count: data.length,
      filters: {
        focus: focusParam ?? null,
        funderType: funderTypeParam ?? null,
        verified: verifiedParam === "true" ? true : null,
      },
      validFocus: VALID_FOCUS,
      validFunderTypes: VALID_FUNDER_TYPES,
      data,
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
