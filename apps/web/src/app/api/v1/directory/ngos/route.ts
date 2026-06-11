/**
 * GET /api/v1/directory/ngos
 *
 * Returns NGO focus configuration and seed profile list.
 * Query parameters:
 *   ?focus=<NgoFocus>   — filter by focus area
 *   ?region=<NgoRegion> — filter by region
 *   ?verified=true      — return only verified NGOs
 *
 * Повертає конфігурацію напрямків НГО та список seed-профілів.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  NGO_PROFILES,
  type NgoFocus,
  type NgoRegion,
} from "../../../../../lib/directory/ngos";

export const dynamic = "force-dynamic";

const VALID_FOCUS: NgoFocus[] = [
  "humanitarian-aid",
  "human-rights",
  "conflict-monitoring",
  "disinformation-research",
  "open-source-investigation",
  "digital-rights",
  "refugee-assistance",
  "reconstruction",
  "war-crimes-documentation",
];

const VALID_REGIONS: NgoRegion[] = [
  "ukraine",
  "eastern-europe",
  "middle-east",
  "africa",
  "global",
  "transatlantic",
];

export function GET(req: NextRequest): NextResponse {
  const url = new URL(req.url);
  const focusParam = url.searchParams.get("focus") as NgoFocus | null;
  const regionParam = url.searchParams.get("region") as NgoRegion | null;
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

  if (regionParam && !VALID_REGIONS.includes(regionParam)) {
    return NextResponse.json(
      {
        error: "invalid_param",
        message: `region must be one of: ${VALID_REGIONS.join(", ")}`,
      },
      { status: 400 },
    );
  }

  let data = NGO_PROFILES;

  if (focusParam) {
    data = data.filter((n) => n.focus.includes(focusParam));
  }

  if (regionParam) {
    data = data.filter((n) => n.region.includes(regionParam));
  }

  if (verifiedParam === "true") {
    data = data.filter((n) => n.verified);
  }

  return NextResponse.json(
    {
      object: "list",
      count: data.length,
      filters: {
        focus: focusParam ?? null,
        region: regionParam ?? null,
        verified: verifiedParam === "true" ? true : null,
      },
      validFocus: VALID_FOCUS,
      validRegions: VALID_REGIONS,
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
