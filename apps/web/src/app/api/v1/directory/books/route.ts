/**
 * GET /api/v1/directory/books
 *
 * Returns book topic configuration and seed profile list.
 * Query parameters:
 *   ?topic=<BookTopic>    — filter by topic
 *   ?format=<BookFormat>  — filter by format
 *   ?free=true            — return only free / open-access books
 *   ?verified=true        — return only verified books
 *
 * Повертає конфігурацію тематик книг та список seed-профілів.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  BOOK_PROFILES,
  type BookTopic,
  type BookFormat,
} from "../../../../../lib/directory/books";

export const dynamic = "force-dynamic";

const VALID_TOPICS: BookTopic[] = [
  "osint-field-guide",
  "conflict-history",
  "intelligence-tradecraft",
  "disinformation",
  "cyber-warfare",
  "satellite-imaging",
  "investigative-journalism",
  "war-crimes",
  "geopolitics",
];

const VALID_FORMATS: BookFormat[] = [
  "paperback",
  "ebook",
  "audiobook",
  "open-access-pdf",
];

export function GET(req: NextRequest): NextResponse {
  const url = new URL(req.url);
  const topicParam = url.searchParams.get("topic") as BookTopic | null;
  const formatParam = url.searchParams.get("format") as BookFormat | null;
  const freeParam = url.searchParams.get("free");
  const verifiedParam = url.searchParams.get("verified");

  if (topicParam && !VALID_TOPICS.includes(topicParam)) {
    return NextResponse.json(
      {
        error: "invalid_param",
        message: `topic must be one of: ${VALID_TOPICS.join(", ")}`,
      },
      { status: 400 },
    );
  }

  if (formatParam && !VALID_FORMATS.includes(formatParam)) {
    return NextResponse.json(
      {
        error: "invalid_param",
        message: `format must be one of: ${VALID_FORMATS.join(", ")}`,
      },
      { status: 400 },
    );
  }

  let data = BOOK_PROFILES;

  if (topicParam) {
    data = data.filter((b) => b.topic.includes(topicParam));
  }

  if (formatParam) {
    data = data.filter((b) => b.format.includes(formatParam));
  }

  if (freeParam === "true") {
    data = data.filter((b) => b.free);
  }

  if (verifiedParam === "true") {
    data = data.filter((b) => b.verified);
  }

  return NextResponse.json(
    {
      object: "list",
      count: data.length,
      filters: {
        topic: topicParam ?? null,
        format: formatParam ?? null,
        free: freeParam === "true" ? true : null,
        verified: verifiedParam === "true" ? true : null,
      },
      validTopics: VALID_TOPICS,
      validFormats: VALID_FORMATS,
      data,
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
