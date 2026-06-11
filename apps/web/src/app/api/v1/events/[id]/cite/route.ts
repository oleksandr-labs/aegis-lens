'use server'
/**
 * GET /api/v1/events/[id]/cite
 *
 * Returns a citation block for a given event in the requested format.
 * Query param: ?format=APA|MLA|Chicago|ISO690|plain  (default: APA)
 *
 * Повертає блок цитування для події у заданому форматі.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  buildCitation,
  CITATION_NOTE_EN,
  CITATION_NOTE_UK,
  type CitationFormat,
  type CitableEvent,
} from "@/lib/growth/citation-generator";

const VALID_FORMATS: CitationFormat[] = [
  "APA",
  "MLA",
  "Chicago",
  "ISO690",
  "plain",
];

/**
 * Minimal stub that resolves an event from storage.
 * Replace with real DB / cache lookup in production.
 *
 * Заглушка: замінити на реальний запит до БД.
 */
async function resolveEvent(id: string): Promise<CitableEvent | null> {
  // TODO: replace with actual event store lookup
  void id;
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const { id } = params;
  const rawFormat = req.nextUrl.searchParams.get("format") ?? "APA";
  const locale = req.nextUrl.searchParams.get("locale") ?? "en";

  const format = rawFormat.toUpperCase() as CitationFormat;
  if (!VALID_FORMATS.includes(format)) {
    return NextResponse.json(
      {
        error: `Invalid format. Supported: ${VALID_FORMATS.join(", ")}.`,
      },
      { status: 400 },
    );
  }

  const event = await resolveEvent(id);
  if (!event) {
    return NextResponse.json(
      { error: `Event "${id}" not found.` },
      { status: 404 },
    );
  }

  const citation = buildCitation(event, format);
  const note = locale === "uk" ? CITATION_NOTE_UK : CITATION_NOTE_EN;

  return NextResponse.json({
    eventId: id,
    format,
    citation,
    note,
  });
}
