/**
 * GET /api/v1/data/pipeline
 *
 * Returns the full catalog of Aegis Lens pipeline stage configurations.
 * Describes all 6 pipeline stages from raw ingestion to serving,
 * including Kafka topics, orchestration engines, and implementation notes.
 *
 * Повертає повний каталог конфігурацій етапів пайплайну Aegis Lens.
 * Описує всі 6 етапів від сирої інгестії до подачі, включаючи
 * Kafka-топіки, рушії оркестрації та нотатки реалізації.
 */

import { NextRequest, NextResponse } from "next/server";
import { PIPELINE_STAGES } from "../../../../../lib/data/pipeline-config";

export const dynamic = "force-dynamic";

export function GET(_req: NextRequest): NextResponse {
  return NextResponse.json(
    {
      object: "list",
      count: PIPELINE_STAGES.length,
      data: PIPELINE_STAGES,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
        "Aegis-API-Version": "v1",
      },
    },
  );
}
