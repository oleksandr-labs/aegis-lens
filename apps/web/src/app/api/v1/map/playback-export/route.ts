/**
 * POST /api/v1/map/playback-export — queue a playback export job (MP4 / GIF)
 * GET  /api/v1/map/playback-export — list all export jobs
 *
 * POST /api/v1/map/playback-export — постановка завдання експорту відтворення (MP4 / GIF)
 * GET  /api/v1/map/playback-export — список усіх завдань експорту
 *
 * Enterprise-tier feature. Caller must have a valid session with an
 * enterprise-level credits-wallet tier.
 */

import { NextResponse } from "next/server";
import {
  playbackExportQueue,
  type PlaybackExportConfig,
} from "@/lib/map/playback-export";

export const dynamic = "force-dynamic";

const ALLOWED_FORMATS = ["mp4", "gif"] as const;
const ALLOWED_RESOLUTIONS = ["720p", "1080p", "4k"] as const;

export async function GET() {
  const jobs = playbackExportQueue.list();
  return NextResponse.json(
    { data: jobs },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request body must be JSON." },
      { status: 400 },
    );
  }

  // Basic validation
  const { fromDate, toDate, format, fps, speedMultiplier, resolution } = body as Partial<PlaybackExportConfig>;

  if (!fromDate || !toDate) {
    return NextResponse.json(
      { error: "validation_error", message: "fromDate and toDate are required ISO strings." },
      { status: 422 },
    );
  }

  if (!format || !ALLOWED_FORMATS.includes(format as typeof ALLOWED_FORMATS[number])) {
    return NextResponse.json(
      { error: "validation_error", message: `format must be one of: ${ALLOWED_FORMATS.join(", ")}.` },
      { status: 422 },
    );
  }

  if (!resolution || !ALLOWED_RESOLUTIONS.includes(resolution as typeof ALLOWED_RESOLUTIONS[number])) {
    return NextResponse.json(
      {
        error: "validation_error",
        message: `resolution must be one of: ${ALLOWED_RESOLUTIONS.join(", ")}.`,
      },
      { status: 422 },
    );
  }

  if (typeof fps !== "number" || fps < 1 || fps > 60) {
    return NextResponse.json(
      { error: "validation_error", message: "fps must be a number between 1 and 60." },
      { status: 422 },
    );
  }

  if (typeof speedMultiplier !== "number" || speedMultiplier <= 0) {
    return NextResponse.json(
      { error: "validation_error", message: "speedMultiplier must be a positive number." },
      { status: 422 },
    );
  }

  const config: PlaybackExportConfig = {
    fromDate: fromDate as string,
    toDate: toDate as string,
    region: typeof body["region"] === "string" ? body["region"] : undefined,
    format: format as PlaybackExportConfig["format"],
    fps,
    speedMultiplier,
    resolution: resolution as PlaybackExportConfig["resolution"],
  };

  const job = playbackExportQueue.enqueue(config);

  return NextResponse.json(
    { data: job },
    {
      status: 202,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
