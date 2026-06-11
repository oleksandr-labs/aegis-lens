/**
 * POST /api/v1/export/parquet — Submit a Parquet bulk export job.
 * GET  /api/v1/export/parquet?jobId= — Poll job status.
 *
 * POST /api/v1/export/parquet — Подача завдання масового Parquet-експорту.
 * GET  /api/v1/export/parquet?jobId= — Опитування статусу завдання.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  parquetQueue,
  PARQUET_DEFAULTS,
  type ParquetExportConfig,
} from "@/lib/export/parquet";

export const dynamic = "force-dynamic";

/** POST — submit a new Parquet export job */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Partial<ParquetExportConfig>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid JSON body",
        error_uk: "Некоректне тіло JSON",
      },
      { status: 400 },
    );
  }

  const { datasetId, fromDate, toDate, fields } = body;

  if (!datasetId || !fromDate || !toDate || !Array.isArray(fields) || fields.length === 0) {
    return NextResponse.json(
      {
        error: "Required fields: datasetId, fromDate, toDate, fields[]",
        error_uk: "Обов'язкові поля: datasetId, fromDate, toDate, fields[]",
      },
      { status: 400 },
    );
  }

  const config: ParquetExportConfig = {
    datasetId,
    fromDate,
    toDate,
    fields,
    compressionCodec: body.compressionCodec ?? PARQUET_DEFAULTS.compressionCodec,
    maxRowsPerFile: body.maxRowsPerFile ?? PARQUET_DEFAULTS.maxRowsPerFile,
  };

  const job = parquetQueue.submit(config);

  return NextResponse.json(job, { status: 202 });
}

/** GET — poll status of a Parquet export job */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const jobId = req.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    // List recent jobs
    const jobs = parquetQueue.listJobs(20);
    return NextResponse.json({ jobs });
  }

  const job = parquetQueue.getStatus(jobId);
  if (!job) {
    return NextResponse.json(
      {
        error: `Job not found: ${jobId}`,
        error_uk: `Завдання не знайдено: ${jobId}`,
      },
      { status: 404 },
    );
  }

  return NextResponse.json(job);
}
