import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

/**
 * POST /api/contact
 * FormData: { name, email, message, reason }
 *
 * Stub: validates the inputs, rate-limits per IP (3/min), and redirects
 * back to /contact with a status query param. Real delivery lands later.
 */
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_REASONS = new Set(["General", "Sales", "Press", "Security", "Abuse"]);

function noStore(extra: Record<string, string> = {}): HeadersInit {
  return { "Cache-Control": "no-store", ...extra };
}

function redirectTo(req: Request, path: string, headers: HeadersInit): Response {
  const url = new URL(path, req.url);
  return NextResponse.redirect(url, { status: 303, headers });
}

type ContactInput = {
  name: string;
  email: string;
  message: string;
  reason: string;
};

async function readBody(req: Request): Promise<ContactInput> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const j = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    return {
      name: typeof j.name === "string" ? j.name.trim() : "",
      email: typeof j.email === "string" ? j.email.trim() : "",
      message: typeof j.message === "string" ? j.message.trim() : "",
      reason: typeof j.reason === "string" ? j.reason.trim() : "",
    };
  }
  const form = await req.formData().catch(() => null);
  if (!form) return { name: "", email: "", message: "", reason: "" };
  return {
    name: String(form.get("name") ?? "").trim(),
    email: String(form.get("email") ?? "").trim(),
    message: String(form.get("message") ?? "").trim(),
    reason: String(form.get("reason") ?? "").trim(),
  };
}

export async function POST(req: Request) {
  const ipKey = `contact:${identifyRequest(req)}`;
  const rl = rateLimit(ipKey, 3, 60_000); // 3 req / min / IP
  if (!rl.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "rate_limited",
        message: "Too many messages. Please try again in a moment.",
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

  const { name, email, message, reason } = await readBody(req);

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return redirectTo(req, "/contact?status=invalid", noStore(rateLimitHeaders(rl)));
  }
  if (!name || name.length > 200) {
    return redirectTo(req, "/contact?status=invalid", noStore(rateLimitHeaders(rl)));
  }
  if (!message || message.length < 2 || message.length > 5000) {
    return redirectTo(req, "/contact?status=invalid", noStore(rateLimitHeaders(rl)));
  }
  if (reason && !VALID_REASONS.has(reason)) {
    return redirectTo(req, "/contact?status=invalid", noStore(rateLimitHeaders(rl)));
  }

  // Real delivery (queue → CRM / email) lands in Sprint 2.x.
  return redirectTo(req, "/contact?status=sent", noStore(rateLimitHeaders(rl)));
}
