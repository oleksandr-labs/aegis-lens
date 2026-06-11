/**
 * POST /api/v1/risk/entity
 *
 * Returns sanctions screening and conflict-exposure risk score for a named entity.
 * Targets KYC, AML, and counterparty due-diligence use cases.
 *
 * Request body (JSON):
 *   {
 *     entityId:   string,                              // required
 *     entityType: "org" | "vessel" | "aircraft" | "person"  // required
 *   }
 *
 * Response:
 *   200  { data: RiskScoreResponse + entity metadata }
 *   400  Missing / invalid params
 *   429  Rate limited
 *
 * NOTE: This endpoint does NOT store queried entity IDs (see TOS § 4.3).
 *
 * УВАГА: цей ендпоінт не зберігає ідентифікатори запитуваних сутностей.
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import {
  riskScoreLabel,
  RISK_SCORE_DISCLAIMER_EN,
  type RiskScoreResponse,
} from "@/lib/risk/risk-score-api";

export const dynamic = "force-dynamic";

const VALID_ENTITY_TYPES = ["org", "vessel", "aircraft", "person"] as const;
type EntityType = (typeof VALID_ENTITY_TYPES)[number];

/**
 * Very minimal stub sanctions list — replace with real OFAC / EU / UN feed.
 * Мінімальний stub списку санкцій — замінити реальним фідом.
 */
const STUB_SANCTIONED_PATTERNS: string[] = [
  "SANCTIONED",
  "OFAC",
  "SDN",
];

function stubSanctionsCheck(entityId: string): {
  isSanctioned: boolean;
  listNames: string[];
} {
  const upper = entityId.toUpperCase();
  const matchedLists = STUB_SANCTIONED_PATTERNS.filter((p) =>
    upper.includes(p),
  );
  return {
    isSanctioned: matchedLists.length > 0,
    listNames: matchedLists.length > 0 ? ["OFAC SDN (stub)"] : [],
  };
}

function stubEntityRiskScore(
  entityType: EntityType,
  isSanctioned: boolean,
): number {
  if (isSanctioned) return 95;
  switch (entityType) {
    case "vessel":
      return 30 + Math.round(Math.random() * 20);
    case "aircraft":
      return 20 + Math.round(Math.random() * 20);
    case "person":
      return 15 + Math.round(Math.random() * 15);
    case "org":
    default:
      return 10 + Math.round(Math.random() * 25);
  }
}

export async function POST(req: Request) {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ipKey = `risk-entity:${identifyRequest(req)}`;
  const rl = rateLimit(ipKey, 100, 24 * 60 * 60 * 1_000);

  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message:
          "Rate limit exceeded. Upgrade to a paid Risk API tier for higher limits.",
        upgradeUrl: "https://aegislens.com/pricing/risk-api",
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(rl),
          "Retry-After": String(rl.resetSeconds),
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const { entityId, entityType } =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  // ── Validate ───────────────────────────────────────────────────────────────
  if (typeof entityId !== "string" || entityId.trim().length === 0) {
    return NextResponse.json(
      {
        error: "invalid_params",
        message: "entityId (non-empty string) is required.",
        example: { entityId: "COMPANY-001", entityType: "org" },
      },
      { status: 400 },
    );
  }

  if (
    typeof entityType !== "string" ||
    !VALID_ENTITY_TYPES.includes(entityType as EntityType)
  ) {
    return NextResponse.json(
      {
        error: "invalid_params",
        message: `entityType must be one of: ${VALID_ENTITY_TYPES.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  const safeEntityType = entityType as EntityType;

  // ── Sanctions check + risk score ───────────────────────────────────────────
  const sanctions = stubSanctionsCheck(entityId.trim());
  const score = stubEntityRiskScore(safeEntityType, sanctions.isSanctioned);

  const result: RiskScoreResponse = {
    score,
    confidence: 0.5, // stub — replace with real model
    contributingLayers: [
      "sanctions-screening",
      "conflict-exposure",
      "ownership-network",
    ],
    sanctions,
    disclaimer: RISK_SCORE_DISCLAIMER_EN,
  };

  return NextResponse.json(
    {
      data: {
        ...result,
        label: riskScoreLabel(score),
        entityType: safeEntityType,
        isProduction: false,
        disclaimer: RISK_SCORE_DISCLAIMER_EN,
      },
      meta: {
        endpoint: "risk/entity",
        requestedAt: new Date().toISOString(),
        // NOTE: entityId is NOT echoed back or stored — privacy by design
        rateLimit: {
          remaining: rl.remaining,
          resetSeconds: rl.resetSeconds,
        },
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
