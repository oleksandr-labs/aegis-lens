/**
 * GET /api/v1/search — Hybrid search endpoint.
 *
 * Supersedes the thin alias that previously re-exported /api/search/route.
 *
 * Query params:
 *   q           — search query (required)
 *   locale      — "en" | "uk" | "ru"  (default: "en")
 *   limit       — max hits  (default: 20, max: 50)
 *   offset      — pagination offset  (default: 0)
 *   eventTypes  — comma-separated event class names
 *   from        — ISO 8601 datetime lower bound
 *   to          — ISO 8601 datetime upper bound
 *
 * Flow:
 *   1. Expand synonyms & transliteration variants.
 *   2. Fan-out to hybrid search (Elastic + Qdrant + PostGIS stubs).
 *   3. Log query to searchAnalyticsStore.
 *   4. Return HybridSearchResult JSON.
 *
 * Sprint 2.70 — Hybrid retrieval + search analytics.
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { hybridSearch } from "@/lib/search/hybrid-search";
import { expandSynonyms } from "@/lib/search/synonym-dictionary";
import { normalizeQuery } from "@/lib/search/transliteration";
import { searchAnalyticsStore } from "@/lib/search/search-analytics";
import type { SearchQuery } from "@/lib/search/hybrid-search";
import type { CustomTimeRange } from "@/lib/search/advanced-filters";
import type { SearchQueryLog } from "@/lib/search/search-analytics";

export const dynamic = "force-dynamic";

const MAX_LIMIT = 50;

function randomId(): string {
  // crypto.randomUUID is available in Node 14.17+ / Edge runtime.
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function GET(req: Request): Promise<NextResponse> {
  const ip = identifyRequest(req);
  const rl = rateLimit(`v1:search:${ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many requests." },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(rl),
          "Retry-After": String(rl.resetSeconds),
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json(
      { error: "bad_request", message: "Query parameter 'q' is required." },
      {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*", ...rateLimitHeaders(rl) },
      },
    );
  }

  const locale = (url.searchParams.get("locale") ?? "en") as "en" | "uk" | "ru";
  const limit = Math.min(
    Math.max(1, Number(url.searchParams.get("limit") ?? 20)),
    MAX_LIMIT,
  );
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0));
  const eventTypesRaw = url.searchParams.get("eventTypes");
  const eventTypes = eventTypesRaw
    ? eventTypesRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");
  let timeRange: CustomTimeRange | undefined;
  if (fromParam || toParam) {
    timeRange = {
      from: fromParam ?? "",
      to: toParam ?? "",
      isRelative: false,
    };
  }

  // ── Synonym + transliteration expansion ───────────────────────────────────
  const synonymLocale = locale === "ru" ? "ru" : locale === "uk" ? "uk" : "en";
  const synonymExpanded = expandSynonyms(q, synonymLocale);
  const translitVariants = normalizeQuery(q, locale === "uk" ? "uk" : "en");

  // Merge all expanded terms into a unique set.
  const allExpanded = Array.from(
    new Set([q, ...synonymExpanded, ...translitVariants]),
  ).filter(Boolean);

  // Build the primary query text: join expanded terms for Elastic BM25.
  const expandedText = allExpanded.join(" ");

  // ── Hybrid search ─────────────────────────────────────────────────────────
  const searchQuery: SearchQuery = {
    text: expandedText,
    locale,
    eventTypes,
    timeRange,
    limit,
    offset,
  };

  const result = await hybridSearch.search(searchQuery, allExpanded.slice(1));

  // ── Analytics logging ──────────────────────────────────────────────────────
  // Derive a best-effort session id from the IP + user-agent hash.
  const ua = req.headers.get("user-agent") ?? "";
  const sessionId = `${ip}:${ua.slice(0, 20)}`;

  const logEntry: SearchQueryLog = {
    queryId: randomId(),
    query: q,
    locale,
    resultCount: result.total,
    wasZeroResult: result.total === 0,
    sessionId,
    timestamp: new Date().toISOString(),
  };
  searchAnalyticsStore.log(logEntry);

  // ── Response ──────────────────────────────────────────────────────────────
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "private, no-store",
      "Access-Control-Allow-Origin": "*",
      ...rateLimitHeaders(rl),
    },
  });
}
