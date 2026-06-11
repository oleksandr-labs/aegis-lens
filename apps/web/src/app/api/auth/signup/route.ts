import { NextResponse } from "next/server";
import { SESSION_COOKIE, randomHex } from "@/lib/account";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_AGE_30D = 60 * 60 * 24 * 30;

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const name = ((form?.get("name") as string) ?? "").trim();
  const email = ((form?.get("email") as string) ?? "").trim();

  if (!name || !EMAIL_RE.test(email)) {
    return NextResponse.redirect(new URL("/signup?error=invalid", req.url), {
      status: 303,
    });
  }

  // stub: real auth lands Sprint 3.x
  const res = NextResponse.redirect(new URL("/account", req.url), { status: 303 });
  res.cookies.set(SESSION_COOKIE, `sess_${randomHex(16)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_30D,
  });
  return res;
}
