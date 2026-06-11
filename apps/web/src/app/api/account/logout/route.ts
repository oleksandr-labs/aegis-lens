import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/account";

export const dynamic = "force-dynamic";

function clearAndRedirect(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url), { status: 303 });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

export async function POST(req: Request) {
  return clearAndRedirect(req);
}

// GET fallback so an <a href="/api/account/logout"> link works too.
export async function GET(req: Request) {
  return clearAndRedirect(req);
}
