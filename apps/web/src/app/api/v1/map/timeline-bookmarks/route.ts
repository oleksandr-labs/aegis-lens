/**
 * GET /api/v1/map/timeline-bookmarks  — list all bookmarks
 * POST /api/v1/map/timeline-bookmarks — create a bookmark
 *
 * GET /api/v1/map/timeline-bookmarks  — список усіх закладок
 * POST /api/v1/map/timeline-bookmarks — створення закладки
 */

import { NextResponse } from "next/server";
import { bookmarkStore } from "@/lib/map/timeline-bookmarks";

export const dynamic = "force-dynamic";

export async function GET() {
  const bookmarks = bookmarkStore.list();
  const chapters = bookmarkStore.getChapters();
  return NextResponse.json(
    { data: { bookmarks, chapters } },
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

  const timestamp = body["timestamp"];
  const label = body["label"];
  const labelUk = body["labelUk"];

  if (
    typeof timestamp !== "string" ||
    typeof label !== "string" ||
    typeof labelUk !== "string"
  ) {
    return NextResponse.json(
      {
        error: "validation_error",
        message: "Required fields: timestamp (ISO string), label (EN), labelUk (UK).",
      },
      { status: 422 },
    );
  }

  const bookmark = bookmarkStore.add({
    timestamp,
    label,
    labelUk,
    color: typeof body["color"] === "string" ? body["color"] : undefined,
    notebookId:
      typeof body["notebookId"] === "string" ? body["notebookId"] : undefined,
  });

  return NextResponse.json(
    { data: bookmark },
    {
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
