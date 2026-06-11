/**
 * GET /api/v1/taxonomy/clusters
 * Returns all 16 topic clusters with the quarterly build schedule.
 * Cached for 24 hours.
 */

import { NextResponse } from "next/server";
import {
  TOPIC_CLUSTERS,
  CLUSTER_BUILD_SCHEDULE_EN,
  CLUSTER_BUILD_SCHEDULE_UK,
} from "@/lib/taxonomy/topic-clusters";

export const dynamic = "force-static";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      clusters: TOPIC_CLUSTERS,
      buildSchedule: {
        en: CLUSTER_BUILD_SCHEDULE_EN,
        uk: CLUSTER_BUILD_SCHEDULE_UK,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
