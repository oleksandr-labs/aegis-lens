/**
 * GET  /api/v1/marketplace/items  — list approved marketplace items.
 * POST /api/v1/marketplace/items  — create a new item draft (stub).
 *
 * GET returns all items with status "approved".
 * In-memory stub — replace data source with DB query in production.
 *
 * POST accepts a JSON body and returns { ok: true, status: "pending-review" }.
 * Full validation and creator-KYC check are delegated to the service layer.
 *
 * Публічний ендпоінт маркетплейсу: список схвалених позицій та створення чернетки.
 */

import { NextRequest, NextResponse } from "next/server";
import type { MarketplaceItem } from "../../../../../lib/marketplace/types";

export const dynamic = "force-dynamic";

// ── In-memory stub data store ─────────────────────────────────────────────────

/**
 * Seed data for the marketplace.
 * Replace with a real database query in production.
 *
 * Тестові дані маркетплейсу (замінити на запит до БД у продакшені).
 */
const _items: MarketplaceItem[] = [];

// ── GET ───────────────────────────────────────────────────────────────────────

/**
 * Return all approved marketplace items.
 *
 * Response shape:
 *   { object: "list", count: number, data: MarketplaceItem[] }
 *
 * Повертає всі схвалені позиції маркетплейсу.
 */
export function GET(_req: NextRequest): NextResponse {
  const approved = _items.filter((item) => item.status === "approved");

  return NextResponse.json(
    {
      object: "list",
      count: approved.length,
      data: approved,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    }
  );
}

// ── POST ──────────────────────────────────────────────────────────────────────

/**
 * Create a new marketplace item draft.
 *
 * Stub implementation — returns { ok: true, status: "pending-review" }.
 * In production: validate body, check creator KYC, persist to DB.
 *
 * Заглушка для створення нової чернетки позиції маркетплейсу.
 */
export async function POST(_req: NextRequest): Promise<NextResponse> {
  // TODO: validate body schema, run creator KYC check, persist draft to DB.
  return NextResponse.json(
    { ok: true, status: "pending-review" },
    {
      status: 201,
      headers: {
        "Aegis-API-Version": "v1",
      },
    }
  );
}
