/**
 * POST /api/v1/reports/:id/deliver
 *
 * Triggers multi-channel delivery for a published report.
 * Also serves as the enterprise API-pull endpoint (channel: api_pull).
 *
 * Body: { channels: ReportDeliveryChannel[], recipientUserIds?: string[], triggerType?: string }
 *
 * POST /api/v1/reports/:id/deliver
 * Запускає багатоканальну доставку для опублікованого звіту.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  reportDeliveryQueue,
  type ReportDeliveryChannel,
} from "../../../../../../lib/reports/delivery";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const reportId = params.id;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const channels = (body.channels as ReportDeliveryChannel[] | undefined) ?? [
    "email",
  ];
  const recipientUserIds = (body.recipientUserIds as string[] | undefined) ?? [];
  const triggerType = (body.triggerType as string | undefined) ?? "manual";

  if (!reportId) {
    return NextResponse.json({ error: "Report ID required" }, { status: 400 });
  }

  const job = reportDeliveryQueue.enqueue({
    reportId,
    channels,
    recipientUserIds,
    triggerType: triggerType as "on_publish" | "scheduled" | "manual",
  });

  return NextResponse.json(
    { jobId: job.jobId, status: job.status, channels: job.config.channels },
    {
      status: 202,
      headers: {
        "Aegis-API-Version": "v1",
        "Content-Type": "application/json",
      },
    },
  );
}
