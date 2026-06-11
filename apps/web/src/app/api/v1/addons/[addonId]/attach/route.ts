/**
 * POST /api/v1/addons/[addonId]/attach
 *
 * Attaches the specified add-on to the authenticated user's subscription.
 *
 * Requires:
 *   - Authenticated user (userId resolved from request headers / session)
 *   - User's current tier must meet or exceed the add-on's minTierId
 *
 * Returns:
 *   { attachment, attachedAddOns }
 *     attachment   — the newly created (or existing) AddOnAttachment
 *     attachedAddOns — full list of user's active add-on attachments after the operation
 *
 * Errors:
 *   401 — unauthenticated
 *   404 — add-on not found
 *   422 — tier insufficient
 *
 * POST /api/v1/addons/[addonId]/attach — підключення надбудови до підписки.
 */

import { NextRequest, NextResponse } from "next/server";
import { addonGateStore } from "../../../../../lib/monetization/addon-gates";
import { getAddOnById } from "../../../../../lib/monetization/addons";
import type { AddOnId } from "../../../../../lib/monetization/types";

export const dynamic = "force-dynamic";

// ── Tier ordering (mirrors TIER_ORDER in addons.ts) ───────────────────────────

const TIER_ORDER: string[] = [
  "free",
  "observer",
  "pro",
  "pro-plus",
  "team",
  "business",
  "enterprise",
  "gov-defense",
  "ngo-journalist",
  "academic",
];

function tierIndex(tierId: string): number {
  // Mission tiers treated as 'pro' equivalent for add-on eligibility
  const effective =
    tierId === "ngo-journalist" || tierId === "academic" ? "pro" : tierId;
  return TIER_ORDER.indexOf(effective);
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: { addonId: string } }
): Promise<NextResponse> {
  // ── Resolve authenticated user ──────────────────────────────────────────────
  // In production: resolve from session cookie / JWT / API key.
  // Dev stand-in: read X-User-Id and X-User-Tier headers.
  const userId = req.headers.get("x-user-id");
  const userTierId = req.headers.get("x-user-tier") ?? "free";

  if (!userId) {
    return NextResponse.json(
      {
        error: "Unauthenticated. Provide a valid session or API key.",
        error_uk: "Неавторизований запит. Надайте дійсну сесію або API-ключ.",
      },
      { status: 401 }
    );
  }

  // ── Validate add-on ID ──────────────────────────────────────────────────────
  const addonId = params.addonId as AddOnId;
  const addon = getAddOnById(addonId);

  if (!addon) {
    return NextResponse.json(
      {
        error: `Add-on "${addonId}" not found.`,
        error_uk: `Надбудову "${addonId}" не знайдено.`,
      },
      { status: 404 }
    );
  }

  // ── Check tier eligibility ──────────────────────────────────────────────────
  const userTierIdx = tierIndex(userTierId);
  const minTierIdx = tierIndex(addon.minTierId);

  if (userTierIdx === -1 || userTierIdx < minTierIdx) {
    return NextResponse.json(
      {
        error: `Your current tier ("${userTierId}") does not meet the minimum requirement for this add-on. Required: "${addon.minTierId}" or above.`,
        error_uk: `Ваш поточний тариф ("${userTierId}") не відповідає мінімальним вимогам для цієї надбудови. Потрібно: "${addon.minTierId}" або вище.`,
        requiredTierId: addon.minTierId,
        upgradeUrl: `/pricing?highlight=${addon.minTierId}`,
      },
      { status: 422 }
    );
  }

  // ── Attach add-on ───────────────────────────────────────────────────────────
  const attachment = addonGateStore.attach(userId, addonId);
  const attachedAddOns = addonGateStore.listAttached(userId);

  return NextResponse.json(
    {
      attachment,
      attachedAddOns,
      message_en: `Add-on "${addon.name_en}" attached successfully.`,
      message_uk: `Надбудову "${addon.name_uk}" успішно підключено.`,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Aegis-API-Version": "v1",
      },
    }
  );
}
