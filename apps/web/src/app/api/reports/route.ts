import { NextResponse } from "next/server";
import { listReports } from "@/lib/reports-seed";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 20;

export async function GET(req: Request) {
  const ipKey = `reports:${identifyRequest(req)}`;
  const rl = rateLimit(ipKey, 60, 60_000);
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
  const limitRaw = url.searchParams.get("limit");
  let limit = limitRaw ? parseInt(limitRaw, 10) : DEFAULT_LIMIT;
  if (!Number.isFinite(limit) || limit <= 0) limit = DEFAULT_LIMIT;

  const data = listReports()
    .slice(0, limit)
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      kind: r.kind,
      publishedAt: r.publishedAt,
      author: r.author,
      summary: r.summary,
      citations: r.citations,
    }));

  return NextResponse.json(
    { data },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
