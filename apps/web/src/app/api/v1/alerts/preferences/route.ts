/**
 * GET  /api/v1/alerts/preferences — return current user's channel preferences
 * POST /api/v1/alerts/preferences — update user channel preferences
 *
 * GET  /api/v1/alerts/preferences — повернути налаштування каналів поточного користувача
 * POST /api/v1/alerts/preferences — оновити налаштування каналів користувача
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  preferencesStore,
  DEFAULT_PREFERENCES,
  filterChannelsByPreferences,
} from "@/../../services/alerts/src/preferences";
import type { UserChannelPreferences, ChannelPreference } from "@/../../services/alerts/src/preferences";

export const dynamic = "force-dynamic";

// ── GET ───────────────────────────────────────────────────────────────────────

export function GET(req: NextRequest): NextResponse {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      {
        schema: {
          preferences: DEFAULT_PREFERENCES,
          quietHoursOverride: null,
          updatedAt: new Date().toISOString(),
        },
        note_en: "Pass ?userId=<id> to retrieve stored preferences for a specific user.",
        note_uk: "Передайте ?userId=<id> для отримання збережених налаштувань конкретного користувача.",
      },
      { status: 200 },
    );
  }

  const prefs = preferencesStore.get(userId);
  return NextResponse.json(prefs, { status: 200 });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate required fields
  if (
    !body ||
    typeof body !== "object" ||
    !("userId" in body) ||
    typeof (body as Record<string, unknown>).userId !== "string"
  ) {
    return NextResponse.json(
      { error: "Body must include userId (string)" },
      { status: 422 },
    );
  }

  const data = body as Record<string, unknown>;
  const userId = data.userId as string;

  if (
    !Array.isArray(data.preferences) ||
    data.preferences.length === 0
  ) {
    return NextResponse.json(
      { error: "Body must include preferences[] (non-empty array)" },
      { status: 422 },
    );
  }

  // Basic shape check on each preference entry
  const rawPrefs = data.preferences as unknown[];
  for (const p of rawPrefs) {
    if (
      !p ||
      typeof p !== "object" ||
      !("channel" in (p as object)) ||
      !("enabled" in (p as object)) ||
      !("minPriority" in (p as object))
    ) {
      return NextResponse.json(
        { error: "Each preference must have: channel, enabled, minPriority" },
        { status: 422 },
      );
    }
  }

  const updated: UserChannelPreferences = {
    userId,
    preferences: data.preferences as ChannelPreference[],
    quietHoursOverride:
      typeof data.quietHoursOverride === "string"
        ? data.quietHoursOverride
        : undefined,
    updatedAt: new Date().toISOString(),
  };

  preferencesStore.set(updated);

  return NextResponse.json(
    {
      ok: true,
      preferences: updated,
      note_en: "Preferences saved. Active channels are filtered at rule-evaluation time.",
      note_uk: "Налаштування збережено. Активні канали фільтруються під час оцінки правил.",
    },
    { status: 200 },
  );
}
