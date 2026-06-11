/**
 * GET  /api/v1/dashboard/layouts  — list saved layouts for a user
 * POST /api/v1/dashboard/layouts  — save or update a dashboard layout
 *
 * GET  /api/v1/dashboard/layouts  — список збережених макетів для користувача
 * POST /api/v1/dashboard/layouts  — зберегти або оновити макет дашборду
 */

import { NextRequest, NextResponse } from "next/server";
import { savedDashboardStore } from "../../../../../lib/dashboard/save";
import type { DashboardLayout } from "../../../../../lib/dashboard/save";

export const dynamic = "force-dynamic";

// ── GET — list layouts for user ───────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  const userId = req.headers.get("x-user-id") ?? req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId required", error_uk: "Необхідний параметр userId" },
      { status: 400 },
    );
  }

  const layouts = savedDashboardStore.list(userId);

  return NextResponse.json(
    {
      userId,
      count: layouts.length,
      layouts,
    },
    { status: 200 },
  );
}

// ── POST — save or update a layout ───────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized", error_uk: "Необхідна автентифікація" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", error_uk: "Невалідне тіло запиту" },
      { status: 400 },
    );
  }

  const {
    layoutId,
    orgId,
    name,
    nameUk,
    widgets,
    isDefault,
  } = body as Partial<DashboardLayout>;

  if (!layoutId || !orgId || !name) {
    return NextResponse.json(
      {
        error: "Required fields: layoutId, orgId, name",
        error_uk: "Обов'язкові поля: layoutId, orgId, name",
      },
      { status: 422 },
    );
  }

  const now = new Date().toISOString();
  const existing = savedDashboardStore.get(layoutId);

  const layout: DashboardLayout = {
    layoutId,
    userId,
    orgId,
    name,
    nameUk: nameUk ?? name,
    widgets: widgets ?? [],
    isDefault: isDefault ?? false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const result = savedDashboardStore.save(layout);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, error_uk: result.error },
      { status: 422 },
    );
  }

  return NextResponse.json(
    {
      layout: savedDashboardStore.get(layoutId),
      message_en: "Dashboard layout saved.",
      message_uk: "Макет дашборду збережено.",
    },
    { status: existing ? 200 : 201 },
  );
}
