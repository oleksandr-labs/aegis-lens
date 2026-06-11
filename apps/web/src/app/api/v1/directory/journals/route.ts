/**
 * GET /api/v1/directory/journals
 *
 * Returns journal focus configuration and seed profile list.
 * Query parameters:
 *   ?focus=<JournalFocus>     — filter by focus area
 *   ?access=<JournalAccess>   — filter by access model
 *   ?verified=true            — return only verified journals
 *
 * Повертає конфігурацію напрямків журналів та список seed-профілів.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  JOURNAL_PROFILES,
  type JournalFocus,
  type JournalAccess,
} from "../../../../../lib/directory/journals";

export const dynamic = "force-dynamic";

const VALID_FOCUS: JournalFocus[] = [
  "security-studies",
  "intelligence",
  "conflict-resolution",
  "cyber",
  "osint",
  "human-rights",
  "international-relations",
  "disinformation",
  "satellite-remote-sensing",
];

const VALID_ACCESS: JournalAccess[] = [
  "open-access",
  "subscription",
  "hybrid",
  "institutional-only",
];

export function GET(req: NextRequest): NextResponse {
  const url = new URL(req.url);
  const focusParam = url.searchParams.get("focus") as JournalFocus | null;
  const accessParam = url.searchParams.get("access") as JournalAccess | null;
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

  if (accessParam && !VALID_ACCESS.includes(accessParam)) {
    return NextResponse.json(
      {
        error: "invalid_param",
        message: `access must be one of: ${VALID_ACCESS.join(", ")}`,
      },
      { status: 400 },
    );
  }

  let data = JOURNAL_PROFILES;

  if (focusParam) {
    data = data.filter((j) => j.focus.includes(focusParam));
  }

  if (accessParam) {
    data = data.filter((j) => j.access === accessParam);
  }

  if (verifiedParam === "true") {
    data = data.filter((j) => j.verified);
  }

  return NextResponse.json(
    {
      object: "list",
      count: data.length,
      filters: {
        focus: focusParam ?? null,
        access: accessParam ?? null,
        verified: verifiedParam === "true" ? true : null,
      },
      validFocus: VALID_FOCUS,
      validAccess: VALID_ACCESS,
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
