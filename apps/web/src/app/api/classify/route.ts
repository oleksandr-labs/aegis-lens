import { NextResponse } from "next/server";
import { classifyText, extractCoords, extractEntities } from "@/lib/classifier";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

/**
 * POST /api/classify
 *
 * Accepts:
 *   - JSON `{ "text": "..." }`
 *   - or `multipart/form-data` / `application/x-www-form-urlencoded` with a `text` field.
 *
 * Returns `{ classification, entities, coords }` — see `@/lib/classifier`.
 * Rate-limited to 30 requests / minute / IP. CORS-open (intended for
 * external programmatic use).
 */
export const dynamic = "force-dynamic";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

async function readText(req: Request): Promise<string> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as { text?: unknown };
    return typeof body.text === "string" ? body.text : "";
  }
  if (ct.includes("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
    const fd = await req.formData().catch(() => null);
    const v = fd?.get("text");
    return typeof v === "string" ? v : "";
  }
  // Fall back: attempt JSON for clients that omit Content-Type.
  const body = (await req.json().catch(() => ({}))) as { text?: unknown };
  return typeof body.text === "string" ? body.text : "";
}

export async function POST(req: Request) {
  const ipKey = `classify:${identifyRequest(req)}`;
  const rl = rateLimit(ipKey, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many classify requests. Try again shortly." },
      {
        status: 429,
        headers: {
          ...CORS_HEADERS,
          ...rateLimitHeaders(rl),
          "Retry-After": String(rl.resetSeconds),
        },
      },
    );
  }

  const text = (await readText(req)).trim();
  if (!text) {
    return NextResponse.json(
      { error: "bad_request", message: "Missing `text` field." },
      { status: 400, headers: { ...CORS_HEADERS, ...rateLimitHeaders(rl) } },
    );
  }

  const classification = classifyText(text);
  const entities = extractEntities(text);
  const coords = extractCoords(text);

  return NextResponse.json(
    { classification, entities, coords },
    {
      headers: {
        "Cache-Control": "no-store",
        ...CORS_HEADERS,
        ...rateLimitHeaders(rl),
      },
    },
  );
}
