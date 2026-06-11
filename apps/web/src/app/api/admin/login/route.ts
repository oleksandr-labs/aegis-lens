import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-gate";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData();
  const token = String(form.get("token") ?? "");
  const expected = process.env.ADMIN_TOKEN;

  if (!expected || token !== expected) {
    // Generic message — don't leak whether token was unset vs wrong.
    return NextResponse.redirect(new URL("/admin?e=invalid", req.url), { status: 303 });
  }

  const res = NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: req.url.startsWith("https://"),
    path: "/admin",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
