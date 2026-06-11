import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

/**
 * POST /api/subscribe
 * body: { email: string, topics?: string[] }
 *
 * Stub: validates the email shape, rate-limits per IP, and returns
 * { ok: true, queued: email }. No backend delivery yet — that lands in
 * Sprint 2.x. Accepts both JSON and form-encoded bodies so the public
 * /alerts page can POST without JS.
 */
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function noStore(extra: Record<string, string> = {}): HeadersInit {
  return { "Cache-Control": "no-store", ...extra };
}

async function readBody(
  req: Request,
): Promise<{ email: string; topics: string[] }> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const j = (await req.json().catch(() => ({}))) as {
      email?: unknown;
      topics?: unknown;
    };
    const topics = Array.isArray(j.topics)
      ? j.topics.filter((t): t is string => typeof t === "string")
      : [];
    return {
      email: typeof j.email === "string" ? j.email.trim() : "",
      topics,
    };
  }
  const form = await req.formData().catch(() => null);
  if (!form) return { email: "", topics: [] };
  const email = String(form.get("email") ?? "").trim();
  const topics = form
    .getAll("topics")
    .map((v) => String(v))
    .filter(Boolean);
  return { email, topics };
}

export async function POST(req: Request) {
  const ipKey = `subscribe:${identifyRequest(req)}`;
  const rl = rateLimit(ipKey, 5, 60_000); // 5 req / min / IP
  if (!rl.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "rate_limited",
        message: "Too many subscription attempts. Try again in a moment.",
      },
      {
        status: 429,
        headers: noStore({
          ...rateLimitHeaders(rl),
          "Retry-After": String(rl.resetSeconds),
        }),
      },
    );
  }

  const { email, topics } = await readBody(req);

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "invalid_email" },
      { status: 400, headers: noStore(rateLimitHeaders(rl)) },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      queued: email,
      topics,
      note: "Email delivery launches Sprint 2.x — your address is queued.",
    },
    { headers: noStore(rateLimitHeaders(rl)) },
  );
}
