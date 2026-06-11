import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-gate";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/admin", req.url), { status: 303 });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/admin", maxAge: 0 });
  return res;
}
