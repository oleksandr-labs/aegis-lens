'use server'
/**
 * POST /api/v1/timeline/share
 *
 * Creates a shareable timeline playback link.
 * Returns the share config including the token and expiry date.
 *
 * Створює посилання для перегляду таймлайну. Повертає конфіг і токен.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  timelineShareStore,
  buildTimelineShareUrl,
  type TimelineShareParams,
} from "@/lib/growth/timeline-share";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Partial<TimelineShareParams>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { startDate, endDate, aoiId, category, playbackSpeed, createdBy } =
    body;

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "startDate and endDate are required." },
      { status: 422 },
    );
  }

  // Validate ISO-8601 dates
  if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
    return NextResponse.json(
      { error: "startDate and endDate must be valid ISO-8601 strings." },
      { status: 422 },
    );
  }

  if (new Date(startDate) >= new Date(endDate)) {
    return NextResponse.json(
      { error: "startDate must be before endDate." },
      { status: 422 },
    );
  }

  const share = timelineShareStore.create({
    startDate,
    endDate,
    aoiId,
    category,
    playbackSpeed,
    createdBy,
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://aegislens.uk";
  const shareUrl = buildTimelineShareUrl(baseUrl, {
    startDate,
    endDate,
    aoiId,
    category,
    playbackSpeed,
    createdBy,
  });

  return NextResponse.json(
    {
      token: share.token,
      expiresAt: share.expiresAt,
      url: shareUrl,
    },
    { status: 201 },
  );
}
