/**
 * GET  /api/v1/dashboard/subscriptions — list subscriptions for a user
 * POST /api/v1/dashboard/subscriptions — create or update a subscription
 *
 * GET  /api/v1/dashboard/subscriptions — список підписок користувача
 * POST /api/v1/dashboard/subscriptions — створити або оновити підписку
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  subscriptionStore,
  DEFAULT_FREQUENCY,
} from "@/lib/dashboard/subscription-delivery";
import type {
  ReportType,
  SubscriptionDeliveryChannel,
  DeliveryFrequency,
} from "@/lib/dashboard/subscription-delivery";

export const dynamic = "force-dynamic";

const VALID_REPORT_TYPES: ReportType[] = [
  "morning_brief",
  "weekly_digest",
  "incident_alert",
  "regional_brief",
];

const VALID_CHANNELS: SubscriptionDeliveryChannel[] = ["email", "slack", "telegram"];
const VALID_FREQUENCIES: DeliveryFrequency[] = ["immediate", "daily", "weekly"];

// ── GET ───────────────────────────────────────────────────────────────────────

export function GET(req: NextRequest): NextResponse {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      {
        error: "Missing required query parameter: userId",
        note_en: "Pass ?userId=<id> to list subscriptions for a user.",
        note_uk: "Передайте ?userId=<id> для перегляду підписок користувача.",
      },
      { status: 400 },
    );
  }

  const subscriptions = subscriptionStore.listByUser(userId);
  return NextResponse.json(
    { subscriptions, count: subscriptions.length },
    { status: 200 },
  );
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  // Validate userId
  if (typeof data.userId !== "string" || !data.userId) {
    return NextResponse.json(
      { error: "userId (string) is required" },
      { status: 422 },
    );
  }

  // Validate reportType
  if (
    typeof data.reportType !== "string" ||
    !VALID_REPORT_TYPES.includes(data.reportType as ReportType)
  ) {
    return NextResponse.json(
      {
        error: `reportType must be one of: ${VALID_REPORT_TYPES.join(", ")}`,
      },
      { status: 422 },
    );
  }

  // Validate channels
  if (!Array.isArray(data.channels) || data.channels.length === 0) {
    return NextResponse.json(
      { error: `channels must be a non-empty array. Valid values: ${VALID_CHANNELS.join(", ")}` },
      { status: 422 },
    );
  }

  for (const ch of data.channels as unknown[]) {
    if (!VALID_CHANNELS.includes(ch as SubscriptionDeliveryChannel)) {
      return NextResponse.json(
        { error: `Invalid channel "${ch}". Valid: ${VALID_CHANNELS.join(", ")}` },
        { status: 422 },
      );
    }
  }

  const reportType = data.reportType as ReportType;
  const frequency: DeliveryFrequency =
    typeof data.frequency === "string" &&
    VALID_FREQUENCIES.includes(data.frequency as DeliveryFrequency)
      ? (data.frequency as DeliveryFrequency)
      : DEFAULT_FREQUENCY[reportType];

  const subscription = subscriptionStore.upsert({
    subscriptionId:
      typeof data.subscriptionId === "string" ? data.subscriptionId : undefined,
    userId: data.userId as string,
    reportType,
    channels: data.channels as SubscriptionDeliveryChannel[],
    frequency,
    enabled: data.enabled !== false,
  });

  return NextResponse.json(
    {
      ok: true,
      subscription,
      note_en: "Subscription saved. Deliveries will begin at the next scheduled run.",
      note_uk: "Підписку збережено. Доставки розпочнуться під час наступного запланованого запуску.",
    },
    { status: 200 },
  );
}
