import { NextResponse } from "next/server";
import { GLOSSARY } from "@/lib/seed-data";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ipKey = `glossary:${identifyRequest(req)}`;
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
  const q = url.searchParams.get("q");

  let data = GLOSSARY;
  if (q && q.trim().length > 0) {
    const needle = q.trim().toLowerCase();
    data = data.filter(
      (g) =>
        g.slug.toLowerCase().includes(needle) ||
        g.term.en.toLowerCase().includes(needle),
    );
  }

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
