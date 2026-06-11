import { NextResponse } from "next/server";
import { SESSION_COOKIE, randomHex } from "@/lib/account";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_AGE_30D = 60 * 60 * 24 * 30;

function safeNext(value: string | null): string {
  if (!value) return "/account";
  // Only allow internal redirects.
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/account";
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const email = ((form?.get("email") as string) ?? "").trim();
  const next = safeNext((form?.get("next") as string) ?? null);

  if (!EMAIL_RE.test(email)) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url), {
      status: 303,
    });
  }

  // stub: real auth lands Sprint 3.x
  const res = NextResponse.redirect(new URL(next, req.url), { status: 303 });
  res.cookies.set(SESSION_COOKIE, `sess_${randomHex(16)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_30D,
  });
  return res;
}
